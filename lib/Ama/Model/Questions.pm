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

sub addmultiple {
  my ($pg, $question, $created, $upvotes, $downvotes) = @_;
  my $username = 1000000000 + int(rand(435000000));
  my $sql = 'insert into questions (question, username, created) values (?, ?, ?) returning *';
  my $results = $pg->db->query($sql, $question, $username, $created)->hash;
  $sql = 'insert into comments (question_id, comment, username) select ?, ?, ? where not answered(?) returning *';
  $username = int(rand(435000000)) + 1000000000;
  my $commentresults = $pg->db->query($sql, $results->{question_id}, 'Answered', $username, $results->{question_id})->hash;
  $sql = 'insert into answers (comment_id, question_id, username) values (?, ?, ?) returning *';
  $pg->db->query($sql, $commentresults->{comment_id}, $results->{question_id}, $username)->hash;
  for (my $i = 0; $i < $upvotes; $i++) {
    my $username = int(rand(435000000)) + 1000000000;
    $sql = 'insert into votes (entry_type, entry_id, vote, username) values (?, ?, ?, ?) returning *';
    my $id = $pg->db->query($sql, 'questions', $results->{question_id}, 'up', $username)->hash;
  }
  for (my $i = 0; $i < $downvotes; $i++) {
    my $username = int(rand(435000000)) + 1000000000;
    $sql = 'insert into votes (entry_type, entry_id, vote, username) values (?, ?, ?, ?) returning *';
    my $id = $pg->db->query($sql, 'questions', $results->{question_id}, 'down', $username)->hash;
  }
  return $results;
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
    answered(question_id)::int as answered,
    commentcount(question_id)::int as comment_count
  from
    questions
  order by answered asc, votes desc, created desc
  limit 20;
], $self->username)->hashes->to_array }

sub find { shift->pg->db->query('select * from questions where question_id = ?', shift)->hash }

sub remove {
  my ($self, $question_id) = @_;
  my $results = eval {
    my $sql = 'delete from questions where question_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $question_id, $self->username)->hash;
  };
  if ($results) {
    $@ ? { error => $@ } : $results;
  }
  else {
    error => "Couldn't delete question";
  }
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
