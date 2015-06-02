package Ama::Model::Questions;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $question, $username) = @_; # $question is $validation->output from the controller
  my $sql = 'insert into questions (question, username) values (?, ?) returning id';
  return $self->pg->db->query($sql, $question->{question}, $username)->hash->{id};
}

sub all { shift->pg->db->query(q[select questions.id,question,SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up, SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down from questions left join votes on questions.id=votes.entry_id and votes.entry_type='questions' group by questions.id])->hashes->to_array }
sub answered { shift->pg->db->query(q[select questions.id,question,SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up, SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down from questions left join votes on questions.id=votes.entry_id and votes.entry_type='questions' group by questions.id])->hashes->to_array }
sub unanswered { shift->pg->db->query(q[select questions.id,question,SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up, SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down from questions left join votes on questions.id=votes.entry_id and votes.entry_type='questions' group by questions.id])->hashes->to_array }

sub find { shift->pg->db->query('select * from questions where id = ?', shift)->hash }

sub remove { shift->pg->db->query('delete from questions where id = ?', shift)->rows }

sub save {
  my ($self, $id, $question) = @_;
  my $sql = 'update questions set question = ? where id = ? returning id';
  $self->pg->db->query($sql, $question->{question}, $id)->hash->{id};
}

1;
