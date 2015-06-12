package Ama::Model::Questions;
use Mojo::Base -base;

has 'pg';

sub add {
  my ($self, $question, $username) = @_; # $question is $validation->output from the controller
  my $sql = 'insert into questions (question, username) values (?, ?) returning id';
  return $self->pg->db->query($sql, $question->{question}, $username)->hash->{id};
}

sub all { shift->pg->db->query(q[
  select
    questions.id,
    question,
    questions.username,
    to_char(questions.created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(questions.modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    votes('questions', questions.id) as votes,
    (answer(questions.id)).*
  from questions
  group by questions.id
  order by 8 desc,votes desc,4
])->hashes->to_array }
sub answered { shift->pg->db->query(q[select questions.id,question,SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up, SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down from questions left join votes on questions.id=votes.entry_id and votes.entry_type='questions' left join comments on questions.id=comments.question_id where answer is not null group by questions.id])->hashes->to_array }
sub unanswered { shift->pg->db->query(q[select questions.id,question,SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) as votes_up, SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) as votes_down from questions left join votes on questions.id=votes.entry_id and votes.entry_type='questions' left join comments on questions.id=comments.question_id where answer is null group by questions.id])->hashes->to_array }

sub find { shift->pg->db->query('select * from questions where id = ?', shift)->hash }

sub remove { shift->pg->db->query('delete from questions where username = ? and id = ?', @_)->rows }

sub save {
  my ($self, $id, $question) = @_;
  my $sql = 'update questions set question = ? where id = ? returning id';
  $self->pg->db->query($sql, $question->{question}, $id)->hash->{id};
}

1;
