package Ama::Controller::Votes;
use Mojo::Base 'Mojolicious::Controller';

sub count {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  $self->respond_to(
    json => {json => $self->votes->count($entry_type, $entry_id)},
    any => sub { $self->redirect_to('questions') },
  );
}

sub vote {
  my $self = shift;

  my $entry_type = $self->param('entry_type');
  my $entry_id = $self->param('entry_id');
  my $vote = $self->param('vote');
  my $username = $self->session->{username};
  $self->respond_to(
    json => {json => $self->votes->vote($entry_type, $entry_id, $vote, $username)},
    any => sub { $self->redirect_to('questions') },
  );
}

1;
