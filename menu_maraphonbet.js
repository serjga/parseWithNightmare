"use strict";

const en_src = 'https://www.marathonbet.com/en/all-events.htm?cpcids=all';
const ru_src = 'https://www.marathonbet.com/su/all-events.htm?cpcids=all';
const id_site = 1;

function parseMenu(src) {
                
    const Nightmare = require('nightmare');    
                
    let nightmare = Nightmare({
        switches: {
            'proxy-server': '',
            'ignore-certificate-errors': true
        },
        show: true
    }); 
        
    nightmare
    .goto(src)
    .evaluate(function() {

        let sports_arr = [];
        let block = document.querySelectorAll('#allEventsContent .sport-category-container');

        for (let i = 0; i < block.length; i++)
        {
            let obj_sport = {};
            let sport = block[i].querySelector('.sport-category-header a.sport-category-label');

            // получаем название спорта и его ссылку
            obj_sport['sport_name'] = sport.textContent.trim();
            obj_sport['sport_link'] = sport.getAttribute('href').trim();

            // получаем лиги
            let arr_leage = block[i].querySelectorAll('.sport-category-content .category-container');
            let leages = [];

            for (let k = 0; k < arr_leage.length; k++)
            {
                let obj_leage = {};
                let leage = arr_leage[k].querySelector('table.category-header tbody > :first-child a');

                // получаем название лиги и её ссылку
                obj_leage['leage_name'] = leage.textContent.trim();
                obj_leage['leage_link'] = leage.getAttribute('href').trim();
                leages.push(obj_leage);
            }

            // получаем список лиг для спорта
            obj_sport['leages'] = leages;
            
            sports_arr.push(obj_sport);
        }

        let href = window.location.href;

        let results = {};

        results['href'] = href;
        results['result'] = sports_arr;

        return results;
    })
    .end()
    // записываем в файл

    .then(function(results) {

        // console.log(results);
        let fs = require("fs");
        
        if(results.href === en_src) {

            fs.writeFileSync("../yii2-app-advanced/parse/marathon_sports.txt", JSON.stringify(results.result),  "utf8");

            parseMenu(ru_src);
        }
        else {

            const tools = require('./tools');

            let jsonString = fs.readFileSync("../yii2-app-advanced/parse/marathon_sports.txt", "utf8");
            let en_arr = JSON.parse(jsonString);

            let sports = [];

            for (let b = 0; b < en_arr.length; b++)
            {
                // поиск русского названия для спорта
                let element = tools.findSport(en_arr[b]['sport_link'], results.result);
                en_arr[b]['sport_name_ru'] = element['sport_name'];

                // создаем новый объект для базы данных
                let obj_sports = {};
                obj_sports['ru_name'] = en_arr[b]['sport_name_ru'];
                obj_sports['en_name'] = en_arr[b]['sport_name'];
                obj_sports['site_id'] = id_site;

                sports.push(obj_sports);

                // поиск русского названия для лиги
                let leages_en = en_arr[b]['leages'];

                for (let l = 0; l < leages_en.length; l++)
                {
                    leages_en[l]['leage_name_ru'] = tools.findLeage(leages_en[l]['leage_link'], element['leages']);
                }

                en_arr[b]['leages'] = leages_en;
            }

            // запись в файл
            fs.writeFileSync("../yii2-app-advanced/parse/marathon_sports.txt", JSON.stringify(en_arr),  "utf8");

            results['result'] = en_arr;
            results['sports'] = sports;
        }
        return results;
    })

    // записываем в базу данных
    .then(function(results) {
        
        if(results.href != en_src) {
            let sports = results.sports;
            let newSports = [];
            // подключаем базу данных

            const db = require('./db');
            let connection = db.connect();

            // записываем новые виды спорта в базу данных
            results.sports.forEach(function(item, i, arr) {

                // Создаётся объект findSame
                let findSame = new Promise((resolve, reject) => {

                    let query = {
                        text : "SELECT `id`, `en_name` FROM sports WHERE `site_id` = '"+ id_site +"' AND `en_name` = ?",
                        placeholder_arr : [item['en_name']]
                    };

                    return connection.query(query.text, query.placeholder_arr, function(err, rows, fields) {
                        if (err) {
                            return reject(err);
                        } else {
                            newSports[i] = item;
                            // newSports[i]['id'] = rows.id;
                            console.log(rows);
                            return resolve(rows);
                        }
                    });

                });

                findSame
                .then(
                    result => {
                        if(result.length < 1) {
                            let query2 = {
                                text : 'INSERT INTO sports SET ?',
                                placeholder_arr : item
                            };

                            let connection2 = db.connect();

                            console.log(query2.placeholder_arr);

                            // первая функция-обработчик - запустится при вызове resolve
                            connection2.query(query2.text, query2.placeholder_arr, function(err, rows, fields) {
                                if (err) {
                                    console.log(err);
                                } 
                                else {
                                    console.log(rows); // result - аргумент resolve
                                }
                                connection2.end();
                            });
                        }
                    },
                    error => {
                        // вторая функция - запустится при вызове reject
                        console.log("Rejected: " + error); // error - аргумент reject
                    }
                );
            });
            connection.end();
        }

        return results; 
    })
    .then(function(results) {
        if(results.href != en_src) {
            let data_arr = [];
            // перебираем полученный результат
            results.result.forEach(function(item, i, arr) {
                let data_obj = {};

                // Создаётся объект findIdSport
                let findIdSport = new Promise((resolve, reject) => {

                    let query = {
                        text : "SELECT `id`, `en_name` FROM sports WHERE `site_id` = '"+ id_site +"' AND `en_name` = ?",
                        placeholder_arr : [item['en_name']]
                    };

                    return connection.query(query.text, query.placeholder_arr, function(err, rows, fields) {
                        if (err) {
                            return reject(err);
                        } 
                        else {
                            let obj_result = {};
                            obj_result['items'] = item;
                            obj_result['sport'] = rows;
                            return resolve(obj_result);
                        }
                    });

                });

                findIdSport
                .then(
                    result => {
                        let items = result.items;
                        let sport = result.sport;
                        if(sport.leages.length > 0) {
                            let query2 = {
                                text : 'INSERT INTO sports SET ?',
                                placeholder_arr : item
                            };

                            let connection2 = db.connect();

                            console.log(query2.placeholder_arr);

                            // первая функция-обработчик - запустится при вызове resolve
                            connection2.query(query2.text, query2.placeholder_arr, function(err, rows, fields) {
                                if (err) {
                                    console.log(err);
                                } 
                                else {
                                    console.log(rows); // result - аргумент resolve
                                }
                                connection2.end();
                            });
                        }
                    },
                    error => {
                        // вторая функция - запустится при вызове reject
                        console.log("Rejected: " + error); // error - аргумент reject
                    }
                );                

            });

            // console.log(results.result[0].leages);
            console.log(results.sports);
        }
    })   
    .catch(function(e)  {
        console.log(e);
    });
}

parseMenu(en_src);