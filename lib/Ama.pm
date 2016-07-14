package Ama;
use Mojo::Base 'Mojolicious';

use Ama::Model::Questions;
use Ama::Model::Comments;
use Ama::Model::Answers;
use Ama::Model::Votes;
use Ama::Model::Feedback;

use Mojo::Pg;
use Ama::Model::OAuth2;
our $VERSION = '2.0';

sub startup {
  my $self = shift;
  
  $self->plugin('SecureOnly');

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
  $self->helper(feedback => sub { state $feedback = Ama::Model::Feedback->new(pg => shift->pg) });
  $self->helper('model.oauth2' => sub { state $votes = Ama::Model::OAuth2->new(pg => shift->pg) });
  $self->hook(around_action => sub {
    my ($next, $c, $action, $last) = @_;
    $c->session->{username} ||= time;
    $c->session->{username} = $c->session('id') if $c->session('id');
    my $admin = 0; #by default the user is not an admin
    
    if ($c->session('id') ) { #if the user has logged in with OAuth
      if ( defined $self->pg->db->query('select id from users where id = ?', $c->session->{username})->hash ) {
        $admin = $self->pg->db->query('select admin from users where id = ?', $c->session->{username})->hash->{admin}; #set admin to 1 or 0
        if (!$c->session->{email}) {
          my $email = $self->pg->db->query('select email from users where id = ?', $c->session->{username})->hash->{email};
          $c->session->{email} = $email;
        }
      }
      else {
        my $token = $c->session('token') || {};
        delete $c->session->{$_} foreach keys %{$c->session};
        $token->{$_} = {} foreach keys %$token;
        $c->session(token => $token);
        $c->redirect_to($config->{on_logout});
      }
    }
    
    $c->session->{admin} = $admin; #updates cookie's admin variable
    $c->questions->username($c->session->{username});
    $c->questions->admin($c->session->{admin}); #sends the admin info to the model (lib/Ama/Model/Questions.pm)
    $c->comments->username($c->session->{username});
    $c->comments->admin($c->session->{admin}); #sends the admin info to the model (lib/Ama/Model/Comments.pm)
    $c->answers->username($c->session->{username});
    $c->answers->admin($c->session->{admin}); #sends the admin info to the model (lib/Ama/Model/Answers.pm)
    $c->votes->username($c->session->{username});
    $c->votes->vote_floor($self->config('vote_floor'));
    return $next->();
  });
  
$self->plugin("OAuth2Accounts" => {
  on_logout => '/',
  on_success => 'questions',
  on_error => 'questions',
  on_connect => sub { shift->model->oauth2->store(@_) },
  providers => $config->{oauth2},
  });
  
  $self->plugin("Gravatar");

  $self->helper( 'version' => sub{$VERSION} );

  # Migrate to latest version if necessary
  my $path = $self->home->rel_file('migrations/ama.sql');
  $self->pg->migrations->name('ama')->from_file($path)->migrate;

  # Assets
  $self->plugin('JSUrlFor' => {route => '/js/url_for.js'});
  $self->plugin('AssetPack');
  $self->asset('ama.js' => 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');

  # Mojolicious
  $self->plugin('Sendgrid' =>{config => $self->config->{sendgrid}});

  # Controller
  my $r = $self->routes;
  $r->get('/' => sub {
    my $self = shift;
    $self->redirect_to('questions');
  });
  
   $r->get('/connect/:provider' => sub {
    my $self = shift;
    return $self->redirect_to('connectprovider', {provider => $self->param('provider')}) unless $self->session('id');
    $self->redirect_to('questions');
  });

  $r->get('/admin');


  $r->get('/questions')->to('questions#index')->name('questions'); # Display all questions
  $r->get('/questions/create')->to('questions#create')->name('create_question'); # Display empty form
  $r->post('/questions')->to('questions#store')->name('store_question'); # Insert into DB and redirect to show_question
  $r->get('/questions/:question_id')->to('questions#show')->name('show_question'); # Display specific question
  $r->get('/questions/:question_id/edit')->to('questions#edit')->name('edit_question'); # Display filled-out form
  $r->put('/questions/:question_id')->to('questions#update')->name('update_question'); # Update DB and redirect to show_question
  $r->delete('/questions/:question_id')->to('questions#remove')->name('remove_question'); # Delete from DB and redirect to questions
  $r->delete('/removeAll')->to('questions#removeAll')->name('removeAll'); #Delete every question
  $r->get('/questions/:creator/:answered/:orderby/:direction/:limit/:keyword')->to('questions#getQuestions')->name('get_answered');

  $r->get('/questions/:question_id/comments')->to('comments#index')->name('comments');
  $r->get('/questions/:question_id/comment/create')->to('comments#create')->name('create_comment');
  $r->post('/questions/:question_id/comment')->to('comments#store')->name('store_comment');

  $r->get('/comments/:comment_id')->to('comments#show')->name('show_comment');
  $r->get('/comments/:comment_id/edit')->to('comments#edit')->name('edit_comment');
  $r->put('/comments/:comment_id')->to('comments#update')->name('update_comment');
  $r->delete('/comments/:comment_id')->to('comments#remove')->name('remove_comment');
  
  my $api = $r->under('/api'); # Require Ajax (need to do)

  $api->post('/answers/:question_id/:comment_id')->to('answers#mark')->name('mark_comment_as_answer');
  $api->delete('/answers/:question_id/:comment_id')->to('answers#unmark')->name('unmark_comment_as_answer');

  $api->post('/:entry_type/vote/:entry_id/:vote', [vote => [qw(up down)]])->to('votes#cast')->name('cast_vote');
  $api->delete('/:entry_type/vote/:entry_id')->to('votes#uncast')->name('uncast_vote');

  
  $api->post('/feedback')->to('feedback#submit')->name('submit_feedback');

}

1;
