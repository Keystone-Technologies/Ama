package Ama::Controller::Flags;
use Mojo::Base 'Mojolicious::Controller';

sub raise {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  $self->render(json => $self->flags->raise($entry_type, $entry_id));
}

sub remove {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $r = $self->flags->remove($entry_type, $entry_id);
  warn $r;
  $self->render(json => $r);
}

1;
