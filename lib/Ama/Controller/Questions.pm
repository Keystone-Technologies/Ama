package Ama::Controller::Questions;
use Mojo::Base 'Mojolicious::Controller';

sub create { shift->stash(question => {}) }

sub edit {
  my $self = shift;
  $self->stash(question => $self->questions->find($self->param('id')));
}

sub index {
  my $self = shift;
  $self->stash(questions => $self->questions->all);
}

sub remove {
  my $self = shift;
  $self->questions->remove($self->param('id'));
  $self->redirect_to('questions');
}

sub show {
  my $self = shift;
  $self->stash(question => $self->questions->find($self->param('id')));
}

sub store {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->render(action => 'create', question => {})
    if $validation->has_error;

  my $id = $self->questions->add($validation->output);
  $self->redirect_to('show_question', id => $id);
}

sub update {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->render(action => 'edit', question => {}) if $validation->has_error;

  my $id = $self->param('id');
  $self->questions->save($id, $validation->output);
  $self->redirect_to('show_question', id => $id);
}

sub _validation {
  my $self = shift;

  my $validation = $self->validation;
  $validation->required('title');
  $validation->required('body');

  return $validation;
}

1;
