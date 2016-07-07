package Ama::Model::Votes;
use Mojo::Base -base;

has 'pg';
has 'username';
has 'vote_floor';

sub cast {
  my ($self, $entry_type, $entry_id, $vote) = @_;
  my $sql;
  my $results = eval {
    $self->uncast($entry_type, $entry_id);
    if ( $entry_type eq 'questions' ) {
      $sql = 'insert into votes (entry_type, entry_id, vote, username) select ?, ?, ?, ? where not answered(?) and not flagged(?, ?) returning *, votes(?, ?) as votes';
    } elsif ( $entry_type = 'comments' ) {
      $sql = 'insert into votes (entry_type, entry_id, vote, username) select ?, ?, ?, ? where not answered((select question_id from comments where comment_id = ?)) and not flagged(?, ?) returning *, votes(?, ?) as votes';
    } else {
      die "Unknown votes entry_type";
    }
    $self->pg->db->query($sql, $entry_type, $entry_id, $vote, $self->username, $entry_id, $entry_type, $entry_id, $entry_type, $entry_id)->hash;
  };
  
  my $votes = eval {$self->pg->db->query('select votes(?, ?) as votes', $entry_type, $entry_id)->hash->{votes}};
  
  if ($votes == $self->vote_floor){
    _autoRemove($self, $entry_type, $entry_id);
  }
  $@ ? {error => $@} : $results;
}

sub uncast {
  my ($self, $entry_type, $entry_id) = @_;
  my $results = eval {
    my $sql = 'delete from votes where entry_type = ? and entry_id = ? and username = ? returning *, votes(?, ?) as votes';
    $self->pg->db->query($sql, $entry_type, $entry_id, $self->username, $entry_type, $entry_id)->hash;
  };
  $@ ? { error => $@ } : $results;
}

sub _autoRemove {
  my ($self, $entry_type, $entry_id) = @_;
  my $sql;
  my $results = eval {
      if ($entry_type eq 'questions'){
        $sql = 'delete from questions where question_id = ?'
      }
      if ($entry_type eq 'comments'){
        $sql = 'delete from comments where comment_id = ?'
      }
      $self->pg->db->query($sql,  $entry_id)
    }; 
}

1;
