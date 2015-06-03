package Ama::Model::Flags;
use Mojo::Base -base;

has 'pg';

sub mine {
  my ($self, $entry_type, $username) = @_;
  my $sql = 'select count(*) as flags from flags where entry_type = ? and username = ?';
  return $self->pg->db->query($sql, $entry_type, $username)->hash;
}

sub count {
  my ($self, $entry_type, $entry_id) = @_;
  my $sql = 'select count(*) as flags from flags where entry_type = ? and entry_id = ?';
  return $self->pg->db->query($sql, $entry_type, $entry_id)->hash;
}

sub raise {
  my ($self, $entry_type, $entry_id, $username) = @_;
  my $flags = $self->pg->db->query('select count(*) as flags from flags where entry_type = ? and entry_id = ? and username = ?', $entry_type, $entry_id, $username)->hash->{flags};
  if ( !$flags ) {
    my $sql = 'insert into flags (entry_type, entry_id, username) values (?, ?, ?)';
    $self->pg->db->query($sql, $entry_type, $entry_id, $username);
  }
  $self->count($entry_type, $entry_id);
}

sub remove {
  my ($self, $entry_type, $entry_id, $username) = @_;
  my $flags = $self->pg->db->query('select count(*) as flags from flags where entry_type = ? and entry_id = ? and username = ?', $entry_type, $entry_id, $username)->hash->{flags};
  if ( $flags ) {
    my $sql = 'delete from flags where entry_type = ? and entry_id = ? and username = ?';
    $self->pg->db->query($sql, $entry_type, $entry_id, $username);
  }
  $self->count($entry_type, $entry_id);
}

1;
