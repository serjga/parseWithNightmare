function findAllBets(link) {

    const Nightmare = require('nightmare'); 
      
    let nightmare = Nightmare({
        switches: {
            'proxy-server': '',
            'ignore-certificate-errors': true
        },
        show: true
    }); 

        
    let wind = nightmare
    .goto(link)
    .inject('js', '../../YII_advance/node-js/node_modules/jquery/dist/jquery.min.js');


    let previousHeight = 0;
    let currentHeight = 10;
    

    while(previousHeight != currentHeight) {
        previousHeight = currentHeight;

        wind.evaluate(function() {
            let location = window.location;  
            //if(location.hostname === 'www.marathonbet.com') {
                let currentLocation = window.location;
                let downBlock;
                if(currentLocation.hostname === 'www.marathonbet.com') {
                    downBlock = '#footer';
                }
                else if(currentLocation.hostname === 'classic.parimatch.com') {
                    downBlock = '.footer';
                }


                document.querySelector(downBlock).scrollIntoView(top);
            //}
        })
        .wait(3000);

        currentHeight = wind.evaluate(function() {
            currentHeight = 10;
            let location = window.location;  
            // if(location.hostname === 'www.marathonbet.com') {
                let scrollHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );

                return scrollHeight;
            // }
        });
    }

  
    wind.evaluate(function() {
        let currentLocation = window.location;
        // Марафон   
        if(currentLocation.hostname === 'www.marathonbet.com') {
        let elements = document.querySelectorAll('div.coupon-row');
                 
            for (let i = 0; i < elements.length; i++)
            {
                if(elements.length > 0) {
                    let but = elements[i].querySelectorAll('.member-area-button');
                    but[1].click(); 
                }
            }
        }
    })
    .wait(5000)
    .evaluate(function() {
        let currentLocation = window.location;
        // Марафон  
        if(currentLocation.hostname === 'www.marathonbet.com') {    
        let result = [];

        let elements = document.querySelectorAll('div.details-description table.table-shortcuts-menu td');
        for (let i = 0; i < elements.length; i++)
        {
            let allMrkets = elements[i].textContent.replace(/\n/g,"").trim();
            if(allMrkets === 'All Markets') {
                elements[i].click();
            }
        }

        return result;
        }
    })
    wind
    .end()
    .evaluate(function() {
        let currentLocation = window.location;
        let result = [];
        let returnObj = {};

            // функция стандартизации элемента event в объекте
            function getStandartObject(objAddEvents) {
                let arrStandart = ['over', 'under', 'yes', 'no', 'even', 'odd'];
                if(arrStandart.indexOf(objAddEvents['event'].toLowerCase()) === -1) {
                    objAddEvents['header'] = objAddEvents['header'] + ' ' + objAddEvents['event'];
                    objAddEvents['event'] = 'yes';
                }
                if(objAddEvents['event'] != undefined && objAddEvents['event'] != null) {
                    objAddEvents['event'] = objAddEvents['event'].toLowerCase().trim();
                }
                
                objAddEvents['header'] = objAddEvents['header'].trim();
                return objAddEvents;
            }

        // МАРАФОН   
        if(currentLocation.hostname === 'www.marathonbet.com') {
            let url = currentLocation.pathname;
            // ищем блоки с играми
            let games = document.querySelectorAll('div.coupon-row');
            for (let x = 0; x < games.length; x++)
            {
            let obj = {};
            // ищем блок с названием и датой игры
            let items = games[x].querySelectorAll('table.coupon-row-item');
            let item = items[0];
            item = item.querySelector('table.member-area-content-table');

            // получение даты игры
            let date = item.querySelector('td.date').textContent.replace(/\n/g,"").trim();

            if(currentLocation.pathname.search( /en/i ) == '1') {
                const marathonDate = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            }
           // else if(url.search( /su/i ) != -1) {
               // const marathonDate = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
           // }

            const baseDate = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            
            let objDate = {};
            let now = new Date();
            let blockTeams = 'td';

            let arr = date.split(' ');
            if(arr.length === 1) {
                // сегодняшние игры + дата
                objDate['date'] = now.getDate() + '.' + baseDate[now.getMonth()];
                blockTeams = 'td.today-name'; 
            }
            else if(arr.length > 1) {
                // игры не сегодня + дата
                let month = arr[1].toLowerCase();

                for (let i = 0; i < marathonDate.length; i++)
                {
                    if(marathonDate[i] == month) {
                        objDate['date'] = arr[0] + '.' + baseDate[i];
                    }
                }
        
                let timeKey = arr.indexOf(':');

                if(timeKey != -1) {
                    objDate['time'] = arr[timeKey];
                }
                blockTeams = 'td.name';
            }

            // получаем время по индефикатору ":"
            arr.forEach(function(item, i) {
                if(arr[i].indexOf(':') != -1) {
                    objDate['time'] = arr[i];
                }
            });

            obj['dateGame'] = objDate;

            // получаем название команд
            let teams = item.querySelectorAll(blockTeams);
            for (let k = 0; k < teams.length; k++)
            {
                let nameTeam = teams[k].querySelector('a.member-link').textContent.replace(/\n/g,"").trim();
                obj['hrefGame'] = teams[k].querySelector('a.member-link').getAttribute('href');
                let numberTeam = teams[k].querySelector('b.member-number').textContent.replace(/\n/g,"").trim();

                if(numberTeam === '1.') {
                    obj['firstTeam'] = nameTeam;
                }
                else if(numberTeam === '2.') {
                    obj['secondTeam'] = nameTeam;
                }
            }

            // получаем события игры
            let arrEvents = [];
            let wrapper = games[x].querySelectorAll('div.block-market-table-wrapper div.market-inline-block-table-wrapper');
            for (let y = 0; y < wrapper.length; y++)
            {
                let event = wrapper[y].querySelectorAll('td.height-column-with-price');

                for(let z = 0; z < event.length; z++) 
                {
                    let strEvent = event[z].dataset.sel;
                    if (typeof strEvent !== typeof undefined && strEvent !== false) {
                    let objEvent = JSON.parse(strEvent);

                    let objParamEvent = {};
                    objParamEvent['header'] = objEvent.mn;
                    objParamEvent['event'] = objEvent.sn;
                    objParamEvent['kf'] = objEvent.epr;
                    objParamEvent = getStandartObject(objParamEvent);
                    arrEvents.push(objParamEvent);
                    }
                }
            }

            obj['events'] = arrEvents;
            result.push(obj);
            }
        }

        returnObj['events'] = result;
        returnObj['url'] = currentLocation.pathname;
        return returnObj;
    })    
    .then(function(returnObj) {

        let result = returnObj['events'];
        console.log(result[0].events);
        console.log(returnObj['url'].search( /su/i ));

        let fs = require("fs");
        fs.writeFileSync("../yii2-app-advanced/parse/marathonbet_players_and_events.txt", JSON.stringify(result),  "utf8");

        findAllBets('https://www.marathonbet.com/en/betting/Football/Internationals/UEFA+Nations+League/League+A/Final+Stage/Portugal/Play-Offs/Semi+Final/');
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

findAllBets('https://www.marathonbet.com/en/betting/Football/Internationals/UEFA+Nations+League/League+A/Final+Stage/Portugal/Play-Offs/Semi+Final/');