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
  my $question_id = $self->param('question_id');
  $self->stash(question => $self->questions->find($question_id));
  $self->respond_to(
    json => {json => $self->stash('questions')},
    any => {},
  );
}

sub index {
  my $self = shift;
  $self->stash(user => $self->model->oauth2->find($self->session('id')));
  $self->stash(questions => $self->questions->all);
  $self->respond_to(
    json => {json => $self->stash('questions')},
    any => {},
  );
}

sub getQuestions {
  my $self = shift;
  my $creator = $self->param('creator');
  my $answered = $self->param('answered');
  my $orderby = $self->param('orderby');
  my $direction = $self->param('direction');
  my $limit = $self->param('limit');
  my $keyword = $self->param('keyword');
  my $unpopular = $self->param('unpopular');
  $self->stash(questions => $self->questions->getQuestions($creator, $answered, $orderby, $direction, $limit, $keyword, $unpopular));
  $self->respond_to(
    json=> {json => $self->stash('questions')},
    any => {},
    );
}

sub remove {
  my $self = shift;
  my $question_id = $self->param('question_id');
  $self->stash('question' => $self->questions->remove($question_id));
  $self->respond_to(
    json => {json => $self->stash('question')},
  );
}

sub removeAll {
  my $self = shift;
  $self->stash('question' => $self->questions->removeAll());
  $self->respond_to(
    json => {json => $self->stash('question')},
  );
}

sub show {
  my $self = shift;
  my $question_id = $self->param('question_id');
  $self->stash(question => $self->questions->find($question_id));
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

  my $question = $self->param('question');
  $self->stash(question => $self->questions->add($question));
  $self->respond_to(
    json => {json => $self->stash('question')},
    any => sub { $self->redirect_to('/') },
  );
  
}

sub update {
  my $self = shift;

  my $validation = $self->_validation;
  return $self->respond_to(
    json => {json => {}},
    any => sub { $self->render(action => 'edit', question => {}) },
  ) if $validation->has_error;

  my $question_id = $self->param('question_id');
  my $question = $self->param('question');
  my $result = $self->stash('question' => $self->questions->save($question_id, $question));
  $self->respond_to(
    json => {json => $self->stash('question')},
    any => {},
  );
}

sub _validation {
  my $self = shift;

  my $validation = $self->validation;
  $validation->required('question');

  return $validation;
}

1;