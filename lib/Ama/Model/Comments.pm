package Ama::Model::Comments;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $comment, $username) = @_;
  my $sql = 'insert into comments (question_id, comment, $username) values (?, ?, ?) returning id';
  return $self->pg->db->query($sql, $comment->{question_id}, $comment->{comment}, $username)->hash->{id};
}

sub all { shift->pg->db->query('select * from comments where question_id = ? order by answered,created', @_)->hashes->to_array }

sub find { shift->pg->db->query('select * from comments where id = ?', shift)->hash }

sub remove { shift->pg->db->query('delete from comments where id = ?', shift) }

sub save {
  my ($self, $id, $comment) = @_;
  my $sql = 'update comments set comment = ?, modified = now() where id = ?';
  $self->pg->db->query($sql, $comment->{comment}, $id);
}

sub answer {
  my ($self, $id, $username) = @_;
  my $sql = 'update comments set answer = ?, answered = now() where id = ?';
  $self->pg->db->query($sql, $username, $id);
}

1;
