package Ama::Controller::Feedback;
use Mojo::Base 'Mojolicious::Controller';

sub submit{
  my $self = shift;
  my $sendgrid = $self->sendgrid;
  my $send;
  my $feedback = $self->param('feedback');
  if (!$self->config->{sendgrid}->{to} || $self->config->{sendgrid}->{to} eq undef || !$self->config->{sendgrid}->{from} || $self->config->{sendgrid}->{from} eq undef){
                warn "missing to or from address!\n";
              } else{
                    $send = $sendgrid->mail(
                      text    => $feedback,
                      to      => $self->config->{sendgrid}->{to},
                      cc      => $self->config->{sendgrid}->{cc},
                      bcc     => $self->config->{sendgrid}->{bcc},
                      from    => $self->config->{sendgrid}->{from},
                      subject => "feedback received from AMA",
                    )->send;
              }
  $self->feedback->add($feedback);
  $self->render(json => $send->res->json);
}

1;
 