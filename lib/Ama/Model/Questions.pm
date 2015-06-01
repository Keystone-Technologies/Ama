package Ama::Model::Questions;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $question) = @_;
  my $sql = 'insert into questions (title, body) values (?, ?) returning id';
  return $self->pg->db->query($sql, $question->{title}, $question->{body})->hash->{id};
}

sub all { shift->pg->db->query('select * from questions')->hashes->to_array }

sub find {
  my ($self, $id) = @_;
  return $self->pg->db->query('select * from questions where id = ?', $id)->hash;
}

sub remove { shift->pg->db->query('delete from questions where id = ?', shift) }

sub save {
  my ($self, $id, $question) = @_;
  my $sql = 'update questions set title = ?, body = ? where id = ?';
  $self->pg->db->query($sql, $question->{title}, $question->{body}, $id);
}

1;
