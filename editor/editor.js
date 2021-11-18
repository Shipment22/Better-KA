const editor = ace.edit("editor");

editor.setOptions({
    fontSize: '18px',
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
});

editor.commands.addCommand({
    name: 'myCommand',
    bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
    exec: function(editor) {
        startOutput();
    },
    readOnly: true, 
});


editor.setTheme("ace/theme/monokai");

const EditSession = require("ace/edit_session").EditSession; // get EditSession

var editors = {}; // store ACE tabs corresponding to their tab name. This way, new tabs can be added and old ones can be renamed dynamically

function setEditorSwitch() {
    var tabs = document.querySelectorAll(".new-tab"); // get all new tab elements. querySelectorAll returns a forEachable list

    tabs.forEach(element => {
        let name = element.dataset.tab;                 // get file name
        let extension = name.split(".").reverse()[0];   // get file extension


        // create editor for file with starter code for certain file names
        if (name === 'index.html') {
            editors[element.dataset.tab] = new EditSession(["<!DOCTYPE html>", "<html>", "\t<head>", "\t\t<meta charset = 'utf-8'>", '\t\t<link rel="stylesheet" type="text/css" href="style.css">', "\t\t<title>New Webpage</title>", "\t</head>", "\t<body>", "\t\t", '\t\t<script src="sketch.js"></script>', "\t</body>", "</html>"]);
        } else {
            // create editor for file with starter code for certain file extensions
            if(extension === "html") {
                editors[element.dataset.tab] = new EditSession(["<!DOCTYPE html>", "<html>", "\t<head>", "\t\t<meta charset = 'utf-8'>", "\t\t<title>New Webpage</title>", "\t</head>", "\t<body>", "\t\t", "\t</body>", "</html>"]);
            } else if(extension === "css") {
                editors[element.dataset.tab] = new EditSession(["* {", "\tmargin: 0;", "\tpadding: 0;", "}"]);
            } else {
                editors[element.dataset.tab] = new EditSession([""]);
            }
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

function addTab(title) {
    if (title === '' || title === ' ') {
        addTab(prompt('That name does not start with a letter/number, please enter a new one.'));
        return;
    } else if (editors[title] !== undefined) {  // makes sure that you name it something different from everything else
        addTab(prompt('That filename has already been used, please enter a new one.'));
        return;
    }

    let tab = document.createElement('span');   // create tab

    tab.classList.add('tab');                   // set classes
    tab.classList.add('new-tab');

    tab.dataset.tab = title;                    // set content and dataset.tab to the title
    tab.textContent = title;

    tabsCont.appendChild(tab);                  // append to the tabs bar

    setTimeout(function(){                      // wait 10 milliseconds then set the current tab
        editor.setSession(editors[title]);      
    }, 10);
}

const output = document.querySelector('#output');

function stopOutput() {
    output.srcdoc = '';
}
stopOutput();

function startOutput() {
    stopOutput();

    let tabs = document.querySelectorAll('.tab');

    let html = editors['index.html'].getValue();    // gets html code

    tabs.forEach(element => {
        let name = element.dataset.tab;            // get name and extension
        let extension = name.split('.').reverse()[0];

        function r(replace, what) {
            html = html.replaceAll(replace, what);
        }

        if (extension === 'css') {
            r(`<link rel="stylesheet" type="text/css" href="${name}">`, `<style>${editors[name].getValue()}</style>`);
            r(`<link type="text/css" rel="stylesheet" href="${name}">`, `<style>${editors[name].getValue()}</style>`);
        } else if (extension === 'js') {
            r(`src="${name}">`, `>${editors[name].getValue()}`);
        } else if (extension === 'html') {
            // something goes here...
        } else {
            console.error('unknown file extension');
        }
    });

    output.srcdoc = html;
}

function saveCode() {
    // something goes here...
}