package Ama::Model::Comments;
use Mojo::Base -base;

use Ama::Model::Votes;

has 'pg';
has 'username';
has 'admin';
has 'votes' => sub {
  my $self = shift;
  state $votes = Ama::Model::Votes->new(pg => $self->pg, username => $self->username);
};

sub add {
  my ($self, $question_id, $comment, $video_link) = @_;
  my $results = eval {
    my $tx = $self->pg->db->begin;
    my $sql = 'insert into comments (question_id, comment, username, video_link) select ?, ?, ?, ? where not answered(?) returning *';
    my $results = $self->pg->db->query($sql, $question_id, $comment, $self->username, $video_link, $question_id)->hash;
    $self->votes->username($self->username);
    $self->votes->cast('comments', $results->{comment_id}, 'up');
    $tx->commit;
    $results;
  };
  $@ ? {error => $@} : $results;
}

sub all {
  my $self = shift;
  $self->pg->db->query(q[
  select
    comments.comment_id,
    comments.question_id,
    comment,
    video_link,
    to_char(comments.created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(comments.modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    comments.username as username,
    votes('comments',comments.comment_id) votes,
    (select vote from votes where entry_type = 'comments' and entry_id = comments.comment_id and username = ?) as my_vote,
    flagged('comments',comments.comment_id) flagged,
    case when answers.username is not null then 1 else 0 end as answered,
    answers.username as approver,
    answers.created as approved
  from
    comments
  left join
    answers on comments.comment_id=answers.comment_id
  where
    comments.question_id = ?
  group by comments.comment_id,answers.username,answers.created
  order by 10 desc,votes desc,4
], $self->username, @_)->hashes->to_array }

sub find { shift->pg->db->query('select * from comments where id = ?', shift)->hash }

sub remove {
  my ($self, $comment_id) = @_;
  my $results = eval {
    my $sql = 'delete from comments where comment_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $comment_id, $self->username)->hash;
  };
  $@ ? {error => $@} : $results;
}

sub save {
  my ($self, $comment_id, $comment) = @_;
  my $results = eval {
    my $sql = 'update comments set comment = ?, modified = now() where comment_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $comment, $comment_id, $self->username)->hash;
  };
  $@ ? {error => $@} : $results;
}

1;
