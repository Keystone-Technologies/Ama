package Ama::Model::Comments;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $comment, $username) = @_;
  my $sql = 'insert into comments (question_id, comment, username) values (?, ?, ?) returning id';
  return $self->pg->db->query($sql, $comment->{question_id}, $comment->{comment}, $username)->hash->{id};
}

sub all { shift->pg->db->query(q[
  select
    comments.id,
    comments.question_id,
    comment,
    to_char(comments.created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(comments.modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    comments.username,
    case when answer is not null then comment else null end as answer,
    comments.answer as answered_by,
    answered,
    votes('comments', comments.id) as votes
  from comments
  where question_id = ?
  group by comments.id
  order by 7,votes desc,4
], @_)->hashes->to_array }

sub find { shift->pg->db->query('select * from comments where id = ?', shift)->hash }

sub remove { shift->pg->db->query('delete from comments where id = ?', shift) }

sub save {
  my ($self, $id, $comment) = @_;
  warn Data::Dumper::Dumper($comment);
  my $sql = 'update comments set comment = ?, modified = now() where id = ?';
  $self->pg->db->query($sql, $comment->{comment}, $id);
}

sub answer {
  my ($self, $question_id, $id, $answer, $username) = @_;
  $self->pg->db->query('update comments set answered=null where question_id = ?', $question_id);
  if ( $answer ) {
    my $sql = 'update comments set answer = ?, answered = now() where id = ?';
    $self->pg->db->query($sql, $username, $id);
  }
}

1;
