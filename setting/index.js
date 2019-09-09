"use strict";
module.exports = {
    dirFile : '../yii2-app-advanced/parse/',
    Color : Color,    
    Marathonbet : Marathonbet,
    Parimatch : Parimatch,
};

function Color() {
    this.reset = '\x1b[0m';
    this.succes = '\x1b[32m';
    this.error = '\x1b[31m';
    this.warning = '\x1b[33m';
    this.counter = '\x1b[47m\x1b[30m';
}

function Marathonbet() {
    this.site_id = 1;
    this.site_url = 'https://www.marathonbet.com';
    this.table_events = 'marathonbetevents';
    this.table_players = 'marathonbetplayers';
    this.table_leage = 'marathonbetleage';
    this.coloumn_leage = 'marathonbet_id';
    this.coloumn = 'en_name';
    this.name = 'marathonbet';
    this.menu_en_src = 'https://www.marathonbet.com/en/all-events.htm?cpcids=all';
    this.menu_ru_src = 'https://www.marathonbet.com/su/all-events.htm?cpcids=all';
}


function Parimatch() {
    this.site_id = 2;
    this.site_url = 'https://www.parimatch.com';
    this.table_events = 'parimatchevents';
    this.table_players = 'parimatchplayers';
    this.table_leage = 'parimatchleage';
    this.coloumn_leage = 'parimatch_id';
    this.coloumn = 'en_name';
    this.name = 'parimatch';
    this.menu_en_src = 'https://www.parimatch.com/en/';
    this.menu_ru_src = 'https://www.parimatch.com/';
}