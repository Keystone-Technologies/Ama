use Mojo::Base;

use FindBin;
BEGIN { unshift @INC, "$FindBin::Bin/../../lib" }

use Test::More;
use Test::Mojo;
use Mojo::UserAgent;

my $t = Test::Mojo->new('Ama');

$t->get_ok('/')->status_is(302);
$t->get_ok('/questions')->status_is(200)
    ->element_exists('div[class=header]')
    ->element_exists('div[class=logoContainer]')
    ->element_exists('img[class=youtubeImg]')
    ->element_exists('div[class=newQuestion]');

$t = $t->post_ok('/questions' => {Accept => 'application/json'} => form => {'question' => '..test..'})
    ->status_is(200)
    ->json_has('/question_id')
    ->json_has('/question')
    ->json_has('/username')
    ->json_has('/created')
    ->json_has('/modified');
$question_id = $t->tx->res->json('/question_id');

$t->put_ok('/questions/' . $question_id => {Accept => 'application/json', contentType => 'application/x-www-form-urlencoded', dataType => 'json'} => form => {question => 'testXX', question_id => $question_id})
    ->status_is(200)
    ->json_has('/question_id')
    ->json_has('/question')
    ->json_has('/username')
    ->json_has('/created')
    ->json_has('/modified');

$t->post_ok('/api/questions/flag/' . $question_id)
    ->status_is(200)
    ->json_has('/entry_id')
    ->json_has('/created')
    ->json_has('/entry_type')
    ->json_has('/username');
    
$t->delete_ok('/api/questions/flag/' . $question_id)->status_is(200);

$t->post_ok('/api/questions/vote/' . $question_id . '/up')->status_is(200)
    ->json_has('/entry_type')
    ->json_has('/entry_id')
    ->json_has('/votes')
    ->json_has('/created')
    ->json_has('/vote')
    ->json_has('/username');
    
$t->post_ok('/api/questions/vote/' . $question_id . '/down')->status_is(200)
    ->json_has('/entry_type')
    ->json_has('/entry_id')
    ->json_has('/votes')
    ->json_has('/created')
    ->json_has('/vote')
    ->json_has('/username');

$t->delete_ok('/questions/' . $question_id => {Accept => 'application/json'})->status_is(200);

done_testing();