//Post object could be a Question or a Comment
function Post(id_input, text_input, votes_input, creator_input, time_created_input, users_vote_input, link_input, //shared between questions and comments
                comment_count_input, answered_input, //question specific
                question_id_input, answer_input) { //comment specific
    //Paramters that both questions and comments share
    var id = id_input;
    var text = text_input; //holds the text for question/comment
    text = text.replace(/\n/g, '<br/>');
    var votes = votes_input;
    var creator = creator_input; 
    var time_created = time_created_input;
    var link = link_input;
    var users_vote = users_vote_input;
    if(users_vote != "up" && users_vote != "down")
        users_vote = "none";
    
    this.getId = function() {return id;}
    this.getText = function() {return text;}
    this.getVotes = function() {return votes;}
    this.getCreator = function() {return creator;}
    this.getTimeCreated = function() {return time_created;}
    this.getLink = function() {return link;}
    this.getUsersVote = function() {return users_vote;}

    //Parameters specific to a Question
    var comment_count = comment_count_input; //number of comments on a question
    var comments = [];                       //array to hold comments when loaded
    var comments_shown = false;              //variable telling whether or not the comments are currently shown on screen
    var answered = answered_input;           //if the question is answered
    
    //Parameters specific to a Comment
    var question_id = question_id_input;
    var answer = answer_input;               //true if this is the answer to its question
    
    this.setUsersVote = function(vote) {
        users_vote = vote;
    };
    
    this.setLink = function(l) {
        link = l;
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
    }
    
    this.deleteComment = function() {
        comment_count --;
        //doesnt actually remove the comment from memory 
        //  only changes comment count for accurate display 
        //  for show comments(commentcount)
    }
    
    //************************************************************Comment Specific Functions
    this.getQuestionId = function() {return question_id;};
    this.isAnswer = function() {return answer;};
}

//STATIC VARIABLES
var questions = [];                     //holds all questions currently loaded
var questionCount = 0;                  //holds the total number of questions loaded
var current_user = "007";               //holds the username assigned to the user by the server, used to determine if a user can delete stuff, etc...
var admin = 0;                          //determines some styling differences, like showing all trashcans if admin
var HTMLforPost = "uninitialized";      //html to be extracted from index page and stored in memory used on each new question
var HTMLforComment = "uninitialized";   //same but for one comment
var defaultPostSize = 0;                //Default height of a post, used to determine if the user is on mobile or desktop
var deviceType = "desktop";             //Initially assumes mobile and is changed further down if the user is on desktop
var defaultLimit = 15;                  //default limit on number of questions to display
var openMenu = "none";                  //currently opened menu (ex. 'sort', 'search', etc...) used in close menu function
var acceptableLinkCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuwxyz.:/?=";  //characters that are allowed in a video link

//filter settings
var filters = [];                       //holds all of the current filters used, seen below
                                        //used when reloading the questions
filters["creator"] = "all";             //can be 'all' or 'mine'
filters["answered"] = 0;                //can be 1 or 0 representing whether the questions should be answered or not
filters["orderby"] = "votes";           //can be 'votes' or 'date'
filters["direction"] = "desc";          //can be 'asc' or 'desc' for oldest to newest or most vote to least votes... etc
filters["keyword"] = "none";            //keyword that will be used in a search
filters["limit"] = defaultLimit;        //number of questions to display at on time

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

function setAdmin(adm) {
    admin = adm;
}

function getAdmin() {
    return admin;
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

//checks all the comments on each question, only if the comments are visible
function getCommentById(id) {
    for(var i = 0; i < getQuestionCount(); i ++) {
        if(getQuestion(i).getCommentsShown()) {
            var comment = getQuestion(i).getCommentById(id);
            if(comment != null)
                return comment;
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
    var type = "question";
	$("#replyContainer_" + type + id).slideToggle("slow", function(){
	    $("#newPostTextArea_" + type + id).focus();
	});
	if($("#replyButton_" + type + id).html() != "cancel")
		$("#replyButton_" + type + id).html("cancel");
	else {
		$("#replyButton_" + type + id).html("reply");
		$("#newPostTextArea_" + type + id).val("");
	}
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
    
    $("#" + voteDir + "vote_" + type + post.getId()).attr('src', '/img/' + clicked + 'small' + voteDir + 'arrow.png');
}

//changes the answer button image based on mouse position
//  id is id
//  dir is if mouse is going in or out
function changeCheckMark(id, dir) {
    var comment = getCommentById(id);  //comment that checkmark img is chaning
    var checked = "";                  //changes to 'checked' if the img needs to be checkedcheckmark
    var type = "comment";
    
    if(dir == 'in' && !comment.isAnswer())
        checked = "checked";
    if(dir == 'out' && comment.isAnswer())
        checked = "checked";
        
    $("#answerImg_" + type + comment.getId()).attr('src', '/img/' + checked + 'checkmark.png');
}

//*****************************************************************content initializationg and styling

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
            questionHTML = questionHTML.replace(/ID/g, question.getId());
            questionHTML = questionHTML.replace(/TYPE/g, 'question');
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
    $(".linkButtonContainer").hide();
    $(".replyContainer").hide();
    var type = "question";
    
    //iterates through each question and hides certain containers within it
    for(var i = 0; i < getQuestionCount(); i ++)
    {
        var question = getQuestion(i);
        
        //hides all trash cans on questions the current user does not own
        if(getCurrentUser() != question.getCreator() && !(getAdmin() == 1)) {
            $("#deleteButtonContainer_" + type + question.getId()).css('visibility', 'hidden'); //changing css visibility to hidden hides the div but lets it keep space where it was
        }
        
        //sets the initial image for what the users vote is
        if(question.getUsersVote() == "up") {
            $("#upvote_" + type + question.getId()).attr('src', '/img/clickedsmalluparrow.png');
        }
        if(question.getUsersVote() == "down") {
            $("#downvote_" + type + question.getId()).attr('src', '/img/clickedsmalldownarrow.png');
        }
        
        if(question.isAnswered()) {
            //hides/removes/ changes css to make an answered question look different
            $("#postContainer_" + type + question.getId()).css('height', '160px');
            $("#replyButton_" + type + question.getId()).remove();
            $("#upvote_" + type + question.getId()).remove();
            $("#voteInfoContainer_" + type + question.getId()).css('left', '0%');
            $("#downvote_" + type + question.getId()).remove();
            
            if(!(getAdmin() == 1)) {
                $("#buttonContainer_" + type + question.getId()).remove();
                $("#deleteButtonContainer_" + type + question.getId()).remove();
            }
            else {
                if(deviceType == "desktop") {
                    $("#deleteButtonContainer_" + type + question.getId()).css('top', '61%');
                    $("#buttonContainer_" + type + question.getId()).css('left', '10%');
                }
                else {
                    $("#deleteButtonContainer_" + type + question.getId()).appendTo("#voteInfoContainer_" + type + question.getId());
                    $("#deleteButtonContainer_" + type + question.getId()).css('top', '31%');
                }
            }
            
            $("#postTextAndInfoContainer_" + type + question.getId()).css('width', '90%');
            $("#postTextAndInfoContainer_" + type + question.getId()).css('left', '10%');
            $("#timeAskedContainer_" + type + question.getId()).html("Answered on " + question.getTimeCreated());
            $("#timeAskedContainer_" + type + question.getId()).css('width', '65%');
            
            if(question.getLink() != null) {
                $("#voteContainer_" + type + question.getId()).css('top', '15%');
                $("#linkButtonContainer_" + type + question.getId()).show();
            }
        }
    }
    
    //if there is not timeout, the resizePosts function DOES NOT WORK
    // even if the timeout is very very very very very small
    window.setTimeout(resizePosts, 0.00000000000001);
}

//intitializes layout of all comments of a specific question
function initializeCommentLayout(id) {
    var question = getQuestionById(id);
    var type = "comment";
    for(var j = 0; j < question.getCommentCount(); j ++) {
        var comment = question.getComment(j);
        
        if(comment.getCreator() != getCurrentUser() && getAdmin() != 1) {
            $("#deleteButtonContainer_" + type + comment.getId()).css('visibility', 'hidden');
        }
        
        if(question.getCreator() != getCurrentUser() && getAdmin() != 1) {
            $("#answerButtonContainer_" + type + comment.getId()).css('visibility', 'hidden');
        }
        
        if(comment.getUsersVote() == "up") {
            $("#upvote_" + type + comment.getId()).attr('src', '/img/clickedsmalluparrow.png');
        }
        if(comment.getUsersVote() == "down") {
            $("#downvote_" + type + comment.getId()).attr('src', '/img/clickedsmalldownarrow.png');
        }
        
        if(question.isAnswered()) {
            var comment = question.getComment(j);
            $("#upvote_" + type + comment.getId()).css('visibility', 'hidden');
            $("#downvote_" + type + comment.getId()).css('visibility', 'hidden');
            
            if(!(getAdmin() == 1) || comment.isAnswer())
                $("#deleteButtonContainer_" + type + comment.getId()).remove();
                
            if(comment.isAnswer()) {
                $("#answerImg_" + type + comment.getId()).attr({src:"/img/checkedcheckmark.png"});
                //if the comment is the answer, moving the mouse over the answer button, and clicking it, does not do anything
                //   unless they are the creator or they are an admin
                if(question.getCreator() != getCurrentUser() && getAdmin() != 1) {
                    $("#answerImg_" + type + comment.getId()).attr({onmouseenter: "", onmouseleave: "", onclick: ""});
                    $("#answerImg_" + type + comment.getId()).css('visibility', 'visible');
                }
            }
            else {
                $("#commentContainer_" + type + comment.getId()).css('background-color', 'd6d6d6');
                $("#answerImg_" + type + comment.getId()).remove();
            }
        }
        if(comment.getLink() == null || comment.getLink() == "") {
            $("#linkButtonContainer_" + type + comment.getId()).css('visibility', 'hidden');
        }
    }
}

//resizes all questions so if they have a lot of text, a scroll bar does not appear
function resizePosts() {
    var type = "question";
    for(var i = 0; i < getQuestionCount(); i ++) {
        var question = getQuestion(i);
        
        //sets the default post size if it has never been set. This helps the program determine whether or not the use is on mobile or on desktop version
        if(defaultPostSize == 0) {
            defaultPostSize = parseInt($("#postContainer_" + type + question.getId()).css('height'));
            if(defaultPostSize >= 275)
                deviceType = "mobile";
        }
        
        //Parse int because the .css('height') will return a string, '100px' or something like that
        var num = parseInt($("#textContainer_" + type + question.getId()).css('height'));
        num = num + 110;
        
        //automatically assumes the size needs to increase. If it is too small, sets it back to default
        if(num < defaultPostSize) {
            num = defaultPostSize;
        }
        
        //adds the px back to the end so the css knows what unit of measurement to use(different ones being %, em, px, vw, vh, etc...)
        num += "px";
        $("#postContainer_" + type + question.getId()).css('min-height', num);
    }
}

//resizes comments
function resizeComments(id) {
    var question = getQuestionById(id);
    var type = "comment";
    for(var j = 0; j < question.getCommentCount(); j ++) {
        var comment = question.getComment(j);
        
        //see above for why parsing the int
        var num = parseInt($("#textContainer_" + type + comment.getId()).css('height'));
        var contHeight = parseInt($("#postTextContainer_" + type + question.getId()).css('height'));
        
        //if the size of the container holding the comment tex
        //  is greater than the size of the container holding
        //  the container holding the question text,
        //  the container holding container holding the container... needs to increase its height
        if(num >= contHeight) {
            num = num + 50;
            num += "px";
            $("#commentContainer_" + type + comment.getId()).css('height', num);
        }
    }
}

//************************************************************************Onclick functions

//removes a question/comment from users screen, if the server removes it from db
//  in this case, to use this function, type must be 'question' or 'comment' for the URL to work
function deletePost(type, id) {
    
    //confirms if the user wants to delete
    if(!confirm("Are you sure you want to delete?"))
        return;
        
    $.ajax({
        //add an 's' because the url for deleting is 'questions' and not 'question' or 'comments' and not 'comment'
        url: "/" + type + "s/" + id,
        type: 'DELETE',
        dataType: 'json'
    }).done(function(data){
        //if the server does not respond with any data, that is an error
        if (data) {
            //we are expecting the data to have some sort of id, meaning it successfully deleted the post
            if (data.question_id || data.comment_id){
                
                //the .hide(2000) function below is what animates the post being deleted, 2000 is the time in ms. 
                
                if(type == "question") {
                    
                    //necessary to reset min-height so the hide function works
                    //  if you wanted to remove the animations, take out ALL code beneath
                    //  to the next else statement EXCEPT the ones that end in .remove
                    $("#postContainer_" + type + id).css('height', $("#postContainer_" + type + id).css('min-height'));
                    $("#postContainer_" + type + id).css('min-height', '0px');
                    $("#postContainer_" + type + id).hide(2000, function() {
                        $("#postContainer_" + type + id).remove();
                    });
                    $("#commentsContainer_" + type + id).hide(2000, function() {
                        $("#commentsContainer_" + type + id).remove();
                    });
                    $("#replyContainer_" + type + id).hide(2000, function() {
                        $("#replyContainer_" + type + id).remove();
                    });
                }
                else {
                    //deletes the comment from the questions storage and hides it then removes
                    getQuestionById(getCommentById(id).getQuestionId()).deleteComment();
                    $("#commentContainer_" + type + id).hide(2000, function() {
                        $("#commentContainer_" + type + id).remove();
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

//sents vote report and changes vote image appropriately
//  type needs to be 'question' or 'comment' for this function to work
//  dir is the direction that the user wants to vote
function vote(type, id, dir) {
    var opp = "down";  //opp is the opposite direction of what the user wants to vote
    var post;
    if(opp == dir)
        opp = "up";
    
    if(type == "question") 
        post = getQuestionById(id);
    else 
        post = getCommentById(id);
        
    //if the user votes in the same direction he already has voted in,
    //  sends a delete request to delete the vote
    if(post.getUsersVote() == dir) {
        $.ajax({
            //add an 's' because the url for deleting is 'questions' and not 'question' or 'comments' and not 'comment'
            url: "/api/" + type + "s/vote/" + id,
            type: 'delete',
            dataType: 'json'
        }).done(function(data) {
            $("#voteContainer_" + type + id).html(data.votes);
            post.setUsersVote('none');
            changeVoteImg(type, id, 'out', dir);
        });
        return;
    }
    
    $.post("/api/" + type + "s/vote/" + id + "/" + dir, function(data){
        $("#voteContainer_" + type + id).html(data.votes);
        post.setUsersVote(dir);
        changeVoteImg(type, id, 'out', opp);  //changes the opposite vote image incase that was the last vote
        changeVoteImg(type, id, 'out', dir);
    }, 'json');
}

//submits a new question to store in the database, and then refreshes the questions
//  with a different filter
function submitQuestion() {
    var text = $("#newQuestionTextarea").val();
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');  //closes XSS vulnerabilities
    
    //sending the data as a json requires this hash form of data(i think, never tried it without it)
    var data = {
        question: text  //'question' is the key and 'text' is the associated data
    };
    
    $.ajax({
        url:"/questions",
        type: "POST",
        contentType:"application/x-www-form-urlencoded",
        dataType: 'json',
        data: data
    }).done(function(data) {
        if(data.question_id) {
            //hides the question form, updates filters and reloads questions
            toggleQuestionForm();
            setFilter('creator', 'all');
            setFilter('answered', '0');
            setFilter('orderby', 'created');
            setFilter('direction', 'desc');
            setFilter('limit', '15');
            reloadQuestions();
        }
    });
}

//readys a reply to be sent to the server
function readyReply(id) {
    var type = "question";
    var text = $("#newPostTextArea_" + type + id).val();
    
    //gotta check for links with & before removing them all unfortunately
    text = text.replace("&feature=youtu.be&", "?"); //checking for a replacing link type 3
    text = text.replace("&feature=youtu.be", "") //checks for type 3 without the time attatched
    
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');  //closes XSS vulnerabilities
    
    //Youtube links can have 3 different forms:
    // 1. https://youtu.be/PFY7uQzupf0?t=291
    // 2. https://www.youtube.com/watch?v=PFY7uQzupf0
    // 3. https://www.youtube.com/watch?v=PFY7uQzupf0&feature=youtu.be&t=365
    
    //this code will parse the text for all 3 forms and replace if with form 1 for simplicity. 
    
    //replaces all instances of the link type 3 with the better short link type 1
    text = text.replace("https://www.youtube.com/watch?v=", "https://youtu.be/");
    var link = extractLink(text);
    
    //if the link is not empty, shows the menu for editing it
    if(link != "") {
        showReplyMenu(id, text, link);
    }
    else {
        submitReply(id, text, link);
    }
    
}

//sends a reply to the server and toggles comments
function submitReply(id, text, link) {
    var type = "question";
    
    var reply = {
        question_id: id,
        comment: text,
        video_link: link
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
            //hides and shows the comments, forcing them to refresh
            // UNLESS they arent already showing, then it just shows them
            if($("#showCommentsButton_" + type + id).html().indexOf("hide") != -1) {
                toggleComments(id);
            }
            toggleComments(id);
        }
    });
}

//in the future, this needs to have a confirmation box popup
function markAnswer(id) {
    var comment = getCommentById(id);  //comment that is marked as the answer
    var question = getQuestionById(comment.getQuestionId());  //question that has been answered
    var type = 'POST';
    
    if(question.isAnswered())
        type = 'delete';
    
    $.ajax({
        url: "/api/answers/" + question.getId() + "/" + comment.getId(),
        type: type,
        dataType:'json'}).done(function(data) {
        //if the server sends back data with an id, it succesfully recorded and marked it as answered
        if(data.question_id) {
            //reloads the questions with the newest answer on top
            setFilter('creator', 'all');
            setFilter('answered', !question.isAnswered() | 0);
            setFilter('orderby', 'created');
            setFilter('direction', 'desc');
            reloadQuestions();
        }
    });
}

//reloads questions with currently set filters, and redisplays them all 
function reloadQuestions() {
    //See the list of global variables(close to the top, underneath Post object)(maybe around line 100 unless more lines are added) 
    //  to learn what each filter does
    var creator = getFilter('creator');
    var answered = getFilter('answered');
    var orderby = getFilter('orderby');
    var direction = getFilter('direction');
    var limit = getFilter('limit');
    var keyword = getFilter('keyword');
    
    clearQuestions(); //removes all questions from the screen
    
    $.get("/questions/" + creator + "/" + answered + "/" + orderby + "/" + direction + "/" + limit + "/" + keyword, function(data){
        $.each(data, function(i, v){
            //last two parameters set to null because last two are only used in comments
        	var question = new Post(v.question_id, v.question.replace(/\n/g, '</br>'), 
        	                        v.votes, v.username, v.created, 
        	                        v.my_vote, v.video_link, v.comment_count, v.answered, null, null);
        	addQuestion(question);
        });
    }, 'json').done(function() {
    	initializeContent();
        
        //filter is the string which contains the current sorting and searching filter
        //  it is seen at the top of all the questions
        var filter = "";
        
        filter += creator + " ";   //creator would be 'my' or 'all'
        
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
        //if it is not ordered by votes, it is ordered by date
        else {
            if(direction == "asc")
                filter += "oldest";
            else 
                filter += "newest";
        }
        
        //if the user has a search in place, it adds what they search for and a clear button
        if(keyword != 'none') {
            if(deviceType == "desktop")
                filter += " | ";  //a nice pipe for effect
            else
                filter += "</br>";
            filter += "search: " + keyword;
            filter += " <div class='clearButton' onclick='setFilter(\"keyword\", \"none\");setFilter(\"limit\", 15);reloadQuestions()'>clear</div>";
        }
        
        $(".filterName").html(filter);
    });
}

//shows or hides comments on a specific question. If the comments are not currenty shown, it loads the comments first
function toggleComments(id) {
    var question = getQuestionById(id);
    var type = "question";
    //if the word hide is not on the show comments button, the comments are not currently shown
    //  the comments will be loaded, shown, and hide will be added to the button
    if($("#showCommentsButton_" + type + id).html().indexOf("hide") == -1) {
        question.setCommentCount(0); //resets the comment count each time because of the way add comment works, it increments the comment count each time you add one
        $.get("/questions/" + id + "/comments", function(data){
            $.each(data, function(i, v){
                //two nulls are locations in Post object that are used only in a question, not a comment
                var comment = new Post(v.comment_id, v.comment, v.votes, 
                                        v.username, v.created,
                                        v.my_vote, v.video_link, null, null, v.question_id, v.answered);
                question.addComment(comment);
            });
        
        }, 'json').done(function() {
            
            //initializes html for all of the comments in the question
            var commentsHTML = "";
            var commentHTML = "";
            
            if(question.getCommentCount() == 0) 
                commentsHTML = "<div class='commentContainer' style='height:auto;'>no comments</div>";
            
            for(var j = 0; j < question.getCommentCount(); j ++) {
                var comment = question.getComment(j);
                comment = question.getComment(j);
                commentHTML = HTMLforComment;
                commentHTML = commentHTML.replace(/ID/g, comment.getId());
                commentHTML = commentHTML.replace(/TYPE/g, 'comment');
                commentHTML = commentHTML.replace(/VOTES/g, comment.getVotes());
                commentHTML = commentHTML.replace(/TEXT/g, comment.getText());
                commentHTML = commentHTML.replace(/TIMEASKED/g, comment.getTimeCreated());
                commentsHTML += commentHTML;
            }
            question.setCommentsShown(true);
            
            //shows the comment before animating it being shown
            //  this way, it will be assigned a height, and we can resize it if it is too long
            //  before it slides out
            //  so: shows comments, resizes them, hides them, then animates them sliding out
            $("#commentsContainer_" + type + id).html(commentsHTML);
            $("#commentsContainer_" + type + id).show();
            resizeComments(id);
            $("#commentsContainer_" + type + id).hide();
            $("#commentsContainer_" + type + id).slideToggle("slow");
            $("#showCommentsButton_" + type + id).html("hide comments<br> ");  //changes the button to say hide commensts
            initializeCommentLayout(id);
        });
    }
    //if the comments are already shown, it will hide the comments and change the show comments button back to saying show comments
    else {
        $("#commentsContainer_" + type + id).slideToggle("slow");
        $("#showCommentsButton_" + type + id).html("show comments<br>(" + getQuestionById(id).getCommentCount() + ")");
        question.setCommentsShown(false);
    }
}

//shows the sorting menu so the user can choose filters to apply
function showSortMenu() {
    openMenu = "sort";  //sets global variable so the program knows the currently opened menu
    $(".backgroundCover").fadeTo(1, 0);
    $(".sortMenuContainer").fadeTo(1, 0);
    $(".backgroundCover").show();
    $(".sortMenuContainer").show();
    $(".backgroundCover").fadeTo(400, 0.65);
    $(".sortMenuContainer").fadeTo(400, 1, setFilterButtonColors());
}

//opens a menu only when the user has a youtube link in their question
function showReplyMenu(id, text, link) {
    var originalLink = link;
    readyToSubmit = $.Deferred();  //declared global so the onclick functions can use this
    openMenu = "reply";  //global variable that lets program know when menu to close when the white background is clicked
    $(".backgroundCover").fadeTo(1, 0);
    $(".replyMenuContainer").fadeTo(1, 0);
    $(".backgroundCover").show();
    $(".replyMenuContainer").show();
    $(".backgroundCover").fadeTo(400, 0.65);
    $(".replyMenuContainer").fadeTo(400, 1);
    
    var hr = 0;   //hours into the link to start
    var min = 0;  //minute mark to start the video at
    var s = 0;    //seconds mark to start the video at
    
    //youtube times are formatted like this:
    //    https://youtu.be/PFY7uQzupf0?t=0h13m55s
    //    but any of the three, h, m, or s, could be missing. none are required
    //or like this:
    //    https://youtu.be/DKFNAJFI?t=435
    //    with no units, and will be treated as seconds
    
    var start = link.indexOf('=');  //begin of where to parse a number
    var end = link.indexOf('h', start);  //end of where to parse the number
    
    //if h is not found anywhere at the end of the link, AFTER ?t=, then end is set to start so end is not -1
    if(end != -1)
        hr = link.substring(start + 1, end);
    else
        end = start;
    
    start = end;  //the start of the search for the next number is where the end of the last one was
    end = link.indexOf('m', start);  //searches for an m in the link, for minutes
    if(end != -1)
        min = link.substring(start + 1, end);
    else
        end = start;
    
    //same as previous but for seconds
    start = end;
    end = link.indexOf('s', start);
    if(end != -1)
        s = link.substring(start + 1, end);
    
    //if all numbers are zero, it could mean
    //  1. There is no start time
    //  2. Start time is formatted like this: https://url/LAJDF?t=555 with no label of units
    if( s == 0 && min == 0 && hr == 0) {
        start = link.indexOf('?t=');
        if(start != -1)
            s = link.substring(start + 3); //add 3 because the string '?t='.length = 3
    }
    
    $("#replyMenuTimeHr").val(hr);  
    $("#replyMenuTimeMin").val(min); 
    $("#replyMenuTimeS").val(s);
    
    setReplyMenuTimes(link);
    
    //this when statement is run when the onclick functions in the reply menu are clicked
    //  newlink functions like a boolean, if it is blank, then the user
    //  is indicating that he does not want his link extracted
    $.when(readyToSubmit).done(function(newLink) {
        if(newLink != "") {
            link = $("#replyMenuLinkTextarea").val();
            text = text.replace('\n' + originalLink + '\n', '\n'); //first checks if a video is on its own line, removes it
            text = text.replace(originalLink, ""); //if the link is not on its own line it will be replaced right here
        }
        else
            link = newLink; //which would have to be ""
            
        closeMenu('save');  //meaning the user wants to save the link as a button
        submitReply(id, text, link);
    });
}

//sets the time input boxes in the reply menu, and also sets the link
function setReplyMenuTimes(link) {
    //hours, minutes, seconds
    var hr = parseInt($("#replyMenuTimeHr").val()) | 0;  
    var min = parseInt($("#replyMenuTimeMin").val()) | 0; 
    var s = parseInt($("#replyMenuTimeS").val()) | 0;
    
    if(hr < 0)
        hr = 0;
    if(min < 0)
        min = 0;
    if(s < 0)
        s = 0;
    
    
    //Converts to hr, min, s to set each box appropriately...
    while(s >= 60) {
        s -= 60;
        min ++;;
    }
    while(min >= 60) {
        min -= 60;
        hr ++;
    }
    
    //the ? statement is if hr is zero, instead of making the input box have a 0 (can be annoying)
    //  it leaves it empty
    $("#replyMenuTimeHr").val(hr ? hr : "");  
    $("#replyMenuTimeMin").val(min ? min : ""); 
    $("#replyMenuTimeS").val(s ? s : "");
    
    //then converts it back to seconds to set the link!
    while(hr >= 1) {
        hr --;
        min += 60;
    }
    while(min >= 1) {
        min --;
        s += 60;
    }
    
    var start = link.indexOf('?');
    if(start != -1)
        link = link.substring(0, link.indexOf('?')) + "?t=";
    else
        link += "?t=";
        
    if(s)
        link += s;
    
    $("#replyMenuLinkTextarea").val(link);
}

//closes whatever menu is currently open based on the GLOBAL openMenu variable
//  save parameter is used only if the sort menu is being closed. It is set as 'save' ONLY if the user
//  hits the APPLY button in the sort menu
function closeMenu(save) {
    if(openMenu == "sort") {
        $(".sortMenuContainer").fadeTo(400, 0, function() {$(".sortMenuContainer").hide()} );
    
        if(save == "save") {
            setFilter("limit", defaultLimit);
            reloadQuestions();
        }
            
        openMenu = "none";
    }
    
    if(openMenu == "search")
        toggleSearchBar();
        
    if(openMenu == "reply" && save != "save")
        return;
    else {
        $(".replyMenuContainer").fadeTo(400, 0, function() {
            $(".replyMenuContainer").hide();
        })
    }
    
    //background cover is the white cover that appears when opening search menu/sort menu
    $(".backgroundCover").fadeTo(400, 0, function() {$(".backgroundCover").hide()});
}

//change filter, changes the filter, then changes the colors on the filter buttons
//  in the open sort menu
function changeFilter(type, value) {
    setFilter(type, value);
    setFilterButtonColors();
}

//set filter button colors effects the sort menu when it has been opened
function setFilterButtonColors() {
    $(".sortMenuOption").css("color", "black");
    
    //the id's of the options are set so that this will work
    $("#creator_" + getFilter('creator')).css("color", "1f268b");     //id ex 'creator_mine' or 'creator_all'
    $("#answered_" + getFilter('answered')).css("color", "1f268b");   //id ex 'answered_1' (1 for answered questions only 0 for unanaswered only)
    $("#" + getFilter('orderby') + "_" +  getFilter('direction')).css("color", "1f268b");  //id ex 'votes_asc' or 'date_desc'
}

//increases the limit on the amount of shown questions, reloads ALL questions with a larger limit
function showMore() {
    setFilter('limit', getFilter('limit') + defaultLimit);
    reloadQuestions();
}

//shows or hides the dearch bar
function toggleSearchBar() {
    if(openMenu != "search") {
        openMenu = "search";
        //only adds a background cover is the user is on mobile
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

//extracts the keyword from the search bar, reloads the questions with that set as the new keyword
function search() {
    var keyword = $(".searchTextarea").val();
    keyword = keyword.trim();
    if(keyword == ""){
        keyword = "none"; //a keyword of 'none' means there is no search in effect
    }
    setFilter('keyword', keyword);
    setFilter('limit', defaultLimit); //resets the limit
    reloadQuestions();
    closeMenu();
}

//looks for a youtube link inside of the reply text and extracts it
function extractLink(text) {
    var link = "";
    var begin = 0;  //begining location of id
    var end = 0;    //ending location of id
    
    begin = text.indexOf("https://youtu.be/"); //link style when press share button
    if(begin != -1) {
        end = begin;
        while(acceptableLinkCharacters.indexOf(text.charAt(end)) != -1 && end < text.length) {
            end ++;
        }
        link = text.substring(begin, end);
    }
    
    return link;
}

//redirects user to whatever link is associated with the comment
//  lots of this function will have to change after it is merged with refactoring branch
function redirectToVideo(type, id) {
    var post;
    
    if(type == "question")
        post = getQuestionById(id);
    else
        post = getCommentById(id);
    
    //after refactoring changes are accepted, the above to lines will need to be changed to
    //var comment = getCommentById(id);
    
    window.open(post.getLink(), '_blank'); //the '_blank' parameter makes it open in a new tab
}