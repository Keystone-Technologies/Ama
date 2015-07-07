casper.test.begin('Ama functionality', 21, function suite(test) {
    
// Create new question
casper.start('https://ama-jdorpinghaus.c9.io/questions', function() {
    test.assertExists('div#newquestion', 'Found question form');
    this.click('div#newquestion');
    this.fill('form#newquestionform', {
        'question': 'CasperTestQuestion'
    }, true);
});

idobject = '';
id = '';
commentid = '';

// Edit question
casper.then(function(){
    x = require('casper').selectXPath;
    casper.waitForSelector(x("//*[text()='CasperTestQuestion']"), function(){
        test.assertExists(x("//*[text()='CasperTestQuestion']"), 'Created question');
        idobject = this.getElementAttribute(x("//*[text()='CasperTestQuestion']"), 'id');
        id = /(\d+)/.exec(idobject);
        id=id[0];
        this.click("h1#" + idobject);
        this.fill('form#questionform_' + id, {
            'question': 'CasperEDITED'
        }, false);
        this.click("input#questioneditsubmit_" + id);
    });
});

// Flag/unflag question
casper.then(function(){
    casper.waitForSelector(x("//*[text()='CasperEDITED']"), function(){
        test.assertExists(x("//*[text()='CasperEDITED']"), 'Edited question')
        this.click("div#flagcontainer_" + id);
        casper.waitForSelector("img#flag_" + id, function (){
            test.assertNotEquals(this.getElementAttribute("img#flag_" + id, 'src').indexOf('red'), -1, 'Changed question flag image to red');
            this.click("div#flagcontainer_" + id);
            casper.waitForSelector("img#flag_" + id, function(){
                test.assertEquals(this.getElementAttribute("img#flag_" + id, 'src').indexOf('red'), -1, 'Changed question flag image to gray');
            });
        });
    });
});

//Vote down on question
casper.then(function(){
    casper.waitForSelector("p#count_" + id, function(){
        var count = this.fetchText("p#count_" + id);
        this.click("img#down_" + id);
        casper.waitForSelector("img#down_" + id, function(){
            test.assertNotEquals(this.getElementAttribute("img#down_" + id, 'src').indexOf('clicked'), -1, 'Changed downvote image');
            test.assertEquals(this.getElementAttribute("img#up_" + id, 'src').indexOf('clicked'), -1, "Didn't change upvote image");
            casper.waitForSelector("p#count_" + id, function(){
                test.assertEquals(Number(this.fetchText("p#count_" + id)), (Number(count) - 1), "Voted down on question");
            });
        });
    });
});

//Vote up on question
casper.then(function(){
    casper.waitForSelector("p#count_" + id, function(){
        var count = this.fetchText("p#count_" + id);
        this.click("img#up_" + id);
        casper.waitForSelector("img#up_" + id, function(){
            test.assertNotEquals(this.getElementAttribute("img#up_" + id, 'src').indexOf('clicked'), -1, 'Changed upvote image');
            test.assertEquals(this.getElementAttribute("img#down_" + id, 'src').indexOf('clicked'), -1, "Didn't change downvote image");
            casper.waitForSelector("p#count_" + id, function(){
                test.assertEquals(Number(this.fetchText("p#count_" + id)), (Number(count) + 2), "Voted up on question");
            });
        });
    });
});

//Add comment
casper.then(function(){
    this.click("h4#reply_" + id);
    casper.waitForSelector("form#commentform_" + id, function(){
        this.fill('form#commentform_' + id, {
            'comment': 'CasperComment'
        }, false);
        this.click("input#submit_" + id);
        casper.waitForSelector(x("//*[normalize-space()='CasperComment']"), function(){
            idobject = this.getElementAttribute(x("//*[normalize-space()='CasperComment']"), 'id');
            commentid = /(\d+)/.exec(idobject);
            commentid=commentid[0];
        });
    });
});

//Edit comment
casper.then(function(){
    this.click("span#" + idobject);
    test.assertExists("form#editcommentform_" + id, "Found edit comment form");
    this.fill('form#editcommentform_' + id, {
        'comment': 'CasperCommentEDITED'
        }, false);
    this.click("input#editsubmit_" + id);
    this.waitForSelector("span#" + idobject, function(){
        test.assertEquals(this.fetchText("span#" + idobject), 'CasperCommentEDITED', "Edited comment");
    });
});

// Flag/unflag comment
casper.then(function(){
   casper.waitForSelector("img#commentflag_" + commentid, function(){
      this.click("img#commentflag_" + commentid);
      casper.waitForSelector("img#commentflag_" + commentid, function(){ 
          test.assertNotEquals(this.getElementAttribute("img#commentflag_" + commentid, 'src').indexOf('red'), -1, 'Changed comment flag image to red');
          this.click("img#commentflag_" + commentid);
          casper.waitForSelector("img#commentflag_" + commentid, function(){
              test.assertEquals(this.getElementAttribute("img#commentflag_" + commentid, 'src').indexOf('red'), -1, 'Changed comment flag image to gray');
          });
      });
   });
});

// Vote down on comment
casper.then(function(){
    var count = this.fetchText("span#commentvotecount_" + commentid);
    this.click("img#commentdown_" + commentid);
    casper.waitForSelector("img#commentdown_" + commentid, function(){
        test.assertNotEquals(this.getElementAttribute("img#commentdown_" + commentid, 'src').indexOf('clicked'), -1, 'Changed comment downvote image');
        test.assertEquals(this.getElementAttribute("img#commentup_" + commentid, 'src').indexOf('clicked'), -1, "Didn't change comment upvote image");
        casper.waitForSelector("span#commentvotecount_" + commentid, function(){
            test.assertEquals(Number(this.fetchText("span#commentvotecount_" + commentid)), (Number(count) - 1), "Voted down on comment");
        });
   });
});

// Vote up on comment
casper.then(function(){
    var count = this.fetchText("span#commentvotecount_" + commentid);
    this.click("img#commentup_" + commentid);
    casper.waitForSelector("img#commentup_" + commentid, function(){
        test.assertNotEquals(this.getElementAttribute("img#commentup_" + commentid, 'src').indexOf('clicked'), -1, 'Changed comment upvote image');
        test.assertEquals(this.getElementAttribute("img#commentdown_" + commentid, 'src').indexOf('clicked'), -1, "Didn't change comment downvote image");
        casper.waitForSelector("span#commentvotecount_" + commentid, function(){
            test.assertEquals(Number(this.fetchText("span#commentvotecount_" + commentid)), (Number(count) + 2), "Voted up on comment");
        });
   });
});

casper.run(function() {
    test.done();
});

});