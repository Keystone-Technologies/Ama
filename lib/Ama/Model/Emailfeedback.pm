package Ama::Model::Emailfeedback;
use Mojo::Base -base;

use Ama::Model::Votes;
has 'pg';
has 'username';
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
