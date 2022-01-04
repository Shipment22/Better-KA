const editor = ace.edit("editor");
const consoleBody = document.querySelector('#console-body');

// set some options
editor.setOptions({		
	fontSize: '14px',
	enableBasicAutocompletion: true,
	enableLiveAutocompletion: true
});
editor.setTheme("ace/theme/monokai");

// add run shortcut
editor.commands.addCommand({ 
	name: 'Run',
	bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
	exec: function(editor) {
		startOutput();
	},
	readOnly: true, 
});

// add resize font shortcuts
editor.commands.addCommand({ 
	name: 'Bigger Font',
	bindKey: {win: 'Ctrl-=',  mac: 'Command-='},
	exec: function(editor) {
		let sz = editor.getFontSize()
		let szNum = Number(sz.split('px')[0])
		if (szNum >= 50) { return; } 
		let newSz = (szNum + 2) + 'px'
		editor.setFontSize(newSz)
	}
});
editor.commands.addCommand({ 
	name: 'Smaller Font',
	bindKey: {win: 'Ctrl--',  mac: 'Command--'},
	exec: function(editor) {
		let sz = editor.getFontSize()
		let szNum = Number(sz.split('px')[0])
		if (szNum <= 6) { return; } 
		let newSz = (szNum - 2) + 'px'
		editor.setFontSize(newSz)
	}
});

// create undo manager
var UndoManager = require("ace/undomanager").UndoManager;	
editor.commands.addCommands([	// make undo and redo shortcuts
	{
		name : 'undo',
		bindKey : { win: 'Ctrl-Z', mac: 'Command-Z' },
		exec : function(editor){
			editor.session.getUndoManager().undo();
		}
	},
	{
		name : 'redo',
		bindKey : { win: 'Ctrl-Shift-Z', mac: 'Command-Shift-Z' },
		exec : function(editor){
			editor.session.getUndoManager().redo();
		}
	}
]);


const EditSession = require("ace/edit_session").EditSession; // get EditSession

var editors = {}; // store ACE tabs corresponding to their tab name. This way, new tabs can be added and old ones can be renamed dynamically
var undoManagers = {}; // store undo managers, corresponding to their tab name aswell.

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
				editors[element.dataset.tab] = new EditSession(["html,body {", "\tmargin: 0;", "\tpadding: 0;",  "\t",  "\tcolor: #fff;",  "\tbackground-color: #222;",  "\t",  "\tfont-family: Sans-Serif;", "}"]);
			} else {
				editors[element.dataset.tab] = new EditSession([""]);
			}
		}
		
		undoManagers[element.dataset.tab] = new UndoManager();	// create and set undo manager
		editors[element.dataset.tab].setUndoManager(undoManagers[element.dataset.tab]);

		editors[element.dataset.tab].setMode("ace/mode/" + extension); // set language mode depending on extension
		
		element.onclick = event => {
			editor.setSession(editors[element.dataset.tab]); // change the current edtor to the tab corresponding to the element clicked
		};
        element.oncontextmenu = event => {
            event.preventDefault();
            element.setAttribute("contenteditable", "true");

            if(element.createTextRange) {
                var range = element.createTextRange();
                range.move('character', element.textContent.length);
                range.select();
            }
            else {
                if(element.selectionStart) {
                    element.focus();
                    element.setSelectionRange(element.textContent.length, element.textContent.length);
                } else {
                    element.focus();
                }
            }

            element.onkeydown = event => {
                if(event.keyCode !== 13) return;

                event.preventDefault();

                let editor = editors[element.dataset.tab];
                editors[element.value] = editor;

                delete editors[element.dataset.tab];

                element.dataset.tab = element.value;

                let selection = window.getSelection();
                selection.removeAllRanges();

                element.setAttribute("contenteditable", "false");
            };

            window.addEventListener("click", event => {
                element.value = element.dataset.tab;
                element.setAttribute("contenteditable", "false");
            }, {
                once: true
            })
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
	let tabs = document.querySelectorAll('.tab'); 	// get tabs

	let html = editors['index.html'].getValue();    // gets html code
	output.srcdoc = html;
	tabs.forEach(element => {
		let name = element.dataset.tab;            	// get name and extension
		let extension = name.split('.').reverse()[0];

		// code shortener
		function r(replace, what) {
			output.srcdoc = output.srcdoc.replace(new RegExp(replace, "gi"), what);
		}

		// loads css and js files
		if (extension === 'css') {
			r(`<link\\s+rel\\s*=\\s*["']stylesheet["']\\s*type\\s*=\\s*["']text/css["']\\s*href\\s*=\\s*["']${name}["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
			r(`<link\\s+type\\s*=\\s*["']text/css["']\\s*rel\\s*=\\s*["']stylesheet["']\\s*href\\s*=\\s*["']${name}["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
			r(`<link\\s+href\\s*=\\s*["']${name}["']\\s*type\\s*=\\s*["']text/css["']\\s*rel\\s*=\\s*["']stylesheet["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
			r(`<link\\s+href\\s*=\\s*["']${name}["']\\s*type\\s*=\\s*["']text/css["']\\s*rel\\s*=\\s*["']stylesheet["']\\s*href\\s*=\\s*["']${name}["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
			r(`<link\\s+rel\\s*=\\s*["']stylesheet["']\\s*href\\s*=\\s*["']${name}["']\\s*type\\s*=\\s*["']text/css["']\\s*href\\s*=\\s*["']${name}["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
			r(`<link\\s+type\\s*=\\s*["']text/css["']\\s*href\\s*=\\s*["']${name}["']\\s*rel\\s*=\\s*["']stylesheet["']\\s*href\\s*=\\s*["']${name}["']\\s*>`, `<style>${editors[name].getValue()}</style>`);
		} else if (extension === 'js') {
			r(`\\s*src\\s*=\\s*["']${name}["']([^<>]*)>`, `$1>${editors[name].getValue()}`);
		} else if (extension === 'html') {
			// something goes here...
			console.log('linking to local html files comming soon...')
		} else {
			console.error('unknown file extension');
		}
	});

	setTimeout(function() {
		// (hopefully/sometimes/maybe) puts any errors in the console
		output.contentWindow.onerror = function(message, source, lineno, colno) {
			consoleBody.innerHTML += `<div class='error' title="${new Date()}">${message} in srcdoc:${lineno}:${colno}</div>`;
		};
	}, 150);
}

function saveCode() {
	// something goes here...
}

