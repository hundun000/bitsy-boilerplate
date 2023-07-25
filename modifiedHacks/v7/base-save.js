/**
💾
@file save
@summary save/load your game
@license MIT
@author Sean S. LeBlanc

@description
Introduces save/load functionality.

Includes:
	- data that may be saved/loaded:
		- current room/position within room
		- inventory/items in rooms
		- dialog variables
		- dialog position
	- basic autosave
	- dialog tags:
		- (save): saves game
		- (load ""): loads game; parameter is text to show as title on load
		- (clear): clears saved game
		- (saveNow)/(loadNow)/(clearNow): instant varieties of above tags

Notes:
	- Storage is implemented through browser localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	  Remember to clear storage while working on a game, otherwise loading may prevent you from seeing your changes!
	  You can use the `clearOnStart` option to do this for you when testing.
	- This hack only tracks state which could be modified via vanilla bitsy features,
	  i.e. compatibility with other hacks that modify state varies;
	  you may need to modify save/load to include/exclude things for compatibility.
	  (feel free to ask for help tailoring these to your needs!)
	- There is only one "save slot"; it would not be too difficult to implement more,
	  but it adds a lot of complexity that most folks probably don't need.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/
import bitsy from 'bitsy';
import { addDualDialogTag, addDialogTag, after, before } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';
import { inject } from '@bitsy/hecks/src/helpers/utils';

export var hackOptions = {
	// when to save/load
	autosaveInterval: Infinity, // time in milliseconds between autosaves (never autosaves if Infinity)
	loadOnStart: true, // if true, loads save when starting
	clearOnEnd: false, // if true, deletes save when restarting after reaching an ending
	clearOnStart: false, // if true, deletes save when page is loaded (mostly for debugging)
	// what to save/load
	position: true, // if true, saves which room the player is in, and where they are in the room
	variables: true, // if true, saves dialog variables (note: does not include item counts)
	items: true, // if true, saves player inventory (i.e. item counts) and item placement in rooms
	dialog: true, // if true, saves dialog position (for sequences etc)
	sprites_position: true,
	key: 'snapshot', // where in localStorage to save/load data
};

function save() {
	var snapshot = {};
	if (hackOptions.position) {
		snapshot.room = bitsy.state.room;
		snapshot.x = bitsy.player().x;
		snapshot.y = bitsy.player().y;
	}
	if (hackOptions.sprites_position) {
		snapshot.sprites_position = Object.values(bitsy.sprite)
				.filter(function (spr) {
					return spr.id !== bitsy.playerId;
				})
				.map(function (spr) {
					return [spr.id, spr.room, spr.x, spr.y];
				});
	}
	if (hackOptions.items) {
		snapshot.inventory = bitsy.player().inventory;
		snapshot.items = Object.entries(bitsy.room).map(function (room) {
			return [room[0], room[1].items];
		});
	}
	
	if (hackOptions.variables) {
		snapshot.variables = bitsy.scriptInterpreter.GetVariableNames().map(function (variable) {
			return [variable, bitsy.scriptInterpreter.GetVariable(variable)];
		});
	}
	if (hackOptions.dialog) {
		snapshot.sequenceIndices = bitsy.saveHack.sequenceIndices;
		snapshot.shuffles = bitsy.saveHack.shuffles;
	}
	localStorage.setItem(hackOptions.key, JSON.stringify(snapshot));
}

function load() {
	var snapshot = localStorage.getItem(hackOptions.key);
	// if there's no save, abort load
	if (!snapshot) {
		return;
	}
	snapshot = JSON.parse(snapshot);

	if (hackOptions.position) {
		if (snapshot.room) {
			bitsy.state.room = bitsy.player().room = snapshot.room;
		}
		if (snapshot.x && snapshot.y) {
			bitsy.playerPrevX = bitsy.player().x = snapshot.x;
			bitsy.playerPrevY = bitsy.player().y = snapshot.y;
		}
	}
	if (hackOptions.sprites_position) {
		if (snapshot.sprites_position) {
			snapshot.sprites_position.forEach(function (entry) {
				bitsy.sprite[entry[0]].room = entry[1];
				bitsy.sprite[entry[0]].x = entry[2];
				bitsy.sprite[entry[0]].y = entry[3];
			});
		}
	}
	if (hackOptions.items) {
		if (snapshot.inventory) {
			bitsy.player().inventory = snapshot.inventory;
		}
		if (snapshot.items) {
			snapshot.items.forEach(function (entry) {
				bitsy.room[entry[0]].items = entry[1];
			});
		}
	}
	if (hackOptions.variables && snapshot.variables) {
		snapshot.variables.forEach(function (variable) {
			bitsy.scriptInterpreter.SetVariable(variable[0], variable[1]);
		});
	}
	if (hackOptions.dialog && snapshot.sequenceIndices) {
		bitsy.saveHack.sequenceIndices = snapshot.sequenceIndices;
		bitsy.saveHack.shuffles = snapshot.shuffles;
	}
	bitsy.drawRoom(bitsy.room[bitsy.state.room], { redrawAll: true });
}

function clear() {
	localStorage.removeItem(hackOptions.key);
}

// setup global needed for saving/loading dialog progress
bitsy.saveHack = {
	sequenceIndices: {},
	shuffles: {},
	saveSeqIdx: function (node, index) {
		var key = node.GetId();
		bitsy.saveHack.sequenceIndices[key] = index;
	},
	loadSeqIdx: function (node) {
		var key = node.GetId();
		return bitsy.saveHack.sequenceIndices[key];
	},
	saveShuffle: function (node, options) {
		var key = node.GetId();
		bitsy.saveHack.shuffles[key] = options;
	},
	loadShuffle: function (node) {
		var key = node.GetId();
		return bitsy.saveHack.shuffles[key];
	},
};

// use saved index to eval/calc next index if available
inject(/(optionsShuffled\.push\()optionsUnshuffled\.splice\(i,1\)\[0\](\);)/, '$1 i $2 optionsUnshuffled.splice(i,1);');
inject(
	/(optionsShuffled\[index\])/,
	`
var i = window.saveHack.loadSeqIdx(this);
index = i === undefined ? index : i;
optionsShuffled = window.saveHack.loadShuffle(this) || optionsShuffled;
window.saveHack.saveShuffle(this, optionsShuffled);
options[index]`
);
inject(/(\/\/ bitsy\.log\(".+" \+ index\);)/g, '$1\nvar i = window.saveHack.loadSeqIdx(this);index = i === undefined ? index : i;');
// save index on changes
inject(/(index = next;)/g, '$1window.saveHack.saveSeqIdx(this, index);');
inject(/(\tindex = 0;)/g, '$1window.saveHack.saveSeqIdx(this, index);');
inject(/(\tindex\+\+;)/g, '$1window.saveHack.saveSeqIdx(this, index);');

// hook up autosave
var autosaveInterval;
after('onready', function () {
	if (hackOptions.autosaveInterval < Infinity) {
		clearInterval(autosaveInterval);
		autosaveInterval = setInterval(save, hackOptions.autosaveInterval);
	}
});

// hook up autoload
after('onready', function () {
	if (hackOptions.loadOnStart) {
		load();
	}
});

// hook up clear on end
before('reset_cur_game', function () {
	if (hackOptions.clearOnEnd) {
		if (bitsy.isEnding) {
			clear();
		}
	}
});

// hook up clear on start
before('startExportedGame', function () {
	if (hackOptions.clearOnStart) {
		clear();
	}
});

// override title if loading
var replaceTitle;
before('renderer.SetDrawings', function () {
	if (replaceTitle !== undefined) {
		bitsy.setTitle(replaceTitle);
	}
});

// hook up dialog functions
function dialogLoad(environment, parameters) {
	replaceTitle = parameters[0] || '';
	var loadOnStart = hackOptions.loadOnStart;
	hackOptions.loadOnStart = true;
	bitsy.reset_cur_game();
	bitsy.load_game(bitsy.bitsy.getGameData(), bitsy.bitsy.getFontData());
	hackOptions.loadOnStart = loadOnStart;
}
addDualDialogTag('save', save);
addDualDialogTag('load', dialogLoad);
addDualDialogTag('clear', clear);

addDualDialogTag('loadAndJump', loadAndJump);

function loadAndJump(environment, parameters) {
	let realParams = parameters[0].split(',');
	dialogLoad(environment, realParams.slice(1))
	copied_jump(realParams[0]);
}

function copied_jump(targetDialog) {
	if (!targetDialog) {
		console.warn('Tried to jump to dialog, but no target dialog provided');
		return;
	}
	var dialogStr = bitsy.dialog[targetDialog];
	var dialogId;
	if (!dialogStr) {
		dialogStr = targetDialog;
	} else {
		dialogId = targetDialog;
		dialogStr = dialogStr.src;
	}
	bitsy.startDialog(dialogStr, dialogId);
}

addDialogTag('hasSaveNow', function (environment, parameters, onReturn) {
	var snapshot = localStorage.getItem(hackOptions.key);
	// if there's no save, abort load
	if (snapshot) {
		onReturn(1);
	} else {
		onReturn(0);
	}
});