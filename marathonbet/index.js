"use strict";
module.exports = {
    trigger: false,
    serchEPG : findEPG,
    saveResults: '',    
};

const set = require('../setting');
let color = new set.Color;

function findEPG(link, param) {

    const Nightmare = require('../node_modules/nightmare'); 
      
    let nightmare = Nightmare({
        executionTimeout: 120000, // in ms
        switches: {
            'proxy-server': '',
            'ignore-certificate-errors': true
        },
        show: true
    }); 
        
    let wind = nightmare
    .goto(link)
    .inject('js', '../../../YII_advance/node-js/node_modules/jquery/dist/jquery.min.js');

    let previousHeight = 0;
    let currentHeight = 10;

    while(previousHeight != currentHeight) {
        previousHeight = currentHeight;

        wind.evaluate(function() {
            let location = window.location;  

            let currentLocation = window.location;
            let downBlock = '#footer';

            document.querySelector(downBlock).scrollIntoView(top);
        })
        .wait(3000);

        currentHeight = wind.evaluate(function() {
            currentHeight = 10;
            let location = window.location;  

            let scrollHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );

            return scrollHeight;
        });
    }
  
    wind.evaluate(function() {
        let currentLocation = window.location;
        let elements = document.querySelectorAll('div.coupon-row');
                 
        for (let i = 0; i < elements.length; i++)
        {
            if(elements.length > 0) {
                let but = elements[i].querySelectorAll('span.event-more-view');
                if(but.length > 0) {
                    for(let n = 0; n < but.length; n++) {
                        but[n].click();
                    }
                }
            }
        }

    })
    .wait(5000)
    .evaluate(function() {
        let currentLocation = window.location;
        let elements = document.querySelectorAll('div.details-description table.table-shortcuts-menu td');
        for (let i = 0; i < elements.length; i++)
        {
            let allMrkets = elements[i].textContent.replace(/\n/g,"").trim();
            if(allMrkets === 'All Markets') {
                elements[i].click();
            }
        }
    })
    wind
    .evaluate(function() {

        let error_mes = false;
        let url = window.location;
        let name_sport;
        let name_leage;
        let link_leage;
        let category_content = null;
        let months;
        let positive_res_event;
        let standart_res_event;

        let result = {};
        result['games'] = {};
        result['link_leage'] = url.href;
        
        let first_player = 'first_player';
        let second_player = 'second_player';

        if(/\/en\//.exec(url.pathname) != null) {
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            standart_res_event = ['Yes', 'No'];
            positive_res_event = 'YES';
        }
        else if(/\/su\//.exec(url.pathname) != null) {
            months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
            standart_res_event = ['Да', 'Нет'];
            positive_res_event = 'ДА';
        }

        // определяем является ли ссылка актуальной
        let div_error = document.querySelector("#middle-container h1");
        if(div_error != null) {
            error_old_link = div_error.textContent.replace(/\n/g,"").trim();

            if(error_old_link === '404 Error') {
                result['error_mes'] = 'Ссылка устарела:';
                result['fatal_error'] = true;
                return result;
            }
        }

        // находим общий контейнер с играми
        let div_container = document.querySelector("div.events-container");

        if(div_container != null) {
            // находим общий контейнер с видом спорта
            let div_sport_container = div_container.querySelector("div.sport-category-container");

            if(div_sport_container != null) {
                // находим контейнер с названием спорта
                let div_sport = div_sport_container.querySelector("div.sport-category-header");
                if(div_sport != null) {
                    // находим название спорта
                    name_sport = div_sport.textContent.replace(/\n/g,"").trim();
                }
                else {
                    error_mes = 'Не найден контейнер с названием спорта div.sport-category-header';
                }

                // находим таблицу с лигой
                let table_header = div_sport_container.querySelector("table.category-header td.category-label-td");
                if(table_header != null) {
                    // находим название спорта
                    name_leage = table_header.textContent.replace(/\n/g,"").trim();

                    // находим ссылку на лигу
                    link_leage = table_header.querySelector('a.category-label-link').getAttribute('href');

                    // получаем контейнер с играми
                    category_content = div_sport_container.querySelector("div.category-content");
                    if(category_content === null) {
                        result['error_mes'] = 'Не найден контейнер с играми div.category-content';
                    }
                }
                else {
                    result['error_mes'] = 'Не найдена таблица с названием лиги table.category-header td.category-label-td';
                }
            }
            else {
                result['error_mes'] = 'Не найден контейнер с видом спорта div.sport-category-container';
            }
        }
        else {
            result['error_mes'] = 'Не найден контейнер с играми div.events-container';
        }

        result['name_leage'] = name_leage;
        result['name_sport'] = name_sport;

        if (result.hasOwnProperty('error_mes')) {
            result['fatal_error'] = true;
            return result;
        }

        if(category_content != null) 
        {
            // получаем шапку главной таблицы
            let table_label = category_content.querySelector('table.coupone-labels');
            let arr_th = [];
            if(table_label != null) {
                let arr_th_header = [];
                let arr_th = table_label.querySelectorAll('th.coupone');
                // перебираем столбики шапки таблицы
                arr_th.forEach(function(th, i) {
                    let th_content = th.textContent.replace(/\n/g,"").trim();
                    if(th_content != '') {
                        arr_th_header.push(th_content.trim());
                    }
                });
                result['th_header'] = arr_th_header;
            }
            else {
                result['error_mes'] = 'Шапка таблицы не найдена table.coupone-labels';
            }

            // получаем массив dom-элементов с играми
            let arr_games = document.querySelectorAll('div.coupon-row');
            // перебираем массив с элементами игр
            let n = 0;
            let return_obj = {};

            for (let x = 0; arr_games.length > x; x++) {
                
                result['games'][x] = {};
                result['games'][x]['events'] = [];
                // получаем таблицу с названиями игроков, датой и главными событиями
                let table_main_events = arr_games[x].querySelector('table.coupon-row-item');
                let events = [];
                if(table_main_events != null) {
                    // получаем блоки с названиями игроков
                    let arr_players = table_main_events.querySelectorAll('table.member-area-content-table div.command');
                    if(arr_players != null) {
                        let obj_players = {};
                        arr_players.forEach(function(player, i) {
                            let number_player = player.querySelector('b.member-number').textContent.replace(/\n/g,"").trim();
                            let name_player = player.querySelector('span').textContent.replace(/\n/g,"").trim();
                            number_player = number_player.replace('.',"");
                            // имя первого игрока
                            if(number_player == 1) {
                                obj_players[first_player] = name_player;
                            }
                            // имя второго игрока
                            else if(number_player == 2) {
                                obj_players[second_player] = name_player;
                            }
                        });

                        result['games'][x]['players'] = obj_players;
                    }
                    else {
                        result['error_mes'] = 'Игроки не найдены:';
                        result['fatal_error'] = true;
                        return result;
                    }

                    // получаем блок с датой
                    let td_date = table_main_events.querySelector('td.date');
                    if(td_date != null) {
                        let date_content = td_date.textContent.replace(/\n/g,"").trim();
                        let arr_date = date_content.split(' ');
                        let today = new Date();
                        let day;
                        let month;
                        let year;
                        let time;
                        let date = '';

                        arr_date.forEach(function(date_element, i) {
                            // находим день
                            let reg_day = /^[0-9]{1,2}$/;
                            let arr_day = reg_day.exec(date_element);
                            if(arr_day != null) {
                                day = date_element;
                            }

                            // находим год
                            let reg_year = /^[0-9]{4}$/;
                            let arr_year = reg_year.exec(date_element);
                            if(arr_year != null) {
                                year = date_element;
                            }

                            // находим месяц
                            let reg_month = /^[^0-9]{3}$/;
                            let arr_month = reg_month.exec(date_element);
                            if(arr_month != null) {
                                month = months.indexOf(date_element);
                                month = ++month;
                            }                            

                            // находим время
                            let reg_time = /^[0-9]{1,2}:[0-9]{2}$/;
                            let arr_time = reg_time.exec(date_element);
                            if(arr_time != null) {
                                time = date_element + ':00';
                            }
                        });

                        // создаем дату в формате timestamp
                        if(typeof time !== 'undefined') {
                            // добавляем год
                            if(typeof year !== 'undefined') {
                                date = date + year;
                            }
                            else {
                                date = date + today.getFullYear(); 
                            }

                            // добавляем месяц
                            if(typeof month !== 'undefined') {
                                date = date + '-' + month;
                            }
                            else {
                                date = date + '-' + today.getMonth(); 
                            }

                            // добавляем месяц
                            if(typeof day !== 'undefined') {
                                date = date + '-' + day;
                            }
                            else {
                                date = date + '-' + today.getDate(); 
                            }
                            // добавляем время
                            date = date + ' ' + time;
                        }
                        result['games'][x]['date'] = date;
                    }
                    else {
                        result['games'][x]['error_mes'] = 'Блок с датой не найден td.date';
                    }

                    // получаем главные события игры
                    let arr_main_events = table_main_events.querySelectorAll('td.height-column-with-price');
                    if(arr_main_events != null) {
                        
                        arr_main_events.forEach(function(event, i) {
                            let obj_main_event = {};
                            let event_content = event.textContent.replace(/\n/g,"").trim();
                            let event_result;

                            obj_main_event['event_result'] = positive_res_event;
                            obj_main_event['event_name'] = result['th_header'][i];
                            obj_main_event['kf'] = event_content;
                            obj_main_event['event_name'] = obj_main_event['event_name'].replace(/[ \f\n\r\t\v]{3,}/,". ");

                            // проверка на наличие данных в скобках (фора)
                            let reg_hand = /(\([-+]?[0-9].[0-9]\)|\([-+]?[0-9]\))/;
                            let arr_event_name = reg_hand.exec(obj_main_event['kf']);
                            if(arr_event_name != null) {
                                obj_main_event['event_name'] = obj_main_event['event_name'] + ' ' + arr_event_name[0];

                                let reg_kf = /[0-9]{1,}.[0-9]{2}/;
                                let arr_kf = reg_kf.exec(obj_main_event['kf']);
                                if(arr_kf != null) {
                                    obj_main_event['kf'] = arr_kf[0];
                                }
                            }

                            if(obj_main_event['kf'] != '') {
                                result['games'][x]['events'].push(obj_main_event);
                            }
                        });
                    }
                    else {
                        result['games'][x]['error_mes'] = 'Массив с главными событиями не найден td.height-column-with-price';
                    }

                    n++;
                    result['games'][x]['count_games'] = n;
                }

                // получаем блок с остальными событиями
                let div_events = arr_games[x].querySelector('div.left-indentation');
                if(div_events != null) 
                {
                    // получаем столбцы таблицы
                    let events = div_events.querySelectorAll('td.height-column-with-price');
                    if(events != null) {
                        for (let y = events.length - 1; y >= 0; y--) {

                            let str_event = events[y].dataset.sel;
                            if (typeof str_event !== 'undefined' && str_event !== false && typeof str_event !== null) {
                                let json_event = JSON.parse(str_event);

                                let obj_event = {};
                                obj_event['event_result'] = json_event.sn;
                                obj_event['event_name'] = json_event.mn;
                                obj_event['kf'] = json_event.epr;

                                if(standart_res_event.indexOf(obj_event['event_result']) === -1) {
                                    obj_event['event_name'] = obj_event['event_name'] + '. ' + obj_event['event_result'];
                                    obj_event['event_result'] = positive_res_event;
                                }

                                obj_event['event_result'] = obj_event['event_result'].toUpperCase();
                                                            
                                obj_event['event_name'] = obj_event['event_name'].trim();

                                result['games'][x]['players'][first_player] = result['games'][x]['players'][first_player].replace(' / ', '/');
                                result['games'][x]['players'][second_player] = result['games'][x]['players'][second_player].replace(' / ', '/');

                                obj_event['event_name'] = obj_event['event_name'].split(result['games'][x]['players'][first_player]).join(first_player);
                                obj_event['event_name'] = obj_event['event_name'].split(result['games'][x]['players'][second_player]).join(second_player);

                                result['games'][x]['events'].push(obj_event);
                            }
                        }
                    }
                }
                else {
                    result['games'][x]['error_mes'] = 'Таблица с событиями не найдена div.market-table-name';  
                }                
            }
        }

        result['error_mes'] = error_mes;
        return result;
    })
    .end()   
    .then(function(return_obj) {

        // не получен доступ к играм
        if(return_obj.hasOwnProperty('fatal_error')) {
            console.log(color.warning, return_obj.error_mes, color.reset);
            console.log("=> " + param.en_src);
            module.exports.trigger = true;
            if(param.en_src === return_obj['link_leage']) {
                const mod_up = require('../data');
                mod_up.updateInvalidLeage(param);
            }
        }
        // доступ к играм получен
        else {
            if(param.en_src === return_obj['link_leage']) {
                module.exports.trigger = true;
                console.log(color.succes, 'Хорошая сылка:', color.reset);
                console.log("=> " + link);
                module.exports.saveResults(return_obj, param);
                findEPG(param.ru_src, param);
            }
            if(param.ru_src === return_obj['link_leage']) {
                console.log(color.succes, 'Сохранение русского файла', color.reset);
                const file_mod = require('../script/file_mod');
                file_mod.saveNewItemsInFile(return_obj, param.file);
            }
        }
    })
    .catch(function(e)  {
        /*
        if(e != '') {
            parseMenu();
        }
        */
        console.log(color.error, 'ОШИБКА ПАРСИНГА СТРАНИЦЫ САЙТА МАРАФОН:', color.reset);
        console.log("=> " + link); 
        console.log(e);
        module.exports.trigger = true;
    });
}