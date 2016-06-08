function Question(id_input, text_input, votes_input, creator_input, time_created_input, flagged_input, answered_input, users_vote_input) {
    var id = id_input;
    var text = text_input;
    text = text.replace(/NEWLINEPLEASE/g, '<br/>');
    var votes = votes_input;
    var flagged = flagged_input;
    var creator = creator_input;
    var time_created = time_created_input;
    var comment_count = 0;
    var comments = [];
    var answered = answered_input;
    var users_vote = users_vote_input;
    if(users_vote != "up" && users_vote != "down")
        users_vote = "none";
    
    this.getId = function() {return id;}
    this.getText = function() {return text;}
    this.getVotes = function() {return votes;}
    this.getCreator = function() {return creator;}
    this.isFlagged = function() {return flagged;}
    this.isAnswered = function() {return answered;}
    this.getTimeCreated = function() {return time_created;}
    this.getCommentCount = function() {return comment_count}
    this.getUsersVote = function() {return users_vote;}
    
    this.getComment = function(index) {
        return comments[index];
    }
    
    this.getCommentById = function(id) {
        for(var i = 0; i < comment_count; i ++) {
            if(this.getComment(i).getId() == id) {
                return this.getComment(i);
            }
        }
        
        return null;
    }
    
    this.addComment = function(comment) {
        comments[comment_count ++] = comment;
    }
    
    this.setFlagged = function(flag) {
        flagged = flag; 
    }
    
    this.setUsersVote = function(vote) {
        users_vote = vote;
    }
    
    this.deleteComment = function() {
        comment_count --;
        //doesnt actually remove the question
        // but for the purposes of my webpage this works 100% fine
        // because after the page is initialized you wont need to 
        // loop through all the comments anymore
        // all you need to be able to do is get them by their id
        // but if for some reason someone changes this and actually removes
        // the question that is totally fine with me man
    }
}

function Comment(id_input, text_input, votes_input, creator_input, time_created_input, flagged_input, answer_input, users_vote_input) {
    var id = id_input;
    var text = text_input;
    text = text.replace(/\n/g, '<br/>');
    var votes = votes_input;
    var creator = creator_input;
    var time_created = time_created_input;
    var flagged = flagged_input;
    var answer = answer_input;
    var users_vote = users_vote_input;
    if(users_vote != "up" && users_vote != "down")
        users_vote = "none";
    
    this.getQuestId = function() {return id.substring(0, id.indexOf('_'));}
    this.getId = function() {return id;}
    this.getText = function() {return text;}
    this.getVotes = function() {return votes;}
    this.getCreator = function() {return creator;}
    this.getTimeCreated = function() {return time_created;}
    this.isAnswer = function() {return answer;}
    this.isFlagged = function() {return flagged;}
    this.getUsersVote = function() {return users_vote;}
    
    this.setFlagged = function(flag) {
        flagged = flag; 
    }
    
    this.setUsersVote = function(vote) {
        users_vote = vote;
    }
}

//STATIC VARIABLES hold all of the current database questions and number of questions
//also sets the post html to correct container
var questions = [];
var questionCount = 0;
var current_user = "007";
var HTMLforPost = "uninitialized";
var HTMLforComment = "uninitialized";

//sets the username based on what the server gives us
function setCurrentUser(name) {
    current_user = name;
}

function getCurrentUser() {
    return current_user;
}

//Adds a question to static list of questions and increases question count
function addQuestion(question) {
    questions[questionCount ++] = question;
}

//retrieves question from list at specified location
//  good for retreiving all questions if used inside loop
function getQuestion(loc) {
    return questions[loc];
}

//retrieves a question by its id
function getQuestionById(id) {
    for(var i = 0; i < getQuestionCount(); i ++) {
        if(getQuestion(i).getId() == id)
            return getQuestion(i);
    }
    return null;
}

//returns total number of questions
function getQuestionCount() {
    return questionCount;
}

//****************************************************************showing/hiding images or containers

//shows/hides new question container
function toggleQuestionForm() {
	$(".newQuestionContainer").slideToggle("slow");
	if($(".newQuestion").html() != "Cancel")
		$(".newQuestion").html("Cancel");
	else {
		$(".newQuestion").html("Ask A Question");
	}
}

//shows/hides reply form container
function toggleReplyForm(id) {
	$("#replyContainer_" + id).slideToggle("slow");
	if($("#replyButton_" + id).html() != "cancel")
		$("#replyButton_" + id).html("cancel");
	else {
		$("#replyButton_" + id).html("reply");
		$("#newPostTextArea_" + id).val("");
	}
}

//changes the flag image based on mouse position and post status
function changeFlag(id, dir) {
    var flagged = "";
    var post;
    if(id.toString().indexOf('_') != -1) {
        post = getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id);
    }
    else
        post = getQuestionById(id);
    
    if(dir == 'in' && !post.isFlagged())
        flagged = "red";
    if(dir == 'in' && post.isFlagged())
        flagged = "";
    if(dir == 'out' && !post.isFlagged())
        flagged = "";
    if(dir == 'out' && post.isFlagged())
        flagged = 'red';
    
    $("#flagImg_" + id).attr("src", "/img/" + flagged + "flag.png")
}

//changes vote image based on mouse position and post status
function changeVoteImg(id, dir, voteDir) {
    var post;
    if(id.toString().indexOf('_') == -1) {
        post = getQuestionById(id);
    }
    else {
        post = getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id);
    }
    
    if(dir == 'in' && post.getUsersVote() == voteDir) {
        $("#" + voteDir + "vote_" + post.getId()).attr('src', '/img/small' + voteDir + 'arrow.png');
    }
    if(dir == 'out' && post.getUsersVote() == voteDir) {
        $("#" + voteDir + "vote_" + post.getId()).attr('src', '/img/clickedsmall' + voteDir + 'arrow.png');
    }
    if(dir == 'in' && post.getUsersVote() != voteDir) {
        $("#" + voteDir + "vote_" + post.getId()).attr('src', '/img/clickedsmall' + voteDir + 'arrow.png');
    }
    if(dir == 'out' && post.getUsersVote() != voteDir) {
        $("#" + voteDir + "vote_" + post.getId()).attr('src', '/img/small' + voteDir + 'arrow.png');
    }
}

//changes the answer button image based on mouse position
function changeCheckMark(id, dir) {
    var comment = getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id);
    if(dir == 'in')
        $("#answerImg_" + comment.getId()).attr('src', '/img/checkedcheckmark.png');
    else
        $("#answerImg_" + comment.getId()).attr('src', '/img/checkmark.png');
}

//shows or hides comment container for a specific question
function toggleComments(id) {
    $("#commentsContainer_" + id).slideToggle("slow");
    if($("#showCommentsButton_" + id).html().indexOf("hide") == -1) {
        $("#showCommentsButton_" + id).html("hide comments<br> ");
        resizeComments(id);
    }
    else
        $("#showCommentsButton_" + id).html("show comments<br>(" + getQuestionById(id).getCommentCount() + ")");
}

//adds all questions with proper html to the content div
function initializeContent() {
    HTMLforPost = $(".singlePost").html();
    $(".singlePost").remove();
    HTMLforComment = $(".singleComment").html();
    $(".singleComment").remove();
    var contentHTML = ""; //this will be the html inserted into content
    var questionHTML = ""; //this will be html representing a single question
    var commentsHTML = ""; //this is html for all comments for a single question
    var commentHTML = "";  //html for single comment on a question
    var unanswered = true;
    
    for(var i = 0; i < getQuestionCount(); i ++) {
        questionHTML = HTMLforPost;
        var question = getQuestion(i);
        if(question.isAnswered() && unanswered) {
            unanswered = false;
            $(".unansweredTab").html(contentHTML);
            contentHTML = "";
        }
        questionHTML = questionHTML.replace(/ID/g, question.getId());
        questionHTML = questionHTML.replace(/VOTES/g, question.getVotes());
        questionHTML = questionHTML.replace(/TEXT/g, question.getText());
        questionHTML = questionHTML.replace(/NUMCOMMENTS/g, question.getCommentCount());
        questionHTML = questionHTML.replace(/TIMEASKED/g, question.getTimeCreated());
        contentHTML += questionHTML;
    }
    
    $(".answeredTab").html(contentHTML);
    
    for(var i = 0; i < getQuestionCount(); i ++) {
        var question = getQuestion(i);
        for(var j = 0; j < question.getCommentCount(); j ++) {
            var comment = question.getComment(j);
            commentHTML = HTMLforComment;
            commentHTML = commentHTML.replace(/ID/g, comment.getId());
            commentHTML = commentHTML.replace(/VOTES/g, comment.getVotes());
            commentHTML = commentHTML.replace(/TEXT/g, comment.getText());
            commentHTML = commentHTML.replace(/TIMEASKED/g, comment.getTimeCreated());
            commentsHTML += commentHTML;
        }
        $("#commentsContainer_" + question.getId()).html(commentsHTML);
        commentsHTML = "";
    }
    
    initializeLayout();
}

//will hide all unnecessary containers, 
// such as trash cans, answer buttons, reply forms etc
// not all containers are hidden is this function though,
// .content and .newQuestionContainer are hidden at top of
// index file
//also initializes flagged questions and answered questions etc..
function initializeLayout() {
    $(".commentsContainer").hide();
    for(var i = 0; i < getQuestionCount(); i ++)
    {
        var question = getQuestion(i);
        
        //initialy hides all reply containers
        $("#replyContainer_" + question.getId()).hide();
        
        $(".answeredTab").hide();
        $("#unansweredTabButton").css('background-color', 'white');
        
        if(getCurrentUser() != question.getCreator()) {
            $("#deleteButtonContainer_" + question.getId()).css('visibility', 'hidden');
        }
        
        if(question.isFlagged()) {
            hide(question.getId());
        }
        
        if(question.getUsersVote() == "up") {
            $("#upvote_" + question.getId()).attr('src', '/img/clickedsmalluparrow.png');
        }
        if(question.getUsersVote() == "down") {
            $("#downvote_" + question.getId()).attr('src', '/img/clickedsmalldownarrow.png');
        }
        
        for(var j = 0; j < question.getCommentCount(); j ++) {
            var comment = question.getComment(j);
            
            $("#commentPadding_" + comment.getId()).css('visibility', 'hidden');
            
            if(comment.isFlagged()) {
                hide(comment.getId());
            }
            if(comment.getCreator() != getCurrentUser()) {
                $("#deleteButtonContainer_" + comment.getId()).css('visibility', 'hidden');
            }
            if(comment.getUsersVote() == "up") {
                $("#upvote_" + comment.getId()).attr('src', '/img/clickedsmalluparrow.png');
            }
            if(comment.getUsersVote() == "down") {
                $("#downvote_" + comment.getId()).attr('src', '/img/clickedsmalldownarrow.png');
        }
        }
        
        //hides the answer button on questions for obvious reasons
        $("#answerButtonContainer_" + question.getId()).css('visibility', 'hidden');
        
        if(question.isAnswered()) {
            //hides or removes so containers to look neater
            $("#postContainer_" + question.getId()).css('height', '160px');
            $("#replyButton_" + question.getId()).remove();
            $("#upvote_" + question.getId()).remove();
            $("#voteInfoContainer_" + question.getId()).css('left', '0%');
            $("#downvote_" + question.getId()).remove();
            $("#buttonContainer_" + question.getId()).remove();
            $("#postTextAndInfoContainer_" + question.getId()).css('width', '90%');
            $("#postTextAndInfoContainer_" + question.getId()).css('left', '10%');
            for(var j = 0; j < question.getCommentCount(); j ++) {
                var comment = question.getComment(j);
                $("#upvote_" + comment.getId()).css('visibility', 'hidden');
                $("#downvote_" + comment.getId()).css('visibility', 'hidden');
                $("#flagImg_" + comment.getId()).remove()
                $("#deleteButtonContainer_" + comment.getId()).remove();
                if(comment.isAnswer()) {
                    $("#answerImg_" + comment.getId()).attr({onmouseenter: "", onmouseleave: "", onclick: "", src:"/img/checkedcheckmark.png"});
                }
                else {
                    $("#commentContainer_" + comment.getId()).css('background-color', 'd6d6d6');
                    $("#answerImg_" + comment.getId()).remove();
                }
            }
        }
    }
    
    window.setTimeout(resizePosts, 0.0000000000000000000000001);
}

//resizes all questions so if they have a lot of text, a scroll bar does not appear
function resizePosts() {
    for(var i = 0; i < getQuestionCount(); i ++) {
        var question = getQuestion(i);
        var str = $("#textContainer_" + question.getId()).css('height');
        var num = parseInt(str);
        var contHeight = parseInt($("#postTextContainer_" + question.getId()).css('height'));
        if(num > contHeight) {
            num = num + 110;
            num += "px";
            $("#postContainer_" + question.getId()).css('min-height', num);
        }
    }
}

//resizes comments
function resizeComments(id) {
    var question = getQuestionById(id);
    for(var j = 0; j < question.getCommentCount(); j ++) {
        var comment = question.getComment(j);
        var str = $("#textContainer_" + comment.getId()).css('height');
        var num = parseInt(str);
        var contHeight = parseInt($("#postTextContainer_" + question.getId()).css('height'));
        if(num >= contHeight) {
            num = num + 50;
            num += "px";
            $("#commentContainer_" + comment.getId()).css('min-height', num);
        }
    }
}

//removes a question from the database and from users screen
function deletePost(id) {
    //maybe josh it is a good idea to remove the comment from the question as well but as long as everyting works for now i will leave that in there cause
    //   dont look like leaving it in will harm anything for now yeah uhasufh uhauh yeah
    var type = "questions";
    var identy = id;
    if(id.toString().indexOf('_') != -1) {
        type = "comments";
        identy = id.substring(id.indexOf('_') + 1);
    }
    $.ajax({
        url: "/" + type + "/" + identy,
        type: 'DELETE',
        dataType: 'json'
    }).done(function(data){
        if (data) {
            if (data.question_id || data.comment_id){
                if(type == "questions") {
                    $("#postContainer_" + id).remove();
                    $("#commentContainer_" + id).remove();
                    $("#replyContainer_" + id).remove();
                }
                else {
                    getQuestionById(id.substring(0, id.indexOf("_"))).deleteComment();
                    $("#commentContainer_" + id).remove();
                    $("#commentPadding_" + id).remove();
                    
                }
            }
            else if (data.error){
                console.log(data.error, 3000);
            }
            else {
                console.log("Error", 3000);
            }
        }
        else {
            console.log("Error", 3000);
        }
    });
}

//hides a flagged question/comment
function hide(id) {
    $("#flagImg_" + id).attr('src', '/img/redflag.png');
    $("#upvote_" + id).css('visibility', 'hidden');
    $("#downvote_" + id).css('visibility', 'hidden');
    $("#replyButton_" + id).css('visibility', 'hidden');
    $("#postTextContainer_" + id).css('background-color', 'black');
    $("#textContainer_" + id).html("nice try");
    
    if($("#replyContainer_" + id).is(":visible")) {
        $("#replyButton_" + id).html("Reply");
        $("#replyContainer_" + id).hide();
    }
}

//shows a flagged question/comment
function show(id) {
    $("#flagImg_" + id).attr('src', '/img/flag.png');
    $("#upvote_" + id).css('visibility', 'visible');
    $("#downvote_" + id).css('visibility', 'visible');
    $("#replyButton_" + id).css('visibility', 'visible');
    $("#postTextContainer_" + id).css('background-color', 'transparent');
    
    if(id.toString().indexOf('_') == -1)
        $("#textContainer_" + id).html(getQuestionById(id).getText());
    else
        $("#textContainer_" + id).html(getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id).getText());
}

//sents vote report and changes vote image appropriately
function vote(id, dir) {
    var type = "questions";
    var identity = id;
    var opp = "down";
    if(opp == dir)
        opp = "up";
    if(id.toString().indexOf('_') != -1) {
        type = "comments";
        identity = id.substring(id.indexOf('_') + 1);
    }
    
    if(type == "questions") {
        var question = getQuestionById(id);
        question.setUsersVote(dir);
    }
    else {
        var comment = getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id);
        comment.setUsersVote(dir);
    }
    
    changeVoteImg(id, 'out', opp);
    
    $.post("/api/" + type + "/vote/" + identity + "/" + dir, function(data){
        $("#voteContainer_" + id).html(data.votes);
    }, 'json');
}

function sendFlagReport(id) {
    var type = "POST";
    var question;
    var comment;
    var url;
    
    //if the post is not a comment
    //  sets the url to correct url and gets the question
    if(id.toString().indexOf('_') == -1) {
        question = getQuestionById(id);
        url = "api/questions/flag/" + id;
        if(question.isFlagged())
            type = "DELETE";
    }
    
    //otherwise changes the url and gets the correct question and comment
    else {
        question = getQuestionById(id.substring(0, id.indexOf('_')));
        comment = question.getCommentById(id);
        url = "api/comments/flag/" + id.substring(id.indexOf('_') + 1);
        if(comment.isFlagged())
            type="DELETE";
    }
        
    $.ajax({
        url: url,
        type: type,
        dataType: 'json'
    }).done(function(data){
        if(data) {
            //if data has been sent back, success is assumed. 
            //  correctly hides or shows the correct post
            if(id.toString().indexOf('_') == -1) {
                if(question.isFlagged()) {
                    show(id)
                    question.setFlagged(0);
                    //makes sure that if a big post has been flagged and the page refreshed
                    // the post is resized when revelead
                    resizePosts();
                }
                else {
                    hide(id);
                    question.setFlagged(1);
                }
            }
            else {
                if(comment.isFlagged()) {
                    show(id)
                    comment.setFlagged(0);
                    resizeComments(id.substring(0,id.indexOf('_')));
                }
                else {
                    hide(id);
                    comment.setFlagged(1);
                }
            }
            
        }
        else
            console.log("Oh no an error!");
    });
}

//submits a reply to a specific page
function sendReply(id) {
    var text = $("#newPostTextArea_" + id).val();
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    
    //reply data to be sent
    var reply = {
        question_id: id,
        comment: text
    }
    
    $.ajax({
        url:"/questions/" + id + "/comment",
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        data: reply
    }).done(function(data) {
        //if the data sent back has a comment id, the reply was successfully sent
        if(data.comment_id)
        {
            //to have a reply sent without the page reloading, insert code here
            // and take our location.reload
            location.reload();
        }
    });
}

function markAnswer(id) {
    //marks a comment as the answer to a question
    // this cannot be undone, but in the future it would be nice to 
    // have a confirmation box pop up perhaps
    var question = getQuestionById(id.substring(0, id.indexOf('_')));
    var comment = question.getCommentById(id);
    $.post("/api/answers/" + question.getId() + "/" + comment.getId().substring(comment.getId().indexOf('_') + 1));
    location.reload();
}

function switchTab(tabName) {
    $('.tabButton').css('background-color', 'd6d6d6');
    $("#" + tabName + "TabButton").css('background-color', 'white');
    
    if(tabName == "unanswered") {
        $(".unansweredTab").show();
        $(".answeredTab").hide();
    }
    if(tabName == "answered") {
        $(".unansweredTab").hide();
        $(".answeredTab").show();
    }
    
    window.setTimeout(resizePosts, 0.0000001);
}

function test() {
    console.log("now testing answered url functions");
    
    $.get("/questions/1/votes/asc", function(data){
        console.log(data);
        $.each(data, function(i, v){
            console.log("we got somes datas");
            console.log(v.question_id);
        });
    }, 'json');
}