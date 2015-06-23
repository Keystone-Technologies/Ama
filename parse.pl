use strict;
use warnings;
use Data::Dumper qw(Dumper);
use HTML::Entities;
use Text::CSV_XS;
use Text::CSV::Slurp;

my $file = $ARGV[0] or die "File not found";

my $csv = Text::CSV_XS->new({ sep_char => ',', binary => 1 });
my $slurp = Text::CSV::Slurp->new();
my @data = $slurp->load(file => $file);

foreach (@data){

}
