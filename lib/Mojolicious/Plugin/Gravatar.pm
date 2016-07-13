package Mojolicious::Plugin::Gravatar;
use Mojo::Base 'Mojolicious::Plugin';
use Gravatar::URL;
our $VERSION = '0.01';

sub register {
  my ($self, $app) = @_;
  $app->helper(
    'gravatar.url' => sub {
      my ($self, $args) = @_;
      return gravatar_url( email => $args->{email} , rating => $args->{rating});
    }
  );
}

1;

__END__                     

=encoding utf8

=head1 NAME

Mojolicious::Plugin::Gravatar - Mojolicious Plugin for creating a gravatar url

=head1 SYNOPSIS

  # Mojolicious
  $self->plugin('gravatar');

  # Mojolicious::Lite
  plugin 'gravatar';

=head1 DESCRIPTION

L<Mojolicious::Plugin::Gravatar> is a L<Mojolicious> plugin for Mojolicious Apps to create a Gravatar URL with an email address using Gravatar::URL

=head1 METHODS

L<Mojolicious::Plugin::Gravatar> inherits all methods from
L<Mojolicious::Plugin> and implements the following new ones.

=head2 register

  $plugin->register(Mojolicious->new);

Register plugin in L<Mojolicious> application.

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
