package Ama::Controller::Answers;
use Mojo::Base 'Mojolicious::Controller';

sub mark {
  my $self = shift;

  my $comment_id = $self->param('comment_id');
  my $question_id = $self->param('question_id');
  $self->render(json => $self->answers->mark($comment_id, $question_id));
}

sub unmark {
  my $self = shift;

  my $comment_id = $self->param('comment_id');
  my $question_id = $self->param('question_id');
  $self->render(json => $self->answers->unmark($comment_id, $question_id));
}

1;
