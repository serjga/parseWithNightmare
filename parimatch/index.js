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
    .inject('js', '../../../YII_advance/node-js/node_modules/jquery/dist/jquery.min.js')
    .wait(5000)
    .evaluate(function() {

        // поиск элемента в объекте с возвратом ключа
        function searchInObject(obj, val)
        {
            for (let key in obj) {
                if(obj[key] == val) {
                    return key;
                }
            }
        }

        // поиск основных событий
        function findMainEvents(name_coloumn, b_arr, arr_events, odds, str = '') {
            if(b_arr != null) {

                for(let a = 0; a < odds.length; a++) 
                {
                    let u_arr_kf = odds[a].u.querySelectorAll('u');

                    if(b_arr != null && u_arr_kf != null && u_arr_kf.length === b_arr.length) {
                        for(let b = 0; b < b_arr.length; b++) 
                        {
                            let bold = b_arr[b].textContent.trim();
                            let events;
                            let kf = u_arr_kf[b].textContent.trim();

                            if(b_arr.length > 1) {
                                if(b === 0) {
                                    events = first_player + ' ' + str + ' ' + name_coloumn + ' ' + bold + ' ' + odds[a].col;
                                }
                                else if(b === 1) {
                                    events = second_player + ' ' + str + ' ' + name_coloumn + ' ' + bold + ' ' + odds[a].col;
                                }
                            }
                            else {
                                events = str + ' ' + name_coloumn + ' ' + bold + ' ' + odds[a].col;
                            }

                            if(kf != '') {
                                arr_events.push({ event_name : events.trim().replace(/[ \f\n\r\t\v]{2,}/g, ' '), event_result : positive_res_event, kf : kf });
                            }
                        }
                    }
                }
            }
            return arr_events;
        }

        function findMainEvent1(coloumn, name_coloumn, kf_e, arr_events, str = '') {
            if(coloumn == 'win1' || coloumn == 'win2' || coloumn == 'draw' || 
                coloumn == 'win1draw' || coloumn == 'win2draw' || coloumn == 'win12') {
                if(kf_e != null) {
                    if(str != '') {
                        str = str + ' ';
                    }
                    let kf = kf_e.querySelector('a');
                    if(kf != null) {
                        kf = kf_e.textContent.trim();

                        if(kf != '') {
                            arr_events.push({ event_name : str + name_coloumn.trim(), event_result : positive_res_event, kf : kf });
                        }                        
                    }
                }
            }
            return arr_events;
        }

        // получаем главные игровые события фора, тотал, инд. тотал 
        function searchTotalAndHand(name_coloumn, headers, y, step_head, arr_main_events, arr_events, str = '') {
            
            if(name_coloumn == 'total' || name_coloumn == 'itotal' || name_coloumn == 'hand') {
                let odds = [];
                if(typeof arr_main_events[y+1] != "undefined") {
                    odds = [
                        { col : headers[step_head+1], u : arr_main_events[y+1] },
                    ];

                    if(name_coloumn != 'hand') {
                        if(typeof arr_main_events[y+2] != "undefined") {
                            odds.push({ col : headers[step_head+2], u : arr_main_events[y+2] });
                        }
                    }
                }
                    
                if(typeof arr_main_events[y] != "undefined" && odds.length > 0 && arr_main_events[y].querySelectorAll('b') != null) {
                    let b_arr_main_events = arr_main_events[y].querySelectorAll('b');
                    arr_events = findMainEvents(headers[step_head], b_arr_main_events, arr_events, odds, str);                    
                }
            }
            return arr_events;    
        }

        function serchEventsInTablePs(element, events, players, str = '') {
            let nextTablePs = element.querySelector('table.ps');
            if(nextTablePs != "undefined" && nextTablePs != null) {
                if(nextTablePs.querySelector('table.ps') === null) {
                    let arr_tr_nextTablePs = nextTablePs.querySelectorAll('tbody > tr');
                    if(arr_tr_nextTablePs != null) {
                        for(let k = 0; k < arr_tr_nextTablePs.length; k++) {
                        let strTableContent = arr_tr_nextTablePs[k].textContent.trim();
                        events = 
                            createSecondaryEvents(strTableContent, events, players, str);
                        }                        
                    }
                }
                else {
                    let childNextTablePs = nextTablePs.querySelector('table.ps');
                    events = serchEventsInTablePs(childNextTablePs, events, players, str);
                }
            }
            return events;
        }

        // формируем из строки события
        function createSecondaryEvents(string_tr, events, players, str = '') {
            if(str != '') {
                str = str + ' ';
            }
            string_tr = string_tr.replace(/[:]{1}[\(]{1}/g, ': (');
            let reg_str = /[\w\s.\-+,:'\\\(\/\)]{1,}:[ \f\n\r\t\v\s]{1}/g;
            let arr_str = string_tr.match(reg_str);

            if(arr_str != null) {
                let arr_sub_ev = string_tr.split(reg_str);
                events = createEventsFromTwoArr(arr_str, arr_sub_ev, events, players, str);
                // events.push(arr_sub_ev);
            }
            else {
                events = createEventsFromTwoArr([''], ['', string_tr], events, players, str);
            }
            return events;
        }

        // перебираем подстроки событий
        function createEventsFromTwoArr(arr_event, arr_sub_kf, events, players, str = '') {
            if(arr_sub_kf != null) {
                if(str != '') {
                    str = str + ' ';
                }
                for(let k = 0; k < arr_event.length; k++) {

                    let reg_str = /[\d]{1,}.[\d]{1,};/g;
                    let arr_kf = arr_sub_kf[k+1].match(reg_str);
                    if(arr_kf != null) {
                        let arr_sub_ev = arr_sub_kf[k+1].split(reg_str);
                        events = createObjEvents(arr_sub_ev, arr_kf, events, players, str + arr_event[k]);
                        // events.push(arr_kf);
                    }
                }
            }
            return events;
        }

        // создаем события из массивов подстрок
        function createObjEvents(arr_event, arr_kf, events, players, str = '') {
            if(str != '') {
                str = str + ' ';
            }
            let hand = '';
            for(let k = 0; k < arr_kf.length; k++) {
                let kf = arr_kf[k].replace(';', '').trim();
                if(kf != null && kf != '') {
                    let obj_event = {};
                    let sub_event = arr_event[k].replace( /[\w\s.\-+,:'\\\(\/\)]{1,};/g, '').trim(); // Б = 

                    let k_hand = '';
                    let reg_hand = /[\(]{1}[\d]{1,}.[\d]{1,}[\)]{1}/;
                    let arr_hand = reg_hand.exec(sub_event);
                    if(arr_hand != null) {
                        k_hand = '';
                        hand = arr_hand[0];
                    }
                    else {
                        k_hand = ' ' + hand + ' ';
                    }

                    obj_event['kf'] = kf;

                    if(standart_res_event.indexOf(sub_event) === -1) {
                        obj_event['event_name'] = str + k_hand + sub_event;
                        obj_event['event_result'] = positive_res_event;
                    }
                    else {
                        obj_event['event_name'] = str.trim() + k_hand;
                        obj_event['event_result'] = sub_event.toUpperCase();
                    }

                    obj_event['event_name'] = obj_event['event_name'].split(players[first_player]).join(first_player).trim();
                    obj_event['event_name'] = obj_event['event_name'].split(players[second_player]).join(second_player).trim();

                    obj_event['event_name'] = obj_event['event_name'].replace(/[ \f\n\r\t\v\s]{2,}/g, ' ');
                    events.push(obj_event);
                }
            }
            return events;
        }

        let error_mes = false;
        let url = window.location;
        let name_sport;
        let name_leage;
        let link_leage;
        let category_content = null;
        let months;
        let positive_res_event;
        let standart_res_event;
        let obj_header;

        let result = {};
        result['games'] = {};
        result['link_leage'] = url.href;

        if(/\/en\//.exec(url.pathname) != null) {
            obj_header = {
                number : '#',
                date : 'Date',
                players : 'Event',
                hand : 'Hand.',
                odds : 'Odds',
                total : 'Total',
                over_total : 'Over',
                under_total : 'Under',
                win1 : '1',
                win2 : '2',
                draw : 'X',
                win1draw : '1X',
                win2draw : 'X2',
                win12 : '12',
                itotal : 'iTotal',
                c_3_0 : '3:0',
                c_3_1 : '3:1',
                c_3_2 : '3:2',
                c_2_3 : '2:3',
                c_1_3 : '1:3',
                c_0_3 : '0:3',
            };
            positive_res_event = 'YES';
            standart_res_event = ['yes', 'no'];
        }
        else {
            obj_header = {
                number : '№',
                date : 'Дата',
                players : 'Событие',
                hand : 'Фора',
                odds : 'КФ',
                total : 'Т',
                over_total : 'Б',
                under_total : 'М',
                win1 : 'П1',
                win2 : 'П2',
                draw : 'X',
                win1draw : '1X',
                win2draw : 'X2',
                win12 : '12',
                itotal : 'iТ',
                c_3_0 : '3:0',
                c_3_1 : '3:1',
                c_3_2 : '3:2',
                c_2_3 : '2:3',
                c_1_3 : '1:3',
                c_0_3 : '0:3',
            };
            positive_res_event = 'ДА';
            standart_res_event = ['да', 'нет'];
        }
        
        let first_player = 'first_player';
        let second_player = 'second_player';

        let container = document.querySelector('#oddsList');
        if(container === null) {
            result['error_mes'] = 'Контейнер #oddsList с играми не найден:';
            result['fatal_error'] = true;
            return result;
        }

        let div_error = container.querySelector('#errHolder');
        if(div_error != null) {
            result['error_mes'] = 'Ссылка устарела:';
            result['fatal_error'] = true;
            return result;
        }

        let div_discover = container.querySelector('#f1');
        if(div_discover === null) {
            result['error_mes'] = 'Контейнер #f1 с играми не найден:';
            result['fatal_error'] = true;
            return result;
        }        

        let div_container = div_discover.querySelector('div.container.gray');
        if(div_container === null) {
            result['error_mes'] = 'Контейнер div.container.gray с играми не найден:';
            result['fatal_error'] = true;
            return result;
        }

        // получаем контейнеры tbody для перебора
        let arr_tbody = div_container.querySelectorAll('div.wrapper  table.dt > tbody');
        if(arr_tbody === null) {
            result['error_mes'] = 'Контейнер tbody с играми не найден:';
            result['fatal_error'] = true;
            return result;
        }

        let headers = [];
        let x = 0;

        // перебираем контейнеры tbody
        tbody:
        for(let tb = 0; tb < arr_tbody.length; tb++) {

            // HEADER -> если находим контейнер tbody.processed
            if(arr_tbody[tb].classList.contains('processed') && arr_tbody[tb].classList.length === 1) {

                // получаем название главных событий
                let arr_header = arr_tbody[tb].parentElement.querySelectorAll('tbody.processed > tr > th');
                headers = [];
            
                if(arr_header != null) {
                    for (let i = 0; i < arr_header.length; i++) {
                        headers.push(arr_header[i].textContent.trim());
                    }
                }

            } // <- HEADER

            // PLAYERS -> если находим контейнер tbody.processed
            if(arr_tbody[tb].classList.contains('props') === false && arr_tbody[tb].classList.contains('processed') && 
                (arr_tbody[tb].classList.contains('row1') || arr_tbody[tb].classList.contains('row2'))) 
            {
                let arr_main_events = arr_tbody[tb].querySelectorAll('tr.bk > td');
                if(arr_main_events === null) {
                    continue tbody;
                }



                let add_to_header = 0;
                mainEvents :
                for(let y = 0; y < arr_main_events.length; y++) {
                    let colspan = arr_main_events[y].colSpan;
                    add_to_header = add_to_header + colspan - 1;
                    let step_head = y + add_to_header;
                    let name_coloumn = searchInObject(obj_header, headers[step_head]);


                    // получаем дату игры
                    if(name_coloumn == 'date') {
                        x++;
                        result['games'][x] = {};
                        result['games'][x]['events'] = [];
                        result['games'][x]['test'] = [];

                        result['games'][x]['date'] = arr_main_events[y].innerHTML.split("<br>");
                        result['games'][x]['date'] = result['games'][x]['date'].join(' ');

                        let reg_date = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,2}[ \f\n\r\t\v][0-9]{1,2}:[0-9]{1,2}/;
                        let arr_date = reg_date.exec(result['games'][x]['date']);
                        if(arr_date != null) {
                            result['games'][x]['date'] = arr_date[0].split(" ");
                            // меняем дату
                            result['games'][x]['date'][0] = result['games'][x]['date'][0].split("/");
                            result['games'][x]['date'][0] = '20' + result['games'][x]['date'][0].reverse().join('-');
                            // формируем дату в формате timestamp
                            result['games'][x]['date'] = result['games'][x]['date'][0] + ' ' + result['games'][x]['date'][1] + ':00';
                        }
                    }

                    // получаем игроков
                    if(name_coloumn == 'players') {
                        result['games'][x]['players'] = {};
                        let obj_players = {};
                        let arr_players = arr_main_events[y].querySelector('a');
                        if(arr_players != null) {
                            arr_players = arr_players.innerHTML.split("<br>");
                        }
                        else {
                            arr_players = arr_main_events[y].innerHTML.split("<br>");
                        }

                        if(typeof arr_players != "undefined" && arr_players[0].trim() != '') {
                            obj_players[first_player] = arr_players[0].trim();
                        }
                        if(typeof arr_players != "undefined" && arr_players[1].trim() != '') {
                            obj_players[second_player] = arr_players[1].trim();
                        }

                        result['games'][x]['players'] = obj_players;

                        if(result['games'][x]['players'].hasOwnProperty(first_player) === false
                            || result['games'][x]['players'].hasOwnProperty(second_player) === false) {
                            result['games'][x] = {};
                            continue tbody;
                        }                        
                    }

                    if(name_coloumn != 'players' && name_coloumn != 'date' && name_coloumn != 'number')
                    {
                        // получаем главные игровые события фора, тотал, инд. тотал
                        result['games'][x]['events'] = searchTotalAndHand(name_coloumn, headers, y, step_head, arr_main_events, result['games'][x]['events']);

                        // получаем главные игровые события победы и ничьи
                        result['games'][x]['events'] = findMainEvent1(name_coloumn, headers[step_head], arr_main_events[y], result['games'][x]['events']);
                    }
                }

            } // <- PLAYERS

            // EVENTS -> если находим контейнер tbody.props
            if(arr_tbody[tb].classList.contains('props')) 
            {
                // перебираем строки tr
                for (let tr_element of arr_tbody[tb].children) {
                    // если строки tr.bk
                    if(tr_element.classList.contains('bk')) {
                        let arr_main_events1 = tr_element.querySelectorAll('td');
                                
                        if(arr_main_events1 != null) 
                        {
                            let add_to_header1 = 0;
                            for(let q = 0; q < arr_main_events1.length; q++) 
                            {
                                let colspan1 = arr_main_events1[q].colSpan;
                                add_to_header1 = add_to_header1 + colspan1 - 1;
                                let step_head1 = q + add_to_header1;
                                let name_col = searchInObject(obj_header, headers[step_head1]);
                                    
                                // получаем подстроку названия периода игры
                                if(name_col == 'players') {
                                    let str = arr_main_events1[q].textContent.trim();
                                    if(str != '') {
                                        str_event = str;
                                    }
                                }

                                if(name_col != 'players' && name_col != 'date' && name_col != 'number')
                                {
                                    // получаем по периодам главные игровые события фора, тотал, инд. тотал
                                    result['games'][x]['events'] = searchTotalAndHand(name_col, headers, q, step_head1, arr_main_events1, result['games'][x]['events'], str_event);

                                    // получаем по периодам главные игровые события победы и ничьи
                                    result['games'][x]['events'] = findMainEvent1(name_col, headers[step_head1], arr_main_events1[q], result['games'][x]['events'], str_event);
                                }

                            }
                        }
                    }
                    // если строки tr
                    else {
                        // перебираем элементы td
                        for (let td_element of tr_element.children) {
                            if(td_element.tagName === 'TD' && (td_element.classList.contains('dyn') || td_element.classList.contains('p2r'))) {
                                let str_td = td_element.textContent.trim();
                                result['games'][x]['events'] = createSecondaryEvents(str_td, result['games'][x]['events'], result['games'][x]['players']);
                            }
                            else {
                                let tablePs = td_element.querySelector('table.ps');
                                if(tablePs != null) {

                                    if(tablePs != "undefined" && tablePs != null) {
                                        let table_name = '';
                                        if(tablePs.querySelector('tr.btb > th') != null) {
                                            table_name = tablePs.querySelector('tr.btb > th').textContent.trim() + '.';
                                            table_name = table_name.replace(':.', '.');
                                        }

                                        result['games'][x]['events'] = serchEventsInTablePs(tablePs, result['games'][x]['events'], result['games'][x]['players'], table_name);
                                    }
                                }
                            }
                        }
                    }
                }
            } // <- EVENTS
        } 

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
                // console.log(return_obj);
                module.exports.saveResults(return_obj, param);
                findEPG(param.ru_src, param);
            }
            if(param.ru_src === return_obj['link_leage']) {
                console.log(color.succes, 'Сохранение русского файла', color.reset);
                console.log("=> " + link);
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
        console.log(color.error, 'ОШИБКА ПАРСИНГА СТРАНИЦЫ САЙТА ПАРИМАТЧ:', color.reset);
        console.log("=> " + link);
        console.log(e);
        module.exports.trigger = true;
    });
}