package Ama::Controller::Questions;
use Mojo::Base 'Mojolicious::Controller';

sub create {
  my $self = shift;
  $self->stash(question => {});
  $self->respond_to(
    json => {json => $self->stash('question')},
    any => {},
  );
}

sub edit {
  my $self = shift;
  $self->stash(question => $self->questions->find($self->param('id')));
  $self->respond_to(
    json => {json => $self->stash('questions')},
    any => {},
  );
}

sub index {
  my $self = shift;
  $self->stash(questions => $self->questions->all);
  $self->respond_to(
    json => {json => $self->stash('questions')},
    any => {},
  );
}

sub remove {
  my $self = shift;
  $self->stash(question => $self->questions->remove($self->param('id')));
  $self->respond_to(
    json => {json => $self->stash('question')},
  );
}

sub show {
  my $self = shift;
  $self->stash(question => $self->questions->find($self->param('id')));
  $self->respond_to(
    json => {json => $self->stash('question')},
    any => {},
  );
}

sub store {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->respond_to(
    json => {json => {}},
    any => sub { $self->render(action => 'create', question => {}) },
  ) if $validation->has_error;

  $self->stash(question => $self->questions->add($validation->output));

  $self->respond_to(
    json => {json => $self->stash('question')},
    any => sub { $self->redirect_to('questions') },
  );
}

sub update {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->respond_to(
    json => {json => {}},
    any => sub { $self->render(action => 'edit', question => {}) },
  ) if $validation->has_error;

  my $id = $self->param('id');
  $self->stash('question' => $self->questions->save($id, $validation->output));

  $self->respond_to(
    json => {json => $self->stash('question')},
    any => sub { $self->redirect_to('show_question', id => $id) },
  );
}

sub _validation {
  my $self = shift;

  my $validation = $self->validation;
  $validation->required('question');

  return $validation;
}

1;
