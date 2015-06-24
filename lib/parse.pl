use strict;
use warnings;
use Data::Dumper qw(Dumper);
use HTML::Entities;
use Text::CSV_XS;
use Text::CSV::Slurp;
use Ama::Model::Questions;
use Mojo::Pg;

my $pg = Mojo::Pg->new('postgresql://mojo:mojo@/test1'); 

my $file = $ARGV[0] or die "File not found";

my $slurp = Text::CSV::Slurp->new();
my $data = $slurp->load(file => $file);

my @results;
foreach (@$data){
    my $result = Ama::Model::Questions::addmultiple($pg, decode_entities($_->{'Text'}), $_->{'Time Created'}, $_->{'Plus Votes'}, $_->{'Minus Votes'});
    push @results, $result;
}
print "Done. Added " . ($#results + 1) . " questions.";