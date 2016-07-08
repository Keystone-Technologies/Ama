package Ama::Model::Answers;
use Mojo::Base -base;

has 'pg';
has 'username';
has 'admin';

sub mark {
  my ($self, $comment_id, $question_id) = @_;
  my $results = eval {
    my $tx = $self->pg->db->begin;
    $self->unmark($comment_id, $question_id);
    my $sql = 'update questions set created = now() where question_id = ? returning *';
    my $results = $self->pg->db->query($sql, $question_id)->hash;
    my $submitter = $self->pg->db->query('select username from comments where comment_id = ?', $comment_id)->hash->{username};
    
    warn "Submitter: $submitter \n\nCommentID: $comment_id \n\nUsername: $self->{username}";
    
    if($self->{username} eq $submitter || $self->{admin} == 1) {
      $sql = 'insert into answers (comment_id, question_id, username) values (?, ?, ?) returning *';
      $results = $self->pg->db->query($sql, $comment_id, $question_id, $submitter)->hash;
    }
    
    $tx->commit;
    $results;
  };
  $@ ? { error => $@ } : $results;
}

sub unmark {
  my ($self, $comment_id, $question_id) = @_;
  my $results = eval {
    if($self->{admin} ==1) {
      my $sql = 'delete from answers where comment_id = ? and question_id = ? returning *';
      $self->pg->db->query($sql, $comment_id, $question_id)->hash;
    }  
    else {
      my $sql = 'delete from answers where comment_id = ? and question_id = ? and exists (select username from questions where question_id = ? and username = ?) returning *';
      $self->pg->db->query($sql, $comment_id, $question_id, $question_id, $self->username)->hash;
    }  
    };
  $@ ? { error => $@ } : $results;
}

1;
