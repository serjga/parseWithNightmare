function parseMenu(marker) {

    let promise = new Promise((resolve, reject) => {
        // const tools = require('./tools');
        let jsonString = [];

        if (marker == 1) {
            jsonString = "[{\"href\":\"/en/\",\"marker\":\"\",\"name\":\"Main\"}]";
            let fs = require("fs");
            fs.writeFileSync("../yii2-app-advanced/nightjs/parimatch_country.txt", JSON.stringify([]),  { encoding : 'utf8'});
            fs.writeFileSync("../yii2-app-advanced/nightjs/parimatch_leage.txt", JSON.stringify([]),  { encoding : 'utf8'});
        }
        else {
            let fileName; 
            if (marker == 2) {
                fileName = "../yii2-app-advanced/nightjs/parimatch_sports.txt";
            }
            else {
                fileName = "../yii2-app-advanced/nightjs/parimatch_country.txt";
            }
            let fs = require("fs");
            jsonString = fs.readFileSync(fileName, "utf8");             
        }

        console.log(marker);

        resolve(jsonString);   
    });

    promise
        .then(
            jsonString => {
//console.log(jsonString);
        // let obj = fs.readFileSync("proxy.txt", "utf8");
        let tools = require('./tools');
        let obj = JSON.parse(jsonString);
        let link = tools.findFreeMarkerPageHref(obj);
        /*
        let num = tools.getRandomInRange(0, obj.length);
        let port = obj[num].proxy;
        */
        // console.log(jsonString);
                
        const Nightmare = require('nightmare');    

        console.log(link);
                
        let nightmare = Nightmare({
            switches: {
                'proxy-server': '',
                'ignore-certificate-errors': true
            },
            show: true
        }); 
      
nightmare
    .goto('https://air.parimatch.com' + link)
    .wait(5000)
    .evaluate(function() 
    {
            let link = window.location;
            let search;
            if(link.pathname == '/en/') {
                search = 'a.sportbox-head__title_link';
            }
            else {
                if(link.pathname.indexOf("%7C") != -1) {
                    search = 'div.sportbox__content div.sportbox__content div.sportbox__content a.sportbox-item__title_link';
                }
                else {
                    search = 'div.sportbox__content div.sportbox__content a.sportbox-head__title_link';
                }
                // link = link.pathname.indexOf(":");
            }

            let result = [];
            let elements = document.querySelectorAll(search);

            for (let i = 0; i < elements.length; i++)
            {
                    let obj = {};
                    obj['name'] = elements[i].textContent;
                    obj['href'] = elements[i].getAttribute('href');
                    obj['marker'] = '';
                    result.push(obj);
            }
            return [result, link];
    })
    .end()
    .then(function(result) {

            let jsonString;
            let link = result[1];

            // console.log(result[0]);

            if(link.pathname != '/en/') {
                let fileName;
                // открываем ссылку с текущим обрабатываемым маркером
                if(link.pathname.indexOf("%7C") == -1) { // не нашли
                    fileName = "../yii2-app-advanced/nightjs/parimatch_sports.txt";
                }
                else {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_country.txt";
                }
                let fs = require("fs");
                jsonString = fs.readFileSync(fileName, "utf8"); 
            }

            return [result[0], jsonString, link]; 
    })
    .then(function(result) {

            let link = result[2];
            let lastMarker = [1, 2];

            if(link.pathname != '/en/') {

                let obj = JSON.parse(result[1]);
                console.log(obj);
                console.log(link.pathname.indexOf("%7C"));
                console.log(link.pathname);
                let tools = require('./tools');
                lastMarker = tools.findFreeMarker(obj);
            }

            return [result[0], lastMarker, link]; 
    })
    .then(function(result) {

            // перезаписываем файл с видами спорта, ставя маркер select
            let link = result[2];

            if(link.pathname != '/en/') {
                let fileName;
                // открываем ссылку с текущим обрабатываемым маркером
                if(link.pathname.indexOf("%7C") == -1) { // не нашли
                    fileName = "../yii2-app-advanced/nightjs/parimatch_sports.txt";
                }
                else {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_country.txt";
                }
                let fs = require("fs");
                fs.writeFileSync(fileName, JSON.stringify(result[1][0]),  { encoding : 'utf8'});
            }

            return [result[0], link, result[1][1]]; 
    })
    .then(function(result) {
            // открываем файл для добавления данных с сайта
            let link = result[1];
            let jsonString;

            console.log(result);

            if(link.pathname != '/en/') {
                let fileName;
                // открываем массив для добавления новых данных
                if(link.pathname.indexOf("%7C") == -1) {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_country.txt";
                }
                else {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_leage.txt";
                }
                let fs = require("fs");
                jsonString = fs.readFileSync(fileName, "utf8");
            }

            return [result[0], jsonString, link, result[2]]; 
    })
    .then(function(result) {
            
            let link = result[2];
            let obj = [];

            if(link.pathname != '/en/') {
                // объединяем массив из файла с массивом данных с сайта
                obj = JSON.parse(result[1]);
            }

            let newArr = obj.concat(result[0]);
            return [result[0], newArr, link, result[3]]; 
    })
    .then(function(result) {

            let link = result[2];
            let fileName;

            if(link.pathname == '/en/') {
                fileName = "../yii2-app-advanced/nightjs/parimatch_sports.txt";
            }            
            else {
                // открываем массив для добавления новых данных
                if(link.pathname.indexOf("%7C") == -1) {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_country.txt";
                }
                else {
                    fileName = "../yii2-app-advanced/nightjs/parimatch_leage.txt";
                }
            }
            // перезаписываем файл с результатами парсинга
            let fs = require("fs");
            fs.writeFileSync(fileName, JSON.stringify(result[1]),  { encoding : 'utf8'});            

            if(link.pathname == '/en/') {
                parseMenu(2);
            }            
            else {
                // если ссылки не относятся к 3 этапу И массив с сайта наполнен И не является крайним в списке ссылок
                if(link.pathname.indexOf("%7C") == -1 && result[0].length > 0 && result[3] != 1) {
                    parseMenu(2);
                }
                else if(link.pathname.indexOf("%7C") == -1 && result[0].length > 0 && result[3] == 1) {
                    parseMenu(3);
                }
                else if(link.pathname.indexOf("%7C") != -1 && result[0].length > 0 && result[3] != 1) {
                    parseMenu(3);
                }
            }
    })
    .catch(function(e)  {
     /*   
        if(e != '') {
            parseMenu();
        }
    */    
            console.log(e);
    });
        }
   );
}

parseMenu(3);