package Ama::Model::Votes;
use Mojo::Base -base;

has 'pg';
has 'username';

sub cast {
  my ($self, $entry_type, $entry_id, $vote) = @_;
  $self->_uncast($entry_type, $entry_id);
  my $sql = 'insert into votes (entry_type, entry_id, vote, username) values (?, ?, ?, ?) returning *, votes(?, ?) as votes';
  $self->pg->db->query($sql, $entry_type, $entry_id, $vote, $self->username, $entry_type, $entry_id)->hash;
}

sub _uncast {
  my ($self, $entry_type, $entry_id) = @_;
  my $sql = 'delete from votes where entry_type = ? and entry_id = ? and username = ? returning *';
  $self->pg->db->query($sql, $entry_type, $entry_id, $self->username)->hash;
}

1;
