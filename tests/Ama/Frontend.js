casper.test.begin('Ama functionality', 3, function suite(test) {
    
casper.start('https://ama-jdorpinghaus.c9.io/questions', function() {
    casper.page.injectJs('https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js');
    test.assertExists('div#newquestion', 'Found question form');
    this.click('div#newquestion');
    this.fill('form#newquestionform', {
        'question': 'CasperTestQuestion'
    }, true);
});

idobject = '';
id = '';

casper.then(function(){
    x = require('casper').selectXPath;
    casper.waitForSelector(x("//*[text()='CasperTestQuestion']"), function(){
        this.test.assertExists(x("//*[text()='CasperTestQuestion']"), 'Question was created');
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

casper.then(function(){
    casper.waitForSelector(x("//*[text()='CasperEDITED']"), function(){
        this.test.assertExists(x("//*[text()='CasperEDITED']"), 'Question was edited')
        this.click("img#flag_" + id);
        index = this.getElementAttribute("img#flag_" + id, 'src').indexOf('flag');
        this.echo(index);
    });
});

casper.run(function() {
    test.done();
});

});