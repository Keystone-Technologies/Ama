package Ama::Model::Questions;
use Mojo::Base -base;

has 'pg';
has 'username';

sub add {
  my ($self, $question) = @_; # $question is $validation->output from the controller
  my $sql = 'insert into questions (question, username) values (?, ?) returning *';
  return $self->pg->db->query($sql, $question->{question}, $self->username)->hash;
}

sub all {
  my $self = shift;
  $self->pg->db->query(q[
  select
    questions.id,
    question,
    votes('questions', questions.id) as votes,
    (select vote from votes where entry_type='questions' and entry_id=questions.id and username = ?) as my_vote,
    flagged('questions',questions.id) as flagged,
    questions.username,
    to_char(questions.created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(questions.modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    answered(questions.id) as answered
  from
    questions
  order by answered asc, votes desc, created desc;
], $self->username)->hashes->to_array }

sub find { shift->pg->db->query('select * from questions where id = ?', shift)->hash }

sub remove {
  my ($self, $id) = @_;
  my $sql = 'delete from questions where id = ? and username = ? and answered(id) != 1 returning *';
  $self->pg->db->query($sql, $id, $self->username)->hash;
}

sub save {
  my ($self, $id, $question) = @_;
  my $sql = 'update questions set question = ? where id = ? and username = ? and answered(id) != 1 returning *';
  $self->pg->db->query($sql, $question->{question}, $id, $self->username)->hash;
}

1;
