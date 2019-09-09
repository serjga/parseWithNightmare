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

        console.log(results['href']);
        let fs = require("fs");
        
        if(results.href === 'https://www.parimatch.com/en/') {

            fs.writeFileSync("../yii2-app-advanced/parse/parimatch_sports.txt", JSON.stringify(results.result),  "utf8");

            parseMenu('https://www.parimatch.com/');
        }
        else {

            let jsonString = fs.readFileSync("../yii2-app-advanced/parse/parimatch_sports.txt", "utf8");
            let en_arr = JSON.parse(jsonString);

            const tools = require('./tools');

            for (let b = 0; b < en_arr.length; b++)
            {
                // поиск русского названия для лиги
                let leages_en = en_arr[b]['leages'];

                for (let l = 0; l < leages_en.length; l++)
                {
                    leages_en[l]['leage_name_ru'] = tools.findLeageInAllArr(leages_en[l]['leage_link'], results.result);
                }

                en_arr[b]['leages'] = leages_en;
            }

            console.log(en_arr[0]);
            fs.writeFileSync("../yii2-app-advanced/parse/parimatch_sports.txt", JSON.stringify(en_arr),  "utf8");
        }
    })
    .catch(function(e)  {
        console.log(e);
    });
}

parseMenu('https://www.parimatch.com/en/');