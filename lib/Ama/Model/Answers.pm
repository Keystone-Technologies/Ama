package Ama::Model::Answers;
use Mojo::Base -base;

has 'pg';
has 'username';

sub mark {
  my ($self, $comment_id, $question_id) = @_;
  $self->unmark($comment_id, $question_id);
  my $sql = 'insert into answers (comment_id, question_id, username) select ?, ?, username from questions where id = ? and username = ? returning *';
  return $self->pg->db->query($sql, $comment_id, $question_id, $question_id, $self->username)->hash;
}

sub unmark {
  my ($self, $comment_id, $question_id) = @_;
  warn Data::Dumper::Dumper([$comment_id, $question_id]);
  my $sql = 'delete from answers where comment_id = ? and question_id = ? and username = (select username from questions where id = ?) returning *';
  return $self->pg->db->query($sql, $comment_id, $question_id, $question_id)->hash;
}

1;
