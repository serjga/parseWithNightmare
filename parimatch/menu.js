"use strict";
module.exports = {
    getSportLeage : getSportLeage,
};

const set = require('../setting');
let setObj = new set.Parimatch;

const en_src = setObj.menu_en_src;
const ru_src = setObj.menu_ru_src;

const file = set.dirFile + setObj.name + '/' + setObj.table_leage + '.txt';
const id_site = setObj.site_id;
const table_name = setObj.table_leage;
console.log(table_name);
const tools = require('../script/tools');
const today = tools.getDateFormateTimestamp();

const data = require('../data');
const file_mod = require('../script/file_mod');

function getSportLeage() {
    parseMenu(en_src);
}

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
    .wait(5000)
    .evaluate(function() {

        let result = [];
        let block = document.querySelectorAll('#lobbySportsHolder > li');

        for (let i = 0; i < block.length; i++)
        {
            let obj_sport = {};
            let sport = block[i].querySelector('a:first-child');

            // получаем название спорта и его ссылку
            obj_sport['sport_name'] = sport.textContent.trim();
            obj_sport['sport_link'] = sport.getAttribute('href').trim();

            // получаем лиги
            let arr_leage = block[i].querySelectorAll('ul > li > a');
            let leages = [];

            for (let k = 0; k < arr_leage.length; k++)
            {
                let obj_leage = {};

                // получаем название лиги и её ссылку
                obj_leage['leage_name'] = arr_leage[k].textContent.trim();
                obj_leage['leage_link'] = arr_leage[k].getAttribute('href').trim();
                leages.push(obj_leage);
            }

            // получаем список лиг для спорта
            obj_sport['leages'] = leages;
            
            result.push(obj_sport);                        
        }

        let href = window.location.href;

        let results = {};

        results['href'] = href;
        results['result'] = result;

        return results;
    })
    .end()
    .then(function(results) {
        
        if(results.href === en_src) {
            // пишем данные английской страницы в файл
            file_mod.saveInFile(file, results.result);
            parseMenu(ru_src);
        }
        else {
            // читаем объект из файла
            let en_arr = file_mod.readFile(file);
            let sports = [];

            for (let b = 0; b < en_arr.length; b++)
            {
                // поиск русского названия для лиги
                let leages_en = en_arr[b]['leages'];

                // создаем новый объект для базы данных
                let obj_sports = {};
                obj_sports['ru_name'] = en_arr[b]['sport_name_ru'];
                obj_sports['en_name'] = en_arr[b]['sport_name'];
                obj_sports['site_id'] = id_site;

                sports.push(obj_sports);                

                for (let l = 0; l < leages_en.length; l++)
                {
                    leages_en[l]['leage_name_ru'] = tools.findLeageInAllArr(leages_en[l]['leage_link'], results.result);
                }

                en_arr[b]['leages'] = leages_en;
            }

            // запись объекта в файл
            file_mod.saveInFile(file, en_arr);

            results['result'] = en_arr;
            results['sports'] = sports;
        }
        return results;
    })
    // записываем в базу данных
    .then(function(results) {
        
        if(results.href != en_src) {
            // перебираем полученые виды спорта и сохраняем новые в базу данных
            data.writeSportsInData(results.sports, id_site);
        }

        return results; 
    })
    .then(function(results) {
        if(results.href != en_src) {
            // перебираем массив полученных данных о лигах с видами спорта
            data.writeLeagesInData(results.result, id_site, today, table_name);
        }
    })
    .catch(function(e)  {
        console.log('ОШИБКА ВЫПОЛНЕНИЯ СКРИПТА :');
        console.log(e);
    });
}