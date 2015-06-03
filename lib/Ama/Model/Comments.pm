package Ama::Model::Comments;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $comment, $username) = @_;
  my $sql = 'insert into comments (question_id, comment, $username) values (?, ?, ?) returning id';
  return $self->pg->db->query($sql, $comment->{question_id}, $comment->{comment}, $username)->hash->{id};
}

sub all { shift->pg->db->query(q[
  select
    comments.id,
    comments.question_id,
    comment,
    comments.created, 
    comments.modified,
    comments.username,
    case when answer is not null then comment else null end as answer,
    comments.answer as answered_by,
    answered,
    SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up,
    SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down,
    SUM(CASE WHEN vote = 'up' THEN 1 ELSE -1 END) as votes
  from comments
    left join votes on comments.id=votes.entry_id and votes.entry_type='comments'
  where question_id = ?
  group by comments.id
  order by 7,votes desc,comments.created
], @_)->hashes->to_array }

sub find { shift->pg->db->query('select * from comments where id = ?', shift)->hash }

sub remove { shift->pg->db->query('delete from comments where id = ?', shift) }

sub save {
  my ($self, $id, $comment) = @_;
  my $sql = 'update comments set comment = ?, modified = now() where id = ?';
  $self->pg->db->query($sql, $comment->{comment}, $id);
}

sub answer {
  my ($self, $id, $answer, $username) = @_;
  $self->pg->db->query('update comments set answered_by=null,answered=null where id = ?', $id);
  if ( $answer ) {
    my $sql = 'update comments set answered_by = ?, answered = now() where id = ?';
    $self->pg->db->query($sql, $username, $id);
  }
}

1;
