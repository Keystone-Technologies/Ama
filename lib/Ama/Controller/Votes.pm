package Ama::Controller::Votes;
use Mojo::Base 'Mojolicious::Controller';

sub cast {
  my $self = shift;
  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $vote = $self->param('vote');
  $self->render(json => $self->votes->cast($entry_type, $entry_id, $vote));
}

sub uncast {
  my $self = shift;
  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  $self->render(json => $self->votes->uncast($entry_type, $entry_id));
}

1;
