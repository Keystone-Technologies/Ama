
var loggedIn = false;
var admin = false;

function setLoggedIn(logged) {
    loggedIn = logged;
}

function getLoggedIn() {
    return loggedIn;
}

function setAdmin(a) {
    admin = a;
}

function getAdmin() {
    return admin;
}

function initializeLayout() {
    if(!getLoggedIn())
        $("#logoutContainer").remove();
}

function deleteAll() {
    if(!confirm("Delete all questions?"))
        return;
    
    if(!confirm("Are you really really sure you want to delete all questions???"))
        return;
        
    if(!confirm("100% certain? This cannot be undone!"))
        return;
    
    $.ajax({
        url:'/removeAll',
        type: 'DELETE',
    }).done(function(data) {
        alert("All questions deleted.");
    });
}