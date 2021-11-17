const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");

const EditSession = require("ace/edit_session").EditSession; // get EditSession

var editors = {
    "index.html": new EditSession(["<!DOCTYPE html>", "<html>", "\t<head>", "\t\t<meta charset = 'utf-8'>", "\t\t<title>New Webpage</title>", "\t</head>", "\t<body>", "\t\t", "\t</body>", "</html>"]),
    "sketch.js": new EditSession(""),
    "style.css": new EditSession(["* {", "\tmargin : 0;", "\tpadding : 0;", "}"])
}; // store ACE tabs corresponding to their tab name. This way, new tabs can be added and old ones can be renamed dynamically

for(let key in editors) {
    editors[key].setMode("ace/mode/" + key.split(".").reverse()[0]);
} // loop through the editor tabs and set the language mode based on file extension

editor.setSession(editors["index.html"]); // set the current tab

var tabs = document.querySelectorAll(".tab"); // get all .tab elements. querySelectorAll returns a forEachable

tabs.forEach(element => {
    element.addEventListener("click", event => {
        editor.setSession(editors[element.dataset.tab]); // change the current edtor to the tab corresponding to the element clicked
    });
});