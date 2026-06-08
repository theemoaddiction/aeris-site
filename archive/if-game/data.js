const GAME_DATA = {

intro: `
ARCHIVE NODE: IF-06162004

Connection unstable.

Several records appear incomplete.

Type HELP for available commands.
`,

rooms: {

atrium: {
name: "ATRIUM",
desc: `
You stand beneath a ceiling of black skylights.

The fountain runs without water.

A directory glows nearby.

Storefronts remain illuminated despite showing no signs of power.

Exits:
foodcourt
directory
arcade
fountain
skybridge
`,
exits:["foodcourt","directory","arcade","fountain","skybridge"]
},

foodcourt: {
name: "FOODCOURT",
desc: `
Plastic chairs rest upside-down on tables.

One menu board remains active.

TODAY'S SPECIAL:
WISHING CROWS

A burned CD-R sits beside a soda fountain.

Exits:
atrium
service hall
`,
exits:["atrium","service"]
},

directory: {
name:"DIRECTORY",
desc:`
The mall directory displays:

FOODCOURT
PARKING
RESTROOMS
ELEVATORS

A security badge has been taped to the glass.
`,
exits:["atrium"]
},

fountain:{
name:"FOUNTAIN",
desc:`
The fountain basin contains receipts instead of coins.

One is dated 2004.

One is dated 2026.

One simply says:

IF
`,
exits:["atrium"]
},

arcade:{
name:"CLOSED ARCADE",
desc:`
Most machines are dark.

One cabinet remains powered.

Its attract mode appears to show live mall security footage.

A broken pager rests on the carpet.

Exits:
atrium
maintenance tunnel
`,
exits:["atrium","maintenance"]
},

service:{
name:"SERVICE HALL",
desc:`
A corridor hidden behind storefronts.

Hold music plays somewhere above you.

AUTHORIZED PERSONNEL ONLY
`,
exits:["foodcourt","parking","security"]
},

maintenance:{
name:"MAINTENANCE TUNNEL",
desc:`
The tunnel smells like wet carpet.

A heavy door reads:

OBSERVATION ROOM

The handle feels neither warm nor cold.
`,
exits:["arcade","observation"]
},

parking:{
name:"PARKING STRUCTURE",
desc:`
Rows of empty parking spaces disappear into darkness.

A single black bird stands beneath a fluorescent lamp.

It does not move.
`,
exits:["service"]
},

security:{
name:"SECURITY OFFICE",
desc:`
A bank of CRT monitors watches empty hallways.

One monitor appears to show a location not present on any map.
`,
exits:["service","computerlab"]
},

computerlab:{
name:"COMPUTER LAB",
desc:`
Rows of beige desktop computers.

Every monitor displays the same webpage.

MYLIMINALREALITY.COM
`,
exits:["security"]
},

skybridge:{
name:"SKYBRIDGE",
desc:`
The bridge connects two wings of the mall.

Looking down, you briefly think you see another version of the building beneath this one.
`,
exits:["atrium","department"]
},

department:{
name:"DEPARTMENT STORE",
desc:`
The mannequins appear to have been rearranged recently.

A handwritten sign reads:

INTERLOPERS WELCOME
`,
exits:["skybridge","theater"]
},

theater:{
name:"MOVIE THEATER",
desc:`
The screen is active.

No projector is visible.

The film appears to be showing this mall.
`,
exits:["department","terminal"]
},

terminal:{
name:"TRANSIT TERMINAL",
desc:`
An underground station.

Departure boards show locations instead of destinations.

MALL
MALL
MALL
HOME
UNKNOWN
`,
exits:["theater","roof"]
},

roof:{
name:"ROOF ACCESS",
desc:`
The city skyline is unfamiliar.

You count three moons.

The count changes every time you look.
`,
exits:["terminal"]
},

observation:{
name:"OBSERVATION ROOM",
desc:`
There is no observation room.

You are currently in the observation room.

A CRT monitor displays:

INTERLOPERS FROM OTHER REALITIES
(USING TECHNOLOGY SIMILAR TO THAT OF
THE SCIENTISTS' GOVERNMENT)
GUIDE AND HAMPER THE EXPLORERS

Below the message:

MYLIMINALREALITY.COM
`,
exits:[]
}

},

items: {

"burned cd-r":{
name:"burned cd-r",
desc:"A silver CD-R labeled WISHING CROWS."
},

"security badge":{
name:"security badge",
desc:"Property of someone who is no longer employed."
},

"broken pager":{
name:"broken pager",
desc:"Displays 3:42 AM regardless of battery state."
},

"receipt":{
name:"receipt",
desc:"The paper feels newer than the ink."
},

"mandrake root":{
name:"mandrake root",
desc:"You do not remember acquiring this."
}

},

corruptionMessages:[

"The directory has changed.",

"A location appears on the map that was not there before.",

"You hear mall speakers playing a song you almost remember.",

"A memory has been added to your inventory.",

"Connection quality degraded.",

"Connection quality improved.",

"You briefly remember a store that never existed.",

"A crow watches from somewhere outside the current room.",

"Archive synchronization incomplete.",

"Several records appear contradictory."

],

hiddenCommands:[

"remember",
"forget",
"dream",
"wait",
"disconnect",
"observe",
"wake up"

],

endings: {

observer: `
ENDING 01: OBSERVER

You remained long enough to notice the changes.

Most visitors leave before that point.
`,

interloper: `
ENDING 02: INTERLOPER

You stop exploring.

The archive begins exploring you.
`,

connection: `
ENDING 03: CONNECTION ESTABLISHED

Redirecting...

MYLIMINALREALITY.COM
`

}

};
