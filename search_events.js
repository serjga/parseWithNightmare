"use strict";
const md = require('./script/discover_bets');
const set = require('./setting');


let leage = {
    id : 44,
    sport_id : 42,
    url : '/en/sport/ufc/fight-night-161-13102019',
};

let leage1 = {
    id : 87,
    sport_id : 4,
    url : '/en/sport/futbol/anglija-premer-liga',
};

let leage2 = {
    id : 298,
    sport_id : 1,
    url : '/en/sport/kibersport/counter-strike-intel-grand-slam-season-3-itogi',
};

// Марафон
let marathonbet = new set.Marathonbet;
// md.searchInCertainLeages([leage, leage1, leage2], marathonbet);
md.searchInAllLeages(marathonbet);

// Париматч
let parimatch = new set.Parimatch;
// md.searchInCertainLeages([leage, leage1, leage2], parimatch);
md.searchInAllLeages(parimatch);
