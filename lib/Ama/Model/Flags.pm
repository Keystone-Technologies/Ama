package Ama::Model::Flags;
use Mojo::Base -base;

has 'pg';
has 'username';

sub raise {
  my ($self, $entry_type, $entry_id) = @_;
  my $results = eval {
    my $sql;
    if ( $entry_type eq 'questions' ) {
      $sql = 'insert into flags (entry_type, entry_id, username) select ?, ?, ? where not flagged(?) returning *';
    } elsif ( $entry_type eq 'comments' ) {
      $sql = 'insert into flags (entry_type, entry_id, username) select ?, ?, ? where not flagged((select question_id from comments where comment_id = ?)) returning *';
    } else {
      die "Unknown flags entry_type";
    }
    $self->pg->db->query($sql, $entry_type, $entry_id, $self->username, $entry_id)->hash;
  };
  $@ ? { error => $@ } : $results;
}

sub remove {
  my ($self, $entry_type, $entry_id) = @_;
  my $results = eval {
    my $sql;
    if ( $entry_type eq 'questions' ) {
      $sql = 'delete from flags where entry_type = ? and entry_id = ? and username = ? and flagged(?) returning *';
    } elsif ( $entry_type eq 'comments' ) {
      $sql = 'delete from flags where entry_type = ? and entry_id = ? and username = ? and flagged((select question_id from comments where comment_id = ?)) returning *';
    } else {
      die "Unknown flags entry_type";
    }
    $self->pg->db->query($sql, $entry_type, $entry_id, $self->username, $entry_id)->hash;
  };
  $@ ? { error => $@ } : $results;
}

1;
