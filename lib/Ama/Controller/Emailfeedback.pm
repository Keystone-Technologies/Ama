package Ama::Controller::Emailfeedback;
use Mojo::Base 'Mojolicious::Controller';

sub submit{
    my $self = shift;
    my $sendgrid = $self->sendgrid;
    my $feedback_comment = $self->param('feedback_comment');
    #$c -> feedback -> submit($feedback);
    warn $self -> req -> body;
    my $send = $sendgrid -> mail(
        text => $feedback_comment,
        to      => q(ajin@keystone-it.com),
        cc      => q(jsiems@keystone-it.com),
        bcc     => q(bmeyer@keystone-it.com),
        from    => q(ajin@keystone-it.com),
        subject => "feedback received from AMA",)->send;
    $self -> emailfeedback->add($feedback_comment);
    $self -> render(json => $send ->res ->json);
}

 #$sendgrid->on(mail_send => sub {
    #my ($sendgrid, $ua, $tx) = @_;
    #say $tx->res->body;
 #});
1;
 