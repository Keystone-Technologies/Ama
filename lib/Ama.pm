package Ama;
use Mojo::Base 'Mojolicious';

use Ama::Model::Questions;
use Mojo::Pg;

sub startup {
  my $self = shift;

  # Configuration
  $self->plugin('Config');
  $self->secrets($self->config('secrets'));

  # Model
  $self->helper(pg => sub { state $pg = Mojo::Pg->new(shift->config('pg')) });
  $self->helper(questions => sub { state $questions = Ama::Model::Questions->new(pg => shift->pg) });
  $self->helper(votes => sub { state $votes = Ama::Model::Votes->new(pg => shift->pg) });
  $self->helper(comments => sub { state $comments = Ama::Model::Comments->new(pg => shift->pg) });

  # Migrate to latest version if necessary
  my $path = $self->home->rel_file('migrations/ama.sql');
  $self->pg->migrations->name('ama')->from_file($path)->migrate;

  # Controller
  my $r = $self->routes;
  $r->get('/' => sub { shift->redirect_to('questions') });

  $r->get('/questions')->to('questions#index');
  $r->get('/questions/create')->to('questions#create')->name('create_question');
  $r->post('/questions')->to('questions#store')->name('store_question');
  $r->get('/questions/:id')->to('questions#show')->name('show_question');
  $r->get('/questions/:id/edit')->to('questions#edit')->name('edit_question');
  $r->post('/questions/:id/vote/:vote', [vote => [qw(up down)]])->to('votes#vote', entry_type => 'questions')->name('vote_question');
  $r->get('/questions/:question_id/comments')->to('comments#index')->name('comments');
  $r->get('/questions/:question_id/comments/create')->to('comments#create')->name('create_comment');
  $r->post('/questions/:question_id/comments')->to('comments#store')->name('store_comment');
  $r->get('/questions/:question_id/comments/:id')->to('comments#show')->name('show_comment');
  $r->get('/questions/:question_id/comments/:id/edit')->to('comments#edit')->name('edit_comment');
  $r->post('/questions/:question_id/comments/:id/vote/:vote', [vote => [qw(up down)]])->to('votes#vote', entry_type => 'comments')->name('vote_comment');
  $r->post('/questions/:question_id/comments/:id/answer')->to('comments#answer')->name('answer_comment');
  $r->put('/questions/:question_id/comments/:id')->to('comments#update')->name('update_comment');
  $r->delete('/questions/:question_id/comments/:id')->to('comments#remove')->name('remove_comment');
  $r->put('/questions/:id')->to('questions#update')->name('update_question');
  $r->delete('/questions/:id')->to('questions#remove')->name('remove_question');
}

1;
