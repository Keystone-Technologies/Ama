package Ama::Controller::Feedback;
use Mojo::Base 'Mojolicious::Controller';

sub submit{
  my $self = shift;
  my $sendgrid = $self->sendgrid;
  my $feedback = $self->param('feedback');
  my $send = $sendgrid->mail(
               text    => $feedback,
               to      => $self->config->{sendgrid}->{to},
               cc      => $self->config->{sendgrid}->{cc},
               bcc     => $self->config->{sendgrid}->{bcc},
               from    => $self->config->{sendgrid}->{from},
               subject => "feedback received from AMA",
             )->send;
  $self->feedback->add($feedback);
  $self->render(json => $send->res->json);
}

1;
 