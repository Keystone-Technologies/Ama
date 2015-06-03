package Ama::Model::Votes;
use Mojo::Base -base;

has 'pg';

sub mine {
  my ($self, $entry_type, $username) = @_;
  my $sql = 'select count(*) as votes from votes where entry_type = ? and username = ?';
  return $self->pg->db->query($sql, $entry_type, $username)->hash;
}

sub count {
  my ($self, $entry_type, $entry_id) = @_;
  my $sql = 'select sum(case when vote = \'up\' then 1 else -1 end) as votes, sum(case when vote = \'up\' then 1 else 0 end) as votes_up, sum(case when vote = \'down\' then 1 else 0 end) as votes_down from votes where entry_type = ? and entry_id = ?';
  return $self->pg->db->query($sql, $entry_type, $entry_id)->hash;
}

sub cast {
  my ($self, $entry_type, $entry_id, $vote, $username) = @_;
  my $votes = $self->pg->db->query('select count(*) as votes from votes where entry_type = ? and entry_id = ? and username = ?', $entry_type, $entry_id, $username)->hash->{votes};
  if ( !$votes ) {
    my $sql = 'insert into votes (entry_type, entry_id, vote, username) values (?, ?, ?, ?)';
    $self->pg->db->query($sql, $entry_type, $entry_id, $vote, $username);
  } else {
    my $sql = 'update votes set vote = ?, modified = now() where entry_type = ? and entry_id = ? and username = ?';
    $self->pg->db->query($sql, $vote, $entry_type, $entry_id, $username);
  }
  $self->count($entry_type, $entry_id);
}

1;
