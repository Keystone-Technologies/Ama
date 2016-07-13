package Ama::Model::feedback;
use Mojo::Base -base;

has 'pg';
has 'username';

sub add {
  my ($self, $feedback) = @_;
  my $results = eval {
    my $tx = $self->pg->db->begin;
    my $sql = 'insert into feedback (feedback) values (?) returning *';
    my $results = $self->pg->db->query($sql, $feedback)->hash;
    $tx->commit;
    $results;
  };
  $@ ? { error => $@ } : $results;
}

1;