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