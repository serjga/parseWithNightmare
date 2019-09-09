"use strict";
module.exports = {
    searchInAllLeages : searchEvents,
    searchInCertainLeages : discoverArrLeage,
};

const set = require('../setting');
let color = new set.Color;

// поиск событий, игроков и игр
function searchEvents(param, limit = 0) {

    const db = require('../data/db');
    let connection = db.connect();
    let param_limit = '';
    // console.log(limit);
    if(typeof limit === 'number' && limit != 0) {
        param_limit = ' LIMIT ' + limit;
    }

    // Создаётся объект findLeage
    let findLeage = new Promise((resolve, reject) => {

        let query1 = {
            text : "SELECT `id`, `sport_id`, `url` FROM " + param.table_leage + " WHERE update_at = (SELECT MAX(update_at) FROM " + param.table_leage 
                + ") AND id IN (SELECT " + param.coloumn_leage + " FROM leage) AND marker = 0" + param_limit,
            placeholder_arr : []
        };

        return connection.query(query1.text, query1.placeholder_arr, function(err, obj_event, fields) {
            if (err) {
                return reject(err);
            } 
            else {
                if(obj_event.length > 0) {
                    return resolve(obj_event); 
                }
            }
        });
    });

    findLeage
        .then(
            result => {
                // console.log(result);
                discoverArrLeage(result, param);                
            },
            error => {
                // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                    searchEvents(param, limit);
                }
                else {
                    console.log("searchEvents :: Ошибка получения данных игроков для обработки: ");
                    console.log(error);
                }
            }
        );
    connection.end(); 
}

function discoverArrLeage(arr_leage, param, iter = 0) {
    if(arr_leage.length > 0) {
        
        // Создаётся объект setOptionLeage
        let setOptionLeage = new Promise((resolve, reject) => {
            console.log(color.counter, param.name.toUpperCase() + ' :: ОСТАЛОСЬ ЛИГ: ' + arr_leage.length, color.reset);
            let leage = arr_leage.pop();

            const mb = require('../' + param.name);
            const tools_bet = require('../' + param.name + '/tools');
            const mod = require('./save_EPG');
            const file_mod = require('./file_mod');

            // создаем объект с общими настройками
            let common_param = new mod.Param(leage, param);
            // получаем русскую ссылку
            common_param.ru_src = tools_bet.createRuUrl(leage, param);
            // очищаем файл с играми
            if(iter === 0) {
                file_mod.makeEmptyFile(common_param.file);
            }
            // начинаем поиск на сайте
            mb.saveResults = mod.startSerchEPG;
            mb.serchEPG(common_param.en_src, common_param);

            let delay = 5000;
            let timerId = setTimeout(function request() {

                if (mb.trigger === true) {
                    mb.trigger = false;
                    return resolve({ arr_leage : arr_leage, param : param });
                }

                timerId = setTimeout(request, delay);
            }, delay);
        });

        setOptionLeage
        .then(
            result => {
                discoverArrLeage(result.arr_leage, result.param, ++iter);
            },
            error => {
                console.log("discoverArrLeage :: Ошибка выполнения функции");
                console.log(error);
            }
        );        
    }
}