package Ama::Model::Comments;
use Mojo::Base -base;

has 'pg';
has 'username';

sub add {
  my ($self, $question_id, $comment) = @_;
  my $sql = 'insert into comments (question_id, comment, username) values (?, ?, ?) returning *';
  return $self->pg->db->query($sql, $question_id, $comment, $self->username)->hash;
}

sub all {
  my $self = shift;
  $self->pg->db->query(q[
  select
    comments.id as comment_id,
    comments.question_id,
    comment,
    to_char(comments.created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(comments.modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    comments.username as username,
    votes('comments',comments.id) votes,
    (select vote from votes where entry_type = 'comments' and entry_id = comments.id and username = ?) as my_vote,
    flagged('comments',comments.id) flagged,
    case when answers.username is not null then 1 else 0 end as answer,
    answers.username as approver,
    answers.created as approved
  from
    comments
  left join
    answers on comments.id=answers.comment_id
  where
    comments.question_id = ?
  group by comments.id,answers.username,answers.created
  order by 10 desc,votes desc,4
], $self->username, @_)->hashes->to_array }

sub find { shift->pg->db->query('select * from comments where id = ?', shift)->hash }

sub remove {
  my ($self, $id) = @_;
  my $sql = 'delete from comments where id = ? and username = ? and answered(question_id) != 1 returning *';
  $self->pg->db->query($sql, $id, $self->username)->hash;
}

sub save {
  my ($self, $id, $comment) = @_;
  my $sql = 'update comments set comment = ?, modified = now() where id = ? and username = ? and answered(?) != 1 returning *';
  $self->pg->db->query($sql, $comment, $id, $self->username)->hash;
}

1;
