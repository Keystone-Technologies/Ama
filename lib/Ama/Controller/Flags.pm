package Ama::Controller::Flags;
use Mojo::Base 'Mojolicious::Controller';

sub mine {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $username = $self->session->{username};
  $self->render(json => $self->flags->mine($entry_type, $username));
}

sub count {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  $self->render(json => $self->flags->count($entry_type, $entry_id));
}

sub raise {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $username = $self->session->{username};
  $self->render(json => $self->flags->raise($entry_type, $entry_id, $username));
}

sub remove {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $username = $self->session->{username};
  $self->render(json => $self->flags->remove($entry_type, $entry_id, $username));
}

1;
