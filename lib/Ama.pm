package Ama;
use Mojo::Base 'Mojolicious';

use Ama::Model::Questions;
use Ama::Model::Comments;
use Ama::Model::Answers;
use Ama::Model::Votes;
use Ama::Model::Flags;
use Mojo::Pg;
use Ama::Model::OAuth2;
our $VERSION = '1.2';

sub startup {
  my $self = shift;

  # Configuration
  my $config = $self->plugin('Config');
 
  $self->secrets($self->config('secrets'));
  $self->sessions->default_expiration(86400*365*10); # 10yr cookie

  # Model
  $self->helper(pg => sub { state $pg = Mojo::Pg->new(shift->config('pg')) });
  $self->helper(questions => sub { state $questions = Ama::Model::Questions->new(pg => shift->pg) });
  $self->helper(comments => sub { state $comments = Ama::Model::Comments->new(pg => shift->pg) });
  $self->helper(answers => sub { state $votes = Ama::Model::Answers->new(pg => shift->pg) });
  $self->helper(votes => sub { state $votes = Ama::Model::Votes->new(pg => shift->pg) });
  $self->helper(flags => sub { state $votes = Ama::Model::Flags->new(pg => shift->pg) });
  $self->helper('model.oauth2' => sub { state $votes = Ama::Model::OAuth2->new(pg => shift->pg) });
  $self->hook(around_action => sub {
    my ($next, $c, $action, $last) = @_;
    $c->session->{username} ||= time;
    $c->session->{username} = $c->session('id') if $c->session('id');
    $c->questions->username($c->session->{username});
    $c->comments->username($c->session->{username});
    $c->answers->username($c->session->{username});
    $c->votes->username($c->session->{username});
    $c->flags->username($c->session->{username});
    return $next->();
  });
  
$self->plugin("OAuth2Accounts" => {
  on_logout => '/',
  on_success => 'questions',
  on_error => 'login',
  on_connect => sub { shift->model->oauth2->store(@_) },
  providers => $config->{oauth2},
  });
  
  $self->helper( 'version' => sub{$VERSION} );

  # Migrate to latest version if necessary
  my $path = $self->home->rel_file('migrations/ama.sql');
  $self->pg->migrations->name('ama')->from_file($path)->migrate;

  # Assets
  $self->plugin('JSUrlFor' => {route => '/js/url_for.js'});
  $self->plugin('AssetPack');
  $self->asset('ama.js' => 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');

  # Controller
  my $r = $self->routes;
  $r->get('/' => sub {
    my $self = shift;
    $self->redirect_to('questions');
  });
  
   $r->get('/connect/:provider' => sub {
    my $self = shift;
    warn $self->session('id');
    return $self->redirect_to('connectprovider', {provider => $self->param('provider')}) unless $self->session('id');
    $self->redirect_to('questions');
  });
  
  $r->get('/questions')->to('questions#index')->name('questions'); # Display all questions
  $r->get('/questions/create')->to('questions#create')->name('create_question'); # Display empty form
  $r->post('/questions')->to('questions#store')->name('store_question'); # Insert into DB and redirect to show_question
  $r->get('/questions/:question_id')->to('questions#show')->name('show_question'); # Display specific question
  $r->get('/questions/:question_id/edit')->to('questions#edit')->name('edit_question'); # Display filled-out form
  $r->put('/questions/:question_id')->to('questions#update')->name('update_question'); # Update DB and redirect to show_question
  $r->delete('/questions/:question_id')->to('questions#remove')->name('remove_question'); # Delete from DB and redirect to questions

  $r->get('/questions/:question_id/comments')->to('comments#index')->name('comments');
  $r->get('/questions/:question_id/comment/create')->to('comments#create')->name('create_comment');
  $r->post('/questions/:question_id/comment')->to('comments#store')->name('store_comment');

  $r->get('/comments/:comment_id')->to('comments#show')->name('show_comment');
  $r->get('/comments/:comment_id/edit')->to('comments#edit')->name('edit_comment');
  $r->put('/comments/:comment_id')->to('comments#update')->name('update_comment');
  $r->delete('/comments/:comment_id')->to('comments#remove')->name('remove_comment');

  $r->get('/questions/:creator/:answered/:orderby/:direction/:limit/:keyword')->to('questions#getQuestions')->name('get_answered');

  my $api = $r->under('/api'); # Require Ajax (need to do)

  $api->post('/answers/:question_id/:comment_id')->to('answers#mark')->name('mark_comment_as_answer');
  $api->delete('/answers/:question_id/:comment_id')->to('answers#unmark')->name('unmark_comment_as_answer');

  $api->post('/:entry_type/vote/:entry_id/:vote', [vote => [qw(up down)]])->to('votes#cast')->name('cast_vote');
  $api->delete('/:entry_type/vote/:entry_id')->to('votes#uncast')->name('uncast_vote');

  $api->post('/:entry_type/flag/:entry_id')->to('flags#raise')->name('raise_flag');
  $api->delete('/:entry_type/flag/:entry_id')->to('flags#remove')->name('remove_flag');
}

1;
