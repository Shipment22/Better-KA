const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");

const EditSession = require("ace/edit_session").EditSession; // get EditSession

var editors = {}; // store ACE tabs corresponding to their tab name. This way, new tabs can be added and old ones can be renamed dynamically

function setEditorSwitch() {
    var tabs = document.querySelectorAll(".new-tab"); // get all new tab elements. querySelectorAll returns a forEachable list

    tabs.forEach(element => {
        let extension = element.dataset.tab.split(".").reverse()[0]; // get file extension

        // create editor for file with starter code for certain file extensions
        if(extension === "html") {
            editors[element.dataset.tab] = new EditSession(["<!DOCTYPE html>", "<html>", "\t<head>", "\t\t<meta charset = 'utf-8'>", "\t\t<title>New Webpage</title>", "\t</head>", "\t<body>", "\t\t", "\t</body>", "</html>"]);
        } else if(extension === "css") {
            editors[element.dataset.tab] = new EditSession(["* {", "\tmargin: 0;", "\tpadding: 0;", "}"]);
        } else {
            editors[element.dataset.tab] = new EditSession("");
        }

        editors[element.dataset.tab].setMode("ace/mode/" + extension); // set language mode depending on extension
        
        element.onclick = event => {
            editor.setSession(editors[element.dataset.tab]); // change the current edtor to the tab corresponding to the element clicked
        };

        element.classList.remove("new-tab"); // remove new-tab class so the file isn't created again
    });
}

// create a mutation observer to update the file system when a .new-tab is added
const updateEditors = new MutationObserver(setEditorSwitch);
const tabsCont = document.querySelector("#tabs");
updateEditors.observe(tabsCont, { childList: true });

// initial file setup
setEditorSwitch();
editor.setSession(editors["index.html"]); // set the current tab