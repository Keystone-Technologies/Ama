package Ama::Controller::Emailfeedback;
use Mojo::Base 'Mojolicious::Controller';

sub submit{
    my $c = shift;
    my $sendgrid = $c->sendgrid;
    my $feedback = $c->param('feedback');
    #$c -> feedback -> submit($feedback);
    warn $c -> req -> body;
    $sendgrid -> mail(
        text => $feedback,
        to      => q(ajin@keystone-it.com),
        from    => q(ajin@keystone-it.com),
        subject => "feedback received from AMA",)->send;
    $c -> render(json => {ok => "true"});
}
 #$sendgrid->on(mail_send => sub {
    #my ($sendgrid, $ua, $tx) = @_;
    #say $tx->res->body;
 #});
1;
 