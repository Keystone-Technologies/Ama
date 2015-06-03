package Ama::Controller::Votes;
use Mojo::Base 'Mojolicious::Controller';

sub count {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  $self->render(json => $self->votes->count($entry_type, $entry_id));
}

sub cast {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $vote = $self->param('vote');
  my $username = $self->session->{username};
  $self->render(json => $self->votes->cast($entry_type, $entry_id, $vote, $username));
}

1;
