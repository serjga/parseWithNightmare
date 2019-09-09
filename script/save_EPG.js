"use strict";
module.exports = {
    startSerchEPG : saveParseResult,
    Param : Param,
};

const tools = require('./tools');
const data = require('../data');
const setting = require('../setting');

function Param(leage, param) {
    this.id_sport = leage.sport_id;
    this.id_leage = leage.id;
    this.id_site = param.site_id;
    this.table_events = param.table_events;
    this.table_players = param.table_players;
    this.table_leage = param.table_leage;
    this.coloumn = param.coloumn;
    this.file = setting.dirFile + param.name + '/' + param.table_events + '.txt',
    this.en_src = param.site_url + leage.url;
    this.url = leage.url;
    this.today = tools.getDateFormateTimestamp();
}

function saveParseResult(arr, param) {

    if(arr.hasOwnProperty('fatal_error') === false) {
        
        // Создаётся объект save
        let save = new Promise((resolve, reject) => {
            // подготавливаем массив событий для сохранения событий в базу данных
            arr['events'] = tools.createArrUniqueEvent(arr['games']);
            // console.log(arr['events']);
            return resolve(arr); 
        });

        save
        .then(function(result) {
            // сохраняем новые события в базу данных
            data.writeEventsInData(result['events'], param);
            return result;
        })
        .then(function(result) {
            // подготавливаем массив для сохранения игроков в базу данных
            result['players'] = tools.createArrUniquePlayers(result['games']);
            return result;
        })
        .then(function(result) {
            // сохраняем новых игроков в базу данных
            data.writePlayersInData(result['players'], param);
            return result;
        })
        .then(function(result) {
            // сохраняем новые игры в базу данных
            data.writeGamesInData(result['games'], param);
        });
    }
}