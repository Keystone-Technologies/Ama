
#!/usr/bin/perl
use CGI::Carp qw(fatalsToBrowser);

# The following accepts the data from the form and splits it into its component parts

if ($ENV{'REQUEST_METHOD'} eq 'POST') {

	read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
	
	@pairs = split(/&/, $buffer);
	
	foreach $pair (@pairs) {
		($name, $value) = split(/=/, $pair);
		$value =~ tr/+/ /;
		$value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
		$FORM{$name} = $value;
	}



# Then sends the email 

open (MESSAGE,"| /usr/sbin/sendmail -t");

	print MESSAGE "To: ajin\@keystone-it.com\n"; # Don't forget to escape this @ symbol!
	print MESSAGE "From: " . $FORM{name} . ", reader\n";
	print MESSAGE "Reply-to: " . $FORM{email} . "(" . $FORM{name} . ")\n";
	
	print MESSAGE "Subject: Feedback from $FORM{name} \n\n";
	
	print MESSAGE "$FORM{name} wrote:\n\n";
	print MESSAGE "Comment: $FORM{comment}\n\n";
	print MESSAGE "Sent by: $FORM{name} ($FORM{email}).\n";

close (MESSAGE);

&thank_you; #method call
} 



#The code then goes on to generate the thank-you page

sub thank_you {

print "Content-type: text/html\n\n";

print <<EndStart;

	<html>
	<head>
	<title>Thank You</title>
	</head>
	
	<body bgcolor="#ffffff" text="#000000">
	
	<h1>Thank You</h1>
	
	<p>Your feedback has been received. Thanks for sending it.</p>
	
	<hr>
	
	
EndStart

	print "<p>You wrote:</p>\n";
	print "<blockquote><em>$FORM{comment}</em></blockquote>\n\n";
	
print <<EndHTML;
	
	</body>
	</html>

EndHTML

exit(0);
}