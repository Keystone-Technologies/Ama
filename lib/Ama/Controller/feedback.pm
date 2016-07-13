package Ama::Controller::feedback;
use Mojo::Base 'Mojolicious::Controller';

sub submit{
    my $self = shift;
    my $sendgrid = $self->sendgrid;
    my $feedback = $self->param('feedback');
    warn $self -> req -> body;
    my $send = $sendgrid -> mail(
        text => $feedback,
        to      => q(ajin@keystone-it.com),
        cc      => q(jsiems@keystone-it.com),
        bcc     => q(bmeyer@keystone-it.com),
        from    => q(ajin@keystone-it.com),
        subject => "feedback received from AMA",)->send;
    $self -> emailfeedback->add($feedback);
    $self -> render(json => $send ->res ->json);
}

1;
 