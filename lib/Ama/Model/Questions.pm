package Ama::Model::Questions;
use Mojo::Base -base;

use Ama::Model::Votes;

has 'pg';
has 'username';
has 'votes' => sub {
  my $self = shift;
  state $votes = Ama::Model::Votes->new(pg => $self->pg, username => $self->username);
};

sub add {
  my ($self, $question) = @_;
  my $results = eval {
    my $tx = $self->pg->db->begin;
    my $sql = 'insert into questions (question, username) values (?, ?) returning *';
    my $results = $self->pg->db->query($sql, $question, $self->username)->hash;
    $self->votes->cast('questions', $results->{question_id}, 'up');
    $tx->commit;
    $results;
  };
  $@ ? { error => $@ } : $results;
}

sub all {
  my $self = shift;
  $self->pg->db->query(q[
  select
    question_id,
    question,
    votes('questions', question_id) as votes,
    (select vote from votes where entry_type='questions' and entry_id = question_id and username = ?) as my_vote,
    flagged('questions',question_id) as flagged,
    username,
    to_char(created, 'MM/DD/YYYY HH12:MI:SS') as created,
    to_char(modified, 'MM/DD/YYYY HH12:MI:SS') as modified,
    answered(question_id)::int as answered
  from
    questions
  order by answered asc, votes desc, created desc;
], $self->username)->hashes->to_array }

sub find { shift->pg->db->query('select * from questions where question_id = ?', shift)->hash }

sub remove {
  my ($self, $question_id) = @_;
  my $results = eval {
    my $sql = 'delete from questions where question_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $question_id, $self->username)->hash;
  };
  $@ ? { error => $@ } : $results;
}

sub save {
  my ($self, $question_id, $question) = @_;
  my $results = eval {
    my $sql = 'update questions set question = ?, modified = now() where question_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $question, $question_id, $self->username)->hash;
  };
  $@ ? { error => $@ } : $results;
}

1;
