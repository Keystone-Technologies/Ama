//Post object could be a Question or a Comment
function Post(question_id_input, comment_id_input, text_input, votes_input, creator_input, time_created_input, flagged_input, users_vote_input, type_input,//shared
                comment_count_input, answered_input, //question specific
                answer_input) { //comment specific
    //Paramters that both questions and comments share
    var question_id = question_id_input;
    var text = text_input; //holds the text for question/comment
    text = text.replace(/\n/g, '<br/>');
    var votes = votes_input;
    var creator = creator_input; 
    var time_created = time_created_input;
    var flagged = flagged_input;
    var users_vote = users_vote_input;
    if(users_vote != "up" && users_vote != "down")
        users_vote = "none";
    var type = type_input; //type can be 'question' or 'comment'
    
    //Parameters specific to a Question
    var comment_count = comment_count_input; //number of comments on a question
    var comments = [];                       //array to hold comments when loaded
    var comments_shown = false;              //variable telling whether or not the comments are currently shown on screen
    var answered = answered_input;           //if the question is answered
    
    //Parameters specific to a Comment
    var comment_id = comment_id_input;
    var answer = answer_input;               //true if this is the answer to its question
    
    this.getQuestionId = function() {return question_id;};
    this.getText = function() {return text;};
    this.getVotes = function() {return votes;};
    this.getCreator = function() {return creator;};
    this.isFlagged = function() {return flagged;};
    this.getTimeCreated = function() {return time_created;};
    this.getUsersVote = function() {return users_vote;};
    this.getType = function() {return type;};
    
    //functions
    this.setFlagged = function(flag) {
        flagged = flag; 
    };
    
    this.setUsersVote = function(vote) {
        users_vote = vote;
    };
    
    //*************************************************************Question Specific Funtions
    this.isAnswered = function() {return answered;};
    this.getCommentCount = function() {return comment_count;};
    this.getCommentsShown = function() {return comments_shown;};
    
    this.setCommentCount = function(count) {
        comment_count = count;
    };
    
    this.getComment = function(index) {
        return comments[index];
    };
    
    this.getCommentById = function(id) {
        for(var i = 0; i < comment_count; i ++) {
            if(this.getComment(i).getId() == id) {
                return this.getComment(i);
            }
        }
        
        return null;
    };
    
    this.addComment = function(comment) {
        comments[comment_count ++] = comment;
    };
    
    this.setCommentsShown = function(shown) {
        comments_shown = shown;
    };
    
    this.deleteComment = function() {
        comment_count --;
        //doesnt actually remove the comment from memory 
        //  only changes comment count for accurate display 
        //  for show comments(commentcount)
    }
    
    //************************************************************Comment Specific Functions
    this.getCommentId = function() {return comment_id;};
    this.isAnswer = function() {return answer;};
}

//STATIC VARIABLES
var questions = [];                     //holds all questions currently loaded
var questionCount = 0;                  //holds the total number of questions loaded
var current_user = "007";               //holds the username assigned to the user by the server, used to determine if a user can delete stuff, etc...
var HTMLforPost = "uninitialized";      //html to be extracted from index page and stored in memory used on each new question
var HTMLforComment = "uninitialized";   //same but for one comment
var defaultPostSize = 0;                //Default height of a post, used to determine if the user is on mobile or desktop
var deviceType = "mobile";              //Initially assumes mobile and is changed further down if the user is on desktop
var defaultLimit = 15;                  //default limit on number of questions to display
var openMenu = "none";                  //currently opened menu (ex. 'sort', 'search', etc...) used in close menu function

//filter settings
var filters = [];                       //holds all of the current filters used, seen below
                                        //used when reloading the questions
filters["creator"] = "all";
filters["answered"] = 0;
filters["orderby"] = "votes";
filters["direction"] = "desc";
filters["keyword"] = "none";
filters["limit"] = defaultLimit;

function getFilter(type) {
    return filters[type];
}

function setFilter(type, value) {
    filters[type] = value;
}

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
        if(getQuestion(i).getQuestionId() == id)
            return getQuestion(i);
    }
    return null;
}

//checks all the comments on each question, only if the comments are visible
function getCommentById(id) {
    for(var i = 0; i < getQuestionCount(); i ++) {
        if(getQuestion(i).getCommentsShown()) {
            for(var j = 0; j < getQuestion(i).getCommentCount(); j ++) {
                if(getQuestion(i).getComment(j).getId() == id) {
                    return getQuestion(i).getComment(j);
                }
            }
        }
    }
    return null;
}

//returns total number of questions
function getQuestionCount() {
    return questionCount;
}

function clearQuestions() {
    questionCount = 0;
    //simulates clearing the questions
    //  as of now there is no reason to actually remove them all from memory
}

//****************************************************************showing/hiding images or containers

//shows/hides new question container
function toggleQuestionForm() {
	$(".newQuestionContainer").slideToggle("slow", function() {
	    //when the animation is done playing, focuses the keyboard on the textarea
	    $("#newQuestionTextarea").focus();
	});
	
	if($(".newQuestion").html() != "Cancel") {
	  	$(".newQuestion").html("Cancel");
	}
	else {
        $(".newQuestion").html("Ask A Question");
	    $("#newQuestionTextarea").val("");
	}
}

//shows/hides reply form container
function toggleReplyForm(id) {
	$("#replyContainer_" + id).slideToggle("slow", function(){
	    $("#newPostTextArea_" + id).focus();
	});
	if($("#replyButton_" + id).html() != "cancel")
		$("#replyButton_" + id).html("cancel");
	else {
		$("#replyButton_" + id).html("reply");
		$("#newPostTextArea_" + id).val("");
	}
}

//changes the flag image based on mouse position and post status
//  type is the type of post ('comment' or 'question')
//  id is id
//  dir is the direction of the mouse (if the mouse is going in or out)
function changeFlag(type, id, dir) {
    var flagged = "";  //if left blank, image will be normal flag. If changed to 'red' image will be redflag
    var post;          //post to change the flag color on
    
    if(type == "question")
        post = getQuestionById(id);
    else
        post = getCommentById(id);
    
    //determines what color the flag must be based on if it is flagged and where the mouse is
    if(dir == 'in' && !post.isFlagged())
        flagged = "red";
    if(dir == 'out' && post.isFlagged())
        flagged = 'red';
    
    $("#flagImg_" + id).attr("src", "/img/" + flagged + "flag.png"); //sets the flag image accordingly
}

//changes vote image based on mouse position and post status
//  type is the type of post ('comment' or 'question')
//  id is id
//  dir is the direction of the mouse (if the mouse is going in or out)
//  voteDir is if the image being hovered over is for the upvote or downvote ('up' or 'down')
function changeVoteImg(type, id, dir, voteDir) {
    var post;          //post to change the vote color on
    var clicked = "";  //if the image needs to become the clicked version of it, this string becomes "clicked"
    
    if(type == "question")
        post = getQuestionById(id);
    else
        post = getCommentById(id);
    
    if(dir == 'out' && post.getUsersVote() == voteDir)
        clicked = "clicked";
    if(dir == 'in' && post.getUsersVote() != voteDir)
        clicked = "clicked";
    
    $("#" + voteDir + "vote_" + post.getId()).attr('src', '/img/' + clicked + 'small' + voteDir + 'arrow.png');
}

//changes the answer button image based on mouse position
//  id is id
//  dir is if mouse is going in or out
function changeCheckMark(id, dir) {
    var comment = getCommentById(id);  //comment that checkmark img is chaning
    var checked = "";                  //changes to 'checked' if the img needs to be checkedcheckmark
    
    if(dir == 'in')
        checked = "checked";
        
    $("#answerImg_" + comment.getId()).attr('src', '/img/' + checked + 'checkmark.png');
}

//adds all questions with proper html to the content div
function initializeContent() {
    var contentHTML = ""; //this will be the html inserted into content
    var questionHTML = ""; //this will be html representing a single question
    
    if(getQuestionCount() == "0"){
        $(".content").html('no result found, please search again!');
    }
    else{
        for(var i = 0; i < getQuestionCount(); i ++) {
            questionHTML = HTMLforPost;    //resets html for one question
            var question = getQuestion(i);
            questionHTML = questionHTML.replace(/ID/g, question.getQuestionId());
            questionHTML = questionHTML.replace(/VOTES/g, question.getVotes());
            questionHTML = questionHTML.replace(/TEXT/g, question.getText());
            questionHTML = questionHTML.replace(/NUMCOMMENTS/g, question.getCommentCount());
            questionHTML = questionHTML.replace(/TIMEASKED/g, question.getTimeCreated());
            contentHTML += questionHTML;  //adds the html for one new question filled with infoto content
        }
       $(".content").html(contentHTML); 
    }
    initializeLayout();
}

//will hide all unnecessary containers, 
// such as trash cans, answer buttons, reply forms etc
// not all containers are hidden is this function though,
// check top of index file for more default hidden containers
function initializeLayout() {
    //hides all comments and reply containers
    $(".commentsContainer").hide();
    $(".replyContainer").hide();
    
    //iterates through each question and hides certain containers within it
    for(var i = 0; i < getQuestionCount(); i ++)
    {
        var question = getQuestion(i);
        
        //hides all trash cans on questions the current user does not own
        if(getCurrentUser() != question.getCreator()) {
            $("#deleteButtonContainer_" + question.getId()).css('visibility', 'hidden'); //changing css visibility to hidden hides the div but lets it keep space where it was
        }
        
        if(question.isFlagged()) {
            hide(question.getId());
        }
        
        //sets the initial image for what the users vote is
        if(question.getUsersVote() == "up") {
            $("#upvote_" + question.getId()).attr('src', '/img/clickedsmalluparrow.png');
        }
        if(question.getUsersVote() == "down") {
            $("#downvote_" + question.getId()).attr('src', '/img/clickedsmalldownarrow.png');
        }
        
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
            $("#timeAskedContainer_" + question.getId()).html("Answered on " + question.getTimeCreated());
            $("#timeAskedContainer_" + question.getId()).css('width', '65%');
        }
    }
    
    window.setTimeout(resizePosts, 0.00000000001);
}

//intitializes layout of all comments of a specific question
function initializeCommentLayout(id) {
    var question = getQuestionById(id);
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
        if(question.isAnswered()) {
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

//resizes all questions so if they have a lot of text, a scroll bar does not appear
function resizePosts() {
    for(var i = 0; i < getQuestionCount(); i ++) {
        var question = getQuestion(i);
        
        if(defaultPostSize == 0) {
            defaultPostSize = parseInt($("#postContainer_" + question.getId()).css('height'));
            if(defaultPostSize < 275)
                deviceType = "desktop";
        }
        
        var str = $("#textContainer_" + question.getId()).css('height');
        var num = parseInt(str);
        var contHeight = parseInt($("#postTextContainer_" + question.getId()).css('height'));
        num = num + 110;
        
        if(num < defaultPostSize) {
            num = defaultPostSize;
        }
        
        num += "px";
        $("#postContainer_" + question.getId()).css('min-height', num);
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
            $("#commentContainer_" + comment.getId()).css('height', num);
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
                    $("#postContainer_" + id).css('height', $("#postContainer_" + id).css('min-height'));
                    $("#postContainer_" + id).css('min-height', '0px');
                    $("#postContainer_" + id).hide(2000, function() {
                        $("#postContainer_" + id).remove();
                    });
                    $("#commentsContainer_" + id).hide(2000, function() {
                        $("#commentsContainer_" + id).remove();
                    })
                    $("#replyContainer_" + id).hide(2000, function() {
                        $("#replyContainer_" + id).remove();
                    });
                }
                else {
                    getQuestionById(id.substring(0, id.indexOf("_"))).deleteComment();
                    $("#commentContainer_" + id).hide(2000, function() {
                        $("#commentContainer_" + id).remove();
                    });
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
    var post;
    if(opp == dir)
        opp = "up";
    if(id.toString().indexOf('_') != -1) {
        type = "comments";
        identity = id.substring(id.indexOf('_') + 1);
    }
    
    if(type == "questions") {
        post = getQuestionById(id);
    }
    else {
        post = getQuestionById(id.substring(0, id.indexOf('_'))).getCommentById(id);
    }
    
    if(post.getUsersVote() == dir) {
        $.ajax({
            url: "/api/" + type + "/vote/" + identity,
            type: 'delete',
            dataType: 'json'
        }).done(function(data) {
            $("#voteContainer_" + id).html(data.votes);
            post.setUsersVote('none');
            changeVoteImg(id, 'out', dir);
        });
        return;
    }
    
    $.post("/api/" + type + "/vote/" + identity + "/" + dir, function(data){
        $("#voteContainer_" + id).html(data.votes);
        post.setUsersVote(dir);
        changeVoteImg(id, 'out', opp);
        changeVoteImg(id, 'out', dir);
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
            console.log("Oh no an error!"); //hah probably make this more specific
    });
}

function submitQuestion() {
    var text = $("#newQuestionTextarea").val();
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    
    var question = {
        question: text
    };
    
    $.ajax({
        url:"/questions",
        type: "POST",
        contentType:"application/x-www-form-urlencoded",
        dataType: 'json',
        data: question
    }).done(function(data) {
        if(data.question_id) {
            toggleQuestionForm();
            setFilter('creator', 'all');
            setFilter('answered', '0');
            setFilter('orderby', 'created');
            setFilter('direction', 'desc');
            changeQuestions();
        }
    });
}

//submits a reply to a specific question
function sendReply(id) {
    var text = $("#newPostTextArea_" + id).val();
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    
    //reply data to be sent
    var reply = {
        question_id: id,
        comment: text
    };
    
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
            toggleReplyForm(id);
            if($("#showCommentsButton_" + id).html().indexOf("hide") != -1) {
                toggleComments(id);
            }
            toggleComments(id);
        }
    });
}

function markAnswer(id) {
    //marks a comment as the answer to a question
    // this cannot be undone, but in the future it would be nice to 
    // have a confirmation box pop up perhaps
    var question = getQuestionById(id.substring(0, id.indexOf('_')));
    var comment = question.getCommentById(id);
    $.post("/api/answers/" + question.getId() + "/" + comment.getId().substring(comment.getId().indexOf('_') + 1)).done(function(data) {
        if(data.question_id) {
            setFilter('creator', 'all');
            setFilter('answered', '1');
            setFilter('orderby', 'created');
            setFilter('direction', 'desc');
            changeQuestions();
        }
    });
}

function changeQuestions() {
    //add spinner eventually
    
    var creator = filters["creator"];
    var answered = filters["answered"];
    var orderby = filters["orderby"];
    var direction = filters["direction"];
    var limit = filters["limit"];
    var keyword = filters["keyword"];
    
    clearQuestions();
    
    $.get("/questions/" + creator + "/" + answered + "/" + orderby + "/" + direction + "/" + limit + "/" + keyword, function(data){
        $.each(data, function(i, v){
        	var question = new Question(v.question_id, v.question.replace(/\n/g, '</br>'), v.votes, v.username, v.created, v.comment_count, v.flagged, v.answered, v.my_vote);
        	addQuestion(question);
        });
    }, 'json').done(function() {
    	initializeContent();
        
        var filter = "";
        
        filter += creator + " ";
        
        if(answered == 0)
            filter += "un"
        filter += "answered questions by "
         
        if(orderby == "votes") {
            if(direction == "asc")
                filter += "least ";
            else
                filter += "most ";
                
            filter += "votes";
        }
        else {
            if(direction == "asc")
                filter += "oldest";
            else 
                filter += "newest";
        }
        
        if(keyword != 'none') {
            if(deviceType == "desktop")
                filter += " | ";
            else
                filter += "</br>";
            filter += "search: " + keyword;
            filter += " <div class='clearButton' onclick='setFilter(\"keyword\", \"none\");changeQuestions()'>clear</div>";
        }
        
        $(".filterName").html(filter);
    });
}

function toggleComments(id) {
    //resets the comment count each time because it increments it when you add a comment
    var question = getQuestionById(id);
    
    if($("#showCommentsButton_" + id).html().indexOf("hide") == -1) {
        question.setCommentCount(0);
        $.get("/questions/" + id + "/comments", function(data){
            $.each(data, function(i, v){
                var current = new Comment(v.question_id + "_" + v.comment_id, v.comment, v.votes, v.username, v.created, v.flagged, v.answered, v.my_vote);
                for(var j = 0; j < getQuestionCount(); j ++)
                {
                    if(getQuestion(j).getId() == current.getQuestId())
                    {
                        getQuestion(j).addComment(current);
                    }
                }
            });
        
        }, 'json').done(function() {
            var commentsHTML = "";
            var commentHTML = "";
        
            for(var j = 0; j < question.getCommentCount(); j ++) {
                var comment = question.getComment(j);
                commentHTML = HTMLforComment;
                commentHTML = commentHTML.replace(/ID/g, comment.getId());
                commentHTML = commentHTML.replace(/VOTES/g, comment.getVotes());
                commentHTML = commentHTML.replace(/TEXT/g, comment.getText());
                commentHTML = commentHTML.replace(/TIMEASKED/g, comment.getTimeCreated());
                commentsHTML += commentHTML;
            }
            question.setCommentsShown(true);
            $("#commentsContainer_" + question.getId()).html(commentsHTML);
            $("#commentsContainer_" + question.getId()).show();
            resizeComments(id);
            $("#commentsContainer_" + question.getId()).hide();
            $("#commentsContainer_" + id).slideToggle("slow");
            $("#showCommentsButton_" + id).html("hide comments<br> ");
            initializeCommentLayout(id);
        });
    }
    else {
        $("#commentsContainer_" + id).slideToggle("slow");
        $("#showCommentsButton_" + id).html("show comments<br>(" + getQuestionById(id).getCommentCount() + ")");
        question.setCommentsShown(false);
    }
}

function showSortMenu() {
    openMenu = "sort";
    $(".backgroundCover").fadeTo(1, 0);
    $(".sortMenuContainer").fadeTo(1, 0);
    $(".backgroundCover").show();
    $(".sortMenuContainer").show();
    $(".backgroundCover").fadeTo(400, 0.65);
    $(".sortMenuContainer").fadeTo(400, 1, setFilterButtonColors());
}

function closeMenu(type) {
    if(openMenu == "sort") {
        $(".sortMenuContainer").fadeTo(400, 0, function() {$(".sortMenuContainer").hide()} );
    
        if(type == "save")
            setFilter("limit", defaultLimit);
            
        openMenu = "none";
    }
    
    if(openMenu == "search")
        toggleSearchBar();
        
    $(".backgroundCover").fadeTo(400, 0, function() {$(".backgroundCover").hide()});
}

function changeFilter(type, value) {
    setFilter(type, value);
    setFilterButtonColors();
}

function setFilterButtonColors() {
    $(".sortMenuOption").css("color", "black");
    
    $("#creator_" + getFilter('creator')).css("color", "1f268b");
    $("#answered_" + getFilter('answered')).css("color", "1f268b");
    $("#" + getFilter('orderby') + "_" +  getFilter('direction')).css("color", "1f268b");
}

function showMore() {
    setFilter('limit', getFilter('limit') + defaultLimit);
    changeQuestions();
}

function toggleSearchBar() {
    if(openMenu != "search") {
        openMenu = "search";
        if(deviceType == "mobile") {
            $(".backgroundCover").fadeTo(1, 0);
            $(".backgroundCover").show();
            $(".backgroundCover").fadeTo(400, 0.65);   
        }
    }
        
    else {
        openMenu = "none";
        $(".searchTextarea").val('');
    }
        
    $(".searchBar").slideToggle('fast', function() {$("#searchTextarea").focus();});
}

function search() {
    var keyword = $(".searchTextarea").val();
    keyword = keyword.trim();
    if(keyword == ""){
        keyword = "none";
    }
    setFilter('keyword', keyword);
    setFilter('limit', defaultLimit);
    changeQuestions();
    closeMenu();
}