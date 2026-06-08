const output = document.getElementById("output");
const commandInput = document.getElementById("command");
const inventoryList = document.getElementById("inventoryList");
const exitsList = document.getElementById("exitsList");
const locationList = document.getElementById("locationList");

let currentRoom = "atrium";

let inventory = [];

let state = {

moves: 0,

corruption: 0,

directoryViews: 0,

observationUnlocked: false,

crowEvent: false,

interloperEvent: false,

mandrakeSpawned: false,

cdPlayed: false,

endingReached: false

};

function updateInventoryPanel(){

    if(!inventoryList){
        return;
    }

    if(inventory.length === 0){
        inventoryList.innerHTML = "empty";
        return;
    }

    inventoryList.innerHTML = inventory.join("<br>");

}

/* ---------- SAVE ---------- */

function saveGame(){

      updateInventoryPanel();
  
localStorage.setItem(
"if06162004",
JSON.stringify({
currentRoom,
inventory,
state
})
);

}

function loadGame(){

const save = localStorage.getItem("if06162004");

if(!save) return false;

try{

const data = JSON.parse(save);

currentRoom = data.currentRoom;
inventory = data.inventory;
state = data.state;

return true;

}catch(e){

return false;

}

}

/* ---------- OUTPUT ---------- */

function print(text, cls=""){

const div = document.createElement("div");

if(cls){
div.className = cls;
}

div.textContent = text;

output.appendChild(div);

output.appendChild(document.createElement("br"));

output.scrollTop = output.scrollHeight;

}

function randomCorruption(){

if(Math.random() > .18){
return;
}

state.corruption++;

const msg =
GAME_DATA.corruptionMessages[
Math.floor(
Math.random() *
GAME_DATA.corruptionMessages.length
)
];

print(msg,"warning");

}

/* ---------- ROOM ---------- */

function describeRoom(){

const room =
GAME_DATA.rooms[currentRoom];

let text =
room.name +
"\n\n" +
room.desc;

if(
currentRoom === "directory"
){

state.directoryViews++;

if(
state.directoryViews === 2
){

text =
`DIRECTORY

FOOD COURT
PARKING
OBSERVATION ROOM
RESTROOMS

The directory appears to have changed.`;

state.observationUnlocked = true;

}

if(
state.directoryViews >= 3
){

text =
`DIRECTORY

OBSERVATION ROOM
OBSERVATION ROOM
OBSERVATION ROOM

The directory no longer appears useful.`;

}

}

print(text);

if(
!state.mandrakeSpawned &&
state.corruption >= 3
){

state.mandrakeSpawned = true;

inventory.push(
"mandrake root"
);

print(
"Something has been added to your inventory.",
"warning"
);

}

}

/* ---------- INVENTORY ---------- */

function showInventory(){

if(
inventory.length === 0
){

print(
"You are carrying nothing."
);

return;

}

print(
"INVENTORY\n\n" +
inventory.join("\n")
);

}

/* ---------- TAKE ---------- */

function takeItem(item){

item = item.toLowerCase();

if(
currentRoom === "foodcourt" &&
item.includes("cd")
){

if(
!inventory.includes(
"burned cd-r"
)
){

inventory.push(
"burned cd-r"
);

print(
"Taken: burned cd-r"
);

return;
}

}

if(
currentRoom === "directory" &&
item.includes("badge")
){

if(
!inventory.includes(
"security badge"
)
){

inventory.push(
"security badge"
);

print(
"Taken: security badge"
);

return;
}

}

if(
currentRoom === "arcade" &&
item.includes("pager")
){

if(
!inventory.includes(
"broken pager"
)
){

inventory.push(
"broken pager"
);

print(
"Taken: broken pager"
);

return;
}

}

if(
currentRoom === "fountain" &&
item.includes("receipt")
){

if(
!inventory.includes(
"receipt"
)
){

inventory.push(
"receipt"
);

print(
"Taken: receipt"
);

return;
}

}

print(
"Nothing happens."
);

}

/* ---------- USE ---------- */

function useItem(item){

item = item.toLowerCase();

if(
item.includes("mandrake")
){

print(
`To safely harvest the plant without going mad, folklore stated that one had to tie a hungry dog to the root and throw food out of the dog's reach, allowing the animal's pull to uproot it while the harvester safely plugged their ears.

You do not remember obtaining this item.`
);

return;

}

if(
item.includes("pager")
){

print(
"3:42 AM\nCONNECTION ESTABLISHED"
);

return;

}

if(
item.includes("cd")
){

state.cdPlayed = true;

print(
`Track 07

WISHING CROWS

Audio detected.

Several birds appear on nearby security monitors.`
);

return;

}

print(
"Nothing useful happens."
);

}

/* ---------- GO ---------- */

function goRoom(target){

target =
target.toLowerCase();

const room =
GAME_DATA.rooms[currentRoom];

if(
target.includes(
"observation"
)
){

if(
!state.observationUnlocked &&
!inventory.includes(
"security badge"
)
){

print(
"The door does not open."
);

return;

}

currentRoom =
"observation";

describeRoom();

return;

}

for(
let exit of room.exits
){

if(
exit.includes(target) ||
target.includes(exit)
){

currentRoom = exit;

describeRoom();

return;

}

}

print(
"You can't go there."
);

}

/* ---------- LISTEN ---------- */

function listen(){

if(
currentRoom === "parking"
){

state.crowEvent = true;

print(
"The bird opens its beak.\n\nDial-up modem sounds emerge."
);

return;

}

if(
currentRoom === "roof"
){

print(
"You hear distant shopping mall music carried on the wind."
);

return;

}

if(
currentRoom === "observation"
){

print(
"The monitor is humming your name incorrectly."
);

return;

}

print(
"You hear fluorescent lights."
);

}

/* ---------- HIDDEN ---------- */

function hiddenCommand(cmd){

if(
cmd === "remember"
){

print(
"You remember a store that never existed."
);

return true;
}

if(
cmd === "forget"
){

print(
"You successfully forget something.\n\nThe archive does not specify what."
);

return true;
}

if(
cmd === "wait"
){

print(
"Several minutes pass.\n\nThe mall remains open."
);

state.corruption++;

return true;
}

if(
cmd === "observe"
){

print(
"You have been observed."
);

return true;
}

if(
cmd === "wake up"
){

print(
"Request denied."
);

return true;
}

return false;

}

/* ---------- ENDINGS ---------- */

function checkEndings(){

if(
currentRoom === "observation" &&
state.cdPlayed &&
state.crowEvent
){

state.endingReached = true;

print(
GAME_DATA.endings.connection
);

setTimeout(()=>{

window.location.href =
"https://myliminalreality.com";

},3000);

}

}

/* ---------- COMMANDS ---------- */

function processCommand(raw){

const cmd =
raw.trim();

if(!cmd){
return;
}

print(
"> " + cmd,
"system"
);

state.moves++;

randomCorruption();

if(
hiddenCommand(
cmd.toLowerCase()
)
){

saveGame();

return;
}

if(
cmd.toLowerCase() === "help"
){

print(
`COMMANDS

look
go [location]
take [item]
use [item]
listen
inventory
save
load
help

Additional commands may exist.`
);

saveGame();

return;
}

if(
cmd.toLowerCase() === "look"
){

describeRoom();

saveGame();

return;
}

if(
cmd.toLowerCase() === "inventory" ||
cmd.toLowerCase() === "i"
){

showInventory();

saveGame();

return;
}

if(
cmd.toLowerCase() === "listen"
){

listen();

saveGame();

return;
}

if(
cmd.toLowerCase() === "save"
){

saveGame();

print(
"Archive state saved."
);

return;
}

if(
cmd.toLowerCase() === "load"
){

if(
loadGame()
){

print(
"Archive restored."
);

describeRoom();

}else{

print(
"No archive state found."
);

}

return;
}

if(
cmd.startsWith("go "))
{

goRoom(
cmd.substring(3)
);

saveGame();

checkEndings();

return;
}

if(
cmd.startsWith("take "))
{

takeItem(
cmd.substring(5)
);

updateInventoryPanel();
saveGame();

return;
}

if(
cmd.startsWith("use "))
{

useItem(
cmd.substring(4)
);

updateInventoryPanel();
saveGame();

checkEndings();

return;
}

if(
cmd.toLowerCase().includes(
"myliminalreality"
)
){

window.location.href =
"https://myliminalreality.com";

return;
}

print(
"Command not recognized."
);

saveGame();

}

/* ---------- START ---------- */

if(
!loadGame()
){

print(
GAME_DATA.intro
);

describeRoom();

}else{

print(
"Archive restored."
);

describeRoom();

}

commandInput.addEventListener(
"keydown",
function(e){

if(
e.key === "Enter"
){

processCommand(
commandInput.value
);

commandInput.value = "";

}

}
);

updateInventoryPanel();
