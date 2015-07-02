package Ama::Model::Votes;
use Mojo::Base -base;

has 'pg';
has 'username';

sub cast {
  my ($self, $entry_type, $entry_id, $vote) = @_;
  my $results = eval {
    $self->_uncast($entry_type, $entry_id);
    my $sql;
    if ( $entry_type eq 'questions' ) {
      $sql = 'insert into votes (entry_type, entry_id, vote, username) select ?, ?, ?, ? where not answered(?) and not flagged(?, ?) returning *, votes(?, ?) as votes';
    } elsif ( $entry_type = 'comments' ) {
      $sql = 'insert into votes (entry_type, entry_id, vote, username) select ?, ?, ?, ? where not answered((select question_id from comments where comment_id = ?)) and not flagged(?, ?) returning *, votes(?, ?) as votes';
    } else {
      die "Unknown votes entry_type";
    }
    $self->pg->db->query($sql, $entry_type, $entry_id, $vote, $self->username, $entry_id, $entry_type, $entry_id, $entry_type, $entry_id)->hash;
  };
  $@ ? {error => $@} : $results;
}

sub _uncast {
  my ($self, $entry_type, $entry_id) = @_;
  my $results = eval {
    my $sql = 'delete from votes where entry_type = ? and entry_id = ? and username = ? returning *, votes(?, ?) as votes';
    $self->pg->db->query($sql, $entry_type, $entry_id, $self->username, $entry_type, $entry_id)->hash;
  };
  $@ ? { error => $@ } : $results;
}

1;
