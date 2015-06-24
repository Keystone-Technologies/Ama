function setunderline(elementid) {
    document.getElementById(elementid).style.textDecoration='underline';
    if (elementid == 'date'){
        document.getElementById('popularity').style.textDecoration='none';
        }
    if (elementid == 'popularity'){
        document.getElementById('date').style.textDecoration='none';
        }
}

function arrowhover(elementid, elementclass, action) {
    if (action == 'over') {
        if (elementclass.includes('up')) {
            document.getElementById(elementid).src='img/clickeduparrow.png';
        }
        if (elementclass.includes('down')) {
            document.getElementById(elementid).src='img/clickeddownarrow.png';
        }
    }
    else {
        if (elementclass.includes('up')) {
            document.getElementById(elementid).src='img/uparrow.png';
        }
        if (elementclass.includes('down')) {
            document.getElementById(elementid).src='img/downarrow.png';
        }
    }
}

function smallarrowhover(elementid, elementclass, action) {
    if (action == 'over') {
        if (elementclass.includes('up')) {
            document.getElementById(elementid).src='img/clickedsmalluparrow.png';
        }
        if (elementclass.includes('down')) {
            document.getElementById(elementid).src='img/clickedsmalldownarrow.png';
        }
    }
    else {
        if (elementclass.includes('up')) {
            document.getElementById(elementid).src='img/smalluparrow.png';
        }
        if (elementclass.includes('down')) {
            document.getElementById(elementid).src='img/smalldownarrow.png';
        }
    }
}

function answerbuttonhover(comment_id, marked, action){
    console.log(comment_id);
    if (action){
        if (marked){
            document.getElementById(comment_id).src='img/checkmark.png';
        }
        else {
            document.getElementById(comment_id).src='img/checkedcheckmark.png';
        }
    }
    else {
        if (marked){
            document.getElementById(comment_id).src='img/checkedcheckmark.png';
        }
        else {
            document.getElementById(comment_id).src='img/checkmark.png';
        }
    }
}

function answerbuttonclick(roughcomment_id, marked, question_id){
    var cleanidobject = /(\d+)/.exec(roughcomment_id);
    var comment_id = cleanidobject[1];
    $("#markanswer_" + comment_id).attr("onmouseover", "");
    $("#markanswer_" + comment_id).attr("onmouseout", "");
    console.log(marked);
    if (marked){
        $("#markanswer_" + comment_id).attr("src", "img/checkmark.png");
        $.ajax({
            url: "/api/answers/" + question_id + "/" + comment_id,
            type: 'DELETE'
        });
        $("#comment_" + comment_id).css("background", "");
        $("#markanswer_" + comment_id).attr("onclick", "answerbuttonclick(" + comment_id + ", false, " + question_id + ");");
        $("#markanswer_" + comment_id).attr("onmouseover", "answerbuttonhover(this.id, false, true);");
        $("#markanswer_" + comment_id).attr("onmouseout", "answerbuttonhover(this.id, false, false);");
    }
    else {
        $("#markanswer_" + comment_id).attr("src", "img/checkedcheckmark.png");
        $("#comment_" + comment_id).siblings().children(".markanswerbutton").attr("onclick", "answerbuttonclick(this.id, false, " + question_id + ");");
        $("#comment_" + comment_id).siblings().children(".markanswerbutton").attr("src", "img/checkmark.png");
        $("#comment_" + comment_id).siblings().children(".markanswerbutton").attr("onmouseover", "answerbuttonhover(this.id, false, true);");
        $("#comment_" + comment_id).siblings().children(".markanswerbutton").attr("onmouseout", "answerbuttonhover(this.id, false, false);");
        $("#comment_" + comment_id).siblings().css("background", "");
        $("#markanswer_" + comment_id).attr("onclick", "answerbuttonclick(" + comment_id + ", true, " + question_id + ");");
        $("#markanswer_" + comment_id).attr("onmouseover", "answerbuttonhover(this.id, true, true);");
        $("#markanswer_" + comment_id).attr("onmouseout", "answerbuttonhover(this.id, true, false);");
            var oldanswerid = $("#comment_" + comment_id).siblings().children(".markanswerbutton[answered='true']").attr('id')
            $("#comment_" + comment_id).siblings().children(".markanswerbutton").attr("answered", "false");
        $("#markanswer_" + comment_id).attr("answered", "true");
            console.log("oldanswerid: " + oldanswerid)
            if (oldanswerid != null){
            var idobject = /(\d+)/.exec(oldanswerid);
            var newid = idobject[1];
            $.ajax({
                url: "/api/answers/" + question_id + "/" + newid,
                type: 'DELETE',
                complete: (function(){console.log("completed delete");$.post("/api/answers/" + question_id + "/" + comment_id);
                })
            });
            }
            else {
                $.post("/api/answers/" + question_id + "/" + comment_id);
            }
        $("#comment_" + comment_id).css("background", "#ffffff");
        console.log("white " + comment_id)
        }
}
    
function trashhover(id, over){
    if (over){
        $("#" + id).attr("src", "/img/opentrash.png");
    }
    else {
        $("#" + id).attr("src", "/img/trash.png");
    }
}

function flaghover(id, over){
    if (over){
        $("#" + id).attr("src", "/img/redflag.png");
    }
    else {
        $("#" + id).attr("src", "/img/flag.png");
    }
}

function redflaghover(id, over){
    if (over){
        $("#" + id).attr("src", "/img/flag.png");
    }
    else {
        $("#" + id).attr("src", "/img/redflag.png");
    }
}

function showError(time){
    console.log("called error");
    $("#errorcontainer").css('opacity', 1);
    $("#errorcontainer").animate({top: '50px'}, 250).delay(time).animate({top: '0px', opacity: 0}, 250);
}

function questionredflagclick(question_id, votes){
    $.ajax({
        url: url_for('raise_flag', {entry_type : 'questions', entry_id : question_id}),
        type: 'DELETE',
        dataType: 'json'
   })
   .done(function(data) {
       console.log(data);
        if (data == null){
            console.log('Showing error')
           $("#errorcontainer").html("Error");
           showError(3000);
        }
        else {
            if (data.error != null) {
                $("#errorcontainer").html("Error: " + data.error);
            }
            else {
                $("#flag_" + question_id).attr('src', '/img/flag.png');
                $("#flag_" + question_id).attr('onmouseover', 'flaghover(this.id, true)');
                $("#flag_" + question_id).attr('onmouseout', 'flaghover(this.id, false)');
                $("#flag_" + question_id).attr('title', 'Unflag Question');
                $("#questiontitle_" + question_id).css('background', '');
                $("#vote_" + question_id).css('display', 'block');
                $("#flaggedcount_" + question_id).remove();
                $("#reply_" + question_id).css('display', 'block');
                $("#countcontainer_" + question_id).css('display', 'block');
                $("#flagcontainer_" + question_id).unbind('click');
                $("#flagcontainer_" + question_id).click(function(){questionflagclick(question_id, votes)});
            }
        }
       
    });
}

function questionflagclick(question_id, votes){
    console.log('into post');
    $.post(url_for('raise_flag', {entry_type : 'questions', entry_id : question_id}))
    .done(function(data) {
        console.log(data);
        if (data == null){
           $("#errorcontainer").html("Error");
           showError(3000);
        }
        else {
            if (data.error != null) {
                $("#errorcontainer").html("Error: " + data.error);
            }
            else {
                $("#flag_" + question_id).attr('src', '/img/redflag.png');
                $("#flag_" + question_id).attr('onmouseover', 'redflaghover(this.id, true)');
                $("#flag_" + question_id).attr('onmouseout', 'redflaghover(this.id, false)');
                $("#flag_" + question_id).attr('title', 'Unflag Question');
                $("#questiontitle_" + question_id).css('background', '#000000');
                $("#vote_" + question_id).css('display', 'none');
                $("#reply_" + question_id).css('display', 'none');
                $("#countcontainer_" + question_id).css('display', 'none');
                $("#questionbuttoncontainer_" + question_id).prepend("<div id='flaggedcount_" + question_id + "' class='flaggedcount'><p class='countnumber'>" + votes + "</p></div>");
                $("#flagcontainer_" + question_id).unbind('click');
                $("#flagcontainer_" + question_id).click(function(){questionredflagclick(question_id, votes)});
            }
        }
    });
}

function commentredflagclick(comment_id){
    $.ajax({
        url: url_for('raise_flag', {entry_type : 'comments', entry_id : comment_id}),
        type: 'DELETE',
        dataType: 'json'
   })
   .done(function(data) {
       console.log(data);
        if (data == null){
            console.log('Showing error')
           $("#errorcontainer").html("Error");
           showError(3000);
        }
        else {
            if (data.error != null) {
                $("#errorcontainer").html("Error: " + data.error);
            }
            else {
                $("#commentflag_" + comment_id).attr('src', '/img/flag.png');
                $("#commentflag_" + comment_id).attr('onmouseover', 'flaghover(this.id, true)');
                $("#commentflag_" + comment_id).attr('onmouseout', 'flaghover(this.id, false)');
                $("#commentflag_" + comment_id).attr('title', 'Flag Comment');
                $("#commenttext_" + comment_id).css('background', '');
                $("#commentvotecontainer_" + comment_id).css('display', 'flex');
                if ($("#markanswer_" + comment_id).attr('showable') == 'true'){
                   $("#markanswer_" + comment_id).css('display', 'block'); 
                }
                $("#commentflag_" + comment_id).unbind('click');
                $("#commentflag_" + comment_id).click(function(){commentflagclick(comment_id)});
            }
        }
       
    });
}

function commentflagclick(comment_id){
    console.log('into post');
    $.post(url_for('raise_flag', {entry_type : 'comments', entry_id : comment_id}))
    .done(function(data) {
        console.log(data);
        if (data == null){
           $("#errorcontainer").html("Error");
           showError(3000);
        }
        else {
            if (data.error != null) {
                $("#errorcontainer").html("Error: " + data.error);
            }
            else {
                $("#commentflag_" + comment_id).attr('src', '/img/redflag.png');
                $("#commentflag_" + comment_id).attr('onmouseover', 'redflaghover(this.id, true)');
                $("#commentflag_" + comment_id).attr('onmouseout', 'redflaghover(this.id, false)');
                $("#commentflag_" + comment_id).attr('title', 'Unflag Question');
                $("#commenttext_" + comment_id).css('background', '#000000');
                $("#commentvotecontainer_" + comment_id).css('display', 'none');
                $("#markanswer_" + comment_id).css('display', 'none');
                $("#commentflag_" + comment_id).unbind('click');
                $("#commentflag_" + comment_id).click(function(){commentredflagclick(comment_id)});
            }
        }
    });
}

function loadcomments(){
    
}