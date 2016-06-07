use Mojo::Base;

use FindBin;
BEGIN { unshift @INC, "$FindBin::Bin/../../lib" }

use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Ama');

$t = $t->post_ok('/questions' => {Accept => 'application/json'} => form => {'question' => '..test..'})->status_is(200);
$question_id = $t->tx->res->json('/question_id');

$t = $t->post_ok('/questions/' . $question_id . '/comment/' => {Accept => 'application/json'}, form => {question_id => $question_id, comment => 'test'})->status_is(200)
    ->json_has('/username')
    ->json_has('/created')
    ->json_has('/question_id')
    ->json_has('/modified')
    ->json_has('/comment')
    ->json_has('/comment_id');
$comment_id = $t->tx->res->json('/comment_id');

$t->get_ok('/questions/' . $question_id . '/comments' => {Accept => 'application/json'})->status_is(200);
$t->put_ok('/comments/' . $comment_id, {Accept => 'application/json', contentType => 'application/x-www-form-urlencoded', dataType => 'json'}, form => {comment => 'testXX', comment_id => $comment_id, question_id => $question_id})->status_is(200)
    ->json_has('/comment_id')
    ->json_has('/comment')
    ->json_has('/comment_id')
    ->json_has('/modified')
    ->json_has('/username')
    ->json_has('/question_id')
    ->json_has('/created');

$t->post_ok('/api/comments/vote/' . $comment_id . '/up')->status_is(200)
    ->json_has('/entry_type')
    ->json_has('/entry_id')
    ->json_has('/votes')
    ->json_has('/created')
    ->json_has('/vote')
    ->json_has('/username');
    
$t->post_ok('/api/comments/vote/' . $comment_id . '/down')->status_is(200)
    ->json_has('/entry_type')
    ->json_has('/entry_id')
    ->json_has('/votes')
    ->json_has('/created')
    ->json_has('/vote')
    ->json_has('/username');
    
$t->post_ok('/api/comments/flag/' . $comment_id)
    ->status_is(200)
    ->json_has('/entry_id')
    ->json_has('/created')
    ->json_has('/entry_type')
    ->json_has('/username');

$t->delete_ok('/api/comments/flag/' . $question_id)->status_is(200);

$t->post_ok('/api/answers/' . $question_id . '/' . $comment_id)->status_is(200)
    ->json_has('/question_id')
    ->json_has('/username')
    ->json_has('/created')
    ->json_has('/comment_id');
    
$t->delete_ok('/api/answers/' . $question_id . '/' . $comment_id)->status_is(200);
    
$t->delete_ok('/comments/' . $comment_id => {Accept => 'application/json'})->status_is(200);

$t->delete_ok('/questions/' . $question_id => {Accept => 'application/json'})->status_is(200);
done_testing();