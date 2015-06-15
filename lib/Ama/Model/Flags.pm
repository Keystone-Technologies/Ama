package Ama::Model::Flags;
use Mojo::Base -base;

has 'pg';
has 'username';

sub raise {
  my ($self, $entry_type, $entry_id) = @_;
  return {} if $self->_flagged;
  my $sql = 'insert into flags (entry_type, entry_id, username) values (?, ?, ?) returning *';
  $self->pg->db->query($sql, $entry_type, $entry_id, $self->username)->hash;
}

sub remove {
  my ($self, $entry_type, $entry_id) = @_;
  return {} unless $self->_flagged;
  my $sql = 'delete from flags where entry_type = ? and entry_id = ? and username = ? returning *';
  $self->pg->db->query($sql, $entry_type, $entry_id, $self->username)->hash;
}

sub _flagged {
  my ($self, $entry_type, $entry_id) = @_;
  my $sql = 'select * from flags where entry_type = ? and entry_id = ?';
  $self->pg->db->query($sql, $entry_type, $entry_id)->hash;
}

1;
