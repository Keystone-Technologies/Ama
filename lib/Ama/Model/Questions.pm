package Ama::Model::Questions;
use Mojo::Base -base;

has 'vote_floor';

use Ama::Model::Votes;
has 'pg';
has 'username';
has 'admin';
has 'votes' => sub {
  my $self = shift;
  my $votes = Ama::Model::Votes->new(pg => $self->pg);
};

sub add {
  my ($self, $question) = @_;
  my $results = eval {
    my $tx = $self->pg->db->begin;
    my $sql = 'insert into questions (question, username) values (?, ?) returning *';
    my $results = $self->pg->db->query($sql, $question, $self->username)->hash;
    $self->votes->username($self->username);
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
  order by answered asc, created desc, votes desc
  limit 20;
], $self->username)->hashes->to_array }

sub getQuestions {
  my ($self, $creator, $answered, $orderby, $direction, $limit, $keyword, $hidden) = @_;
  my $sql = 
  'select '.
    'question_id, '.
    'question, '.
    'created, ' .
    'username, '.
    '(select video_link from comments where comment_id = (select comment_id from answers where question_id = questions.question_id)) as video_link, ' .
    "votes('questions',questions.question_id) votes, ".
    "(select vote from votes where entry_type = 'questions' and entry_id = questions.question_id and username = ?) as my_vote, ".
    "flagged('questions',questions.question_id) flagged, ".
    'answered(question_id)::int as answered, '.
    'commentcount(question_id)::int as comment_count '.
  'from '.
    'questions '.
  'where ';
  if($hidden == 1){
    $sql = $sql . "votes('questions',questions.question_id) > " . $self->vote_floor . " and ";
  }
  if($creator eq 'my') {
    $sql = $sql . "username = '" . $self->username . "' and ";
  }
  
  if($keyword ne 'none') {
    $sql = $sql . "LOWER(question) like LOWER('%" . $keyword . "%') and ";
  }
  
  $sql = $sql .  'answered(question_id)::int = ? '.
  'order by ' . $orderby . ' ' . $direction . ', question_id asc ' .
  'limit ?; ';
  
  $self->pg->db->query($sql, $self->username, $answered, $limit)->hashes->to_array }
  
sub find { shift->pg->db->query('select * from questions where question_id = ?', shift)->hash }

sub remove {
  my ($self, $question_id) = @_;
  my $results =  eval {
  if($self->{admin} ==1) {
    my $sql = 'delete from questions where question_id = ? returning *';
    $self->pg->db->query($sql, $question_id)->hash;
  }
  else {
    my $sql = 'delete from questions where question_id = ? and username = ? and not answered(question_id) returning *';
    $self->pg->db->query($sql, $question_id, $self->username)->hash;
  }
  };
  if ($results) {
    $@ ? { error => $@ } : $results;
  }
  else {
    error => "Couldn't delete question";
  }
}

sub removeAll {
  my $self = shift;
  my $results = eval {
    if ($self->{admin} == 1) {
      my $sql = 'delete from questions';
      $self->pg->db->query($sql);
    }
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
