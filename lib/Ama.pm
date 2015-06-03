package Ama;
use Mojo::Base 'Mojolicious';

use Ama::Model::Questions;
use Ama::Model::Votes;
use Ama::Model::Comments;
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

  # Assets
  $self->plugin('AssetPack');
  $self->asset('ama.js' => 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');

  # Controller
  my $r = $self->routes;

  $r->get('/' => sub { shift->redirect_to('questions') });
  #$r->get('/questions/mine')->to('questions#mine')->name('my_questions'); # Display all questions
  $r->get('/questions')->to('questions#index')->name('questions'); # Display all questions
  $r->get('/questions/create')->to('questions#create')->name('create_question'); # Display empty form
  $r->post('/questions')->to('questions#store')->name('store_question'); # Insert into DB and redirect to show_question
  $r->get('/questions/:id')->to('questions#show')->name('show_question'); # Display specific question
  $r->get('/questions/:id/edit')->to('questions#edit')->name('edit_question'); # Display filled-out form
  $r->put('/questions/:id')->to('questions#update')->name('update_question'); # Update DB and redirect to show_question
  $r->delete('/questions/:id')->to('questions#remove')->name('remove_question'); # Delete from DB and redirect to questions

  #$r->get('/comments/mine')->to('comments#mine')->name('my_comments');
  $r->get('/comments/:question_id')->to('comments#index')->name('comments');
  $r->get('/comments/:question_id/create')->to('comments#create')->name('create_comment');
  $r->post('/comments/:question_id')->to('comments#store')->name('store_comment');
  $r->get('/comments/:question_id/:id')->to('comments#show')->name('show_comment');
  $r->get('/comments/:question_id/:id/edit')->to('comments#edit')->name('edit_comment');
  $r->post('/comments/:question_id/:id/answer', {answer => 1})->to('comments#answer')->name('mark_comment_as_answer');
  $r->delete('/comments/:question_id/:id/answer', {answer => 0})->to('comments#answer')->name('unmark_comment_as_answer');
  $r->put('/comments/:question_id/:id')->to('comments#update')->name('update_comment');
  $r->delete('/comments/:question_id/:id')->to('comments#remove')->name('remove_comment');

  my $api = $r->under('/api'); # Require Ajax

  #$api->get('/votes/:entry_type/mine')->to('votes#mine')->name('my_votes');
  $api->get('/votes/:entry_type/:entry_id')->to('votes#count')->name('count_votes');
  $api->post('/votes/:entry_type/:entry_id/:vote', [vote => [qw(up down)]])->to('votes#cast')->name('cast_vote');

  #$api->get('/flags/:entry_type/mine')->to('flags#mine')->name('my_flags');
  $api->get('/flags/:entry_type/:entry_id')->to('flags#count')->name('count_flags');
  $api->post('/flags/:entry_type/:entry_id')->to('flags#raise')->name('raise_flag');
  $api->delete('/flags/:entry_type/:entry_id')->to('flags#remove')->name('remove_flag');
}

1;
