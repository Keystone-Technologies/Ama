package Ama::Controller::Comments;
use Mojo::Base 'Mojolicious::Controller';

sub create {
  my $self = shift;
  $self->stash(comment => {});
  $self->respond_to(
    json => {json => $self->stash('comment')},
    any => {},
  );
}

sub edit {
  my $self = shift;
  $self->stash(comment => $self->comments->find($self->param('id')));
  $self->respond_to(
    json => {json => $self->stash('comments')},
    any => {},
  );
}

sub index {
  my $self = shift;
  $self->stash(comments => $self->comments->all($self->param('question_id'))); 
  $self->respond_to(
    json => {json => $self->stash('comments')},
    any => {},
  );
}

sub remove {
  my $self = shift;
  my $ok = $self->comments->remove($self->param('id'));
  $self->respond_to(
    json => {json => {ok => $ok}},
    any => sub { $self->redirect_to('comments') },
  );
}

sub show {
  my $self = shift;
  $self->stash(comments => $self->comment->find($self->param('id')));
  $self->respond_to(
    json => {json => $self->stash('comment')},
    any => {},
  );
}   

sub store {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->respond_to(
    json => {json => {id => undef}},
    any => sub { $self->render(action => 'create', comment => {}) },
  ) if $validation->has_error;

  my $id = $self->comments->add($validation->output, $self->session->{username});

  $self->respond_to(
    json => {json => {id => $id}},
    any => sub { $self->redirect_to('show_comment', id => $id) },
  );
}   

sub update {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->respond_to(
    json => {json => {id => undef}},
    any => sub { $self->render(action => 'edit', comment => {}) },
  ) if $validation->has_error;

  my $id = $self->param('id');
  $id = $self->comments->save($id, $validation->output);

  $self->respond_to(
    json => {json => {id => $id}},
    any => sub { $self->redirect_to('show_comment', id => $id) },
  );
}   

sub answer {
  my $self = shift;

  my $id = $self->param('id');
  my $username = $self->session->{username};
  $self->respond_to(
    json => {json => {ok => $self->comments->answer($id, $username)}},
    any => sub { $self->redirect_to('questions') },
  );
}

sub _validation {
  my $self = shift;

  my $validation = $self->validation;
  $validation->required('comment');
  $validation->required('question_id');

  return $validation;
}

1;
