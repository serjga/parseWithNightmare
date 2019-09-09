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
            if(location.hostname === 'www.marathonbet.com') {
                let currentLocation = window.location;
                let downBlock;
                if(currentLocation.hostname === 'www.marathonbet.com') {
                    downBlock = '#footer';
                }
                else if(currentLocation.hostname === 'classic.parimatch.com') {
                    downBlock = '.footer';
                }


                document.querySelector(downBlock).scrollIntoView(top);
            }
        })
        .wait(3000);

        currentHeight = wind.evaluate(function() {
            currentHeight = 10;
            let location = window.location;  
            if(location.hostname === 'www.marathonbet.com') {
                let scrollHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );

                return scrollHeight;
            }
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

            // let but = elements[i].querySelectorAll('.member-area-button');
               
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
            const marathonDate = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];
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
        // ПАРИ МАТЧ
        else if(currentLocation.hostname === 'www.parimatch.com') {

            function getMainEvents(arrThTable, mainEvents, obj, period) {

                period = (period != '') ? ' ' + period + ' ' : '';
                let arrMainEvent = [];

                if(mainEvents != undefined && mainEvents != null && mainEvents.length > 0) {
                for(let q = 0; q < mainEvents.length; q++) 
                {
 
                    let step = (period != '') ? q+1 : q;
                    if(mainEvents[q] != undefined && mainEvents[q] != null) {
                    let contentEvent = mainEvents[q].textContent.trim();
                       
                    // фора
                    if(arrThTable[step] === 'Hand.' && contentEvent != '' && contentEvent != undefined) {
                        let hadicapEvents = mainEvents[q].querySelectorAll('b');
                        let hadicapKf = mainEvents[q+1].querySelectorAll('u a');

                        hadicapEvents.forEach(function(item, t) {
                            let objMainParamEvent = {};
                            objMainParamEvent['header'] = period + arrThTable[step];
                            let nameTeam;

                            switch (t) {
                                case 0:
                                    nameTeam = obj['firstTeam'];
                                    break;
                                case 1:
                                    nameTeam = obj['secondTeam'];
                                    break;
                            }

                            if(item != undefined && item != null && hadicapKf[t] != undefined && hadicapKf[t] != null) {
                                objMainParamEvent['event'] = nameTeam + " (" + item.textContent.trim() + ")";
                                objMainParamEvent['kf'] = hadicapKf[t].textContent.trim();
                                objMainParamEvent['header'] = objMainParamEvent['header'].trim();
                                objMainParamEvent = getStandartObject(objMainParamEvent);
                                arrMainEvent.push(objMainParamEvent);
                            }
                        });
                    }

                    // тотал
                    if(arrThTable[step] === 'Total' && contentEvent != '' && contentEvent != undefined) {
                        
                        if(mainEvents[q] != undefined && mainEvents[q] != null) {
                            if(mainEvents[q+1] != undefined && mainEvents[q+1] != null) {
                                let objTotalParamEvent = {};   
                                objTotalParamEvent['event'] = arrThTable[step+1];
                                objTotalParamEvent['header'] = period + arrThTable[step]  + " (" + mainEvents[q].textContent.trim() + ")";
                                objTotalParamEvent['header'] = objTotalParamEvent['header'].trim();
                                objTotalParamEvent['kf'] = mainEvents[q+1].textContent.trim();
                                objTotalParamEvent = getStandartObject(objTotalParamEvent);
                                arrMainEvent.push(objTotalParamEvent);
                            }
                            if(mainEvents[q+2] != undefined && mainEvents[q+2] != null) {
                                let objTotalOppParamEvent = {};
                                objTotalOppParamEvent['event'] = arrThTable[step+2];
                                objTotalOppParamEvent['header'] = period + arrThTable[step]   + " (" + mainEvents[q].textContent.trim() + ")";
                                objTotalOppParamEvent['header'] = objTotalOppParamEvent['header'].trim();
                                objTotalOppParamEvent['kf'] = mainEvents[q+2].textContent.trim();
                                objTotalOppParamEvent = getStandartObject(objTotalOppParamEvent);
                                arrMainEvent.push(objTotalOppParamEvent);
                            }
                        }
                    }

                    // индивидуальный тотал
                    if(arrThTable[step] === 'iTotal' && contentEvent != '' && contentEvent != undefined) {
                        let iTotalEvents = mainEvents[q].querySelectorAll('b');
                        let hadicapKf = mainEvents[q+1].querySelectorAll('u a');
                        let hadicapUndKf = mainEvents[q+2].querySelectorAll('u a');

                        iTotalEvents.forEach(function(item, t) {
                            let objMainiTotalParamEvent = {};
                            let nameTeam;

                            switch (t) {
                                case 0:
                                    nameTeam = obj['firstTeam'];
                                    break;
                                case 1:
                                    nameTeam = obj['secondTeam'];
                                    break;
                            }

                            if(item != undefined && item != null && hadicapKf[t] != undefined && hadicapKf[t] != null) {
                                objMainiTotalParamEvent['header'] = arrThTable[step] + " " + period  + nameTeam + " (" + item.textContent.trim() + ")";
                                objMainiTotalParamEvent['event'] = arrThTable[step+1];
                                objMainiTotalParamEvent['kf'] = hadicapKf[t].textContent.trim();
                                objMainiTotalParamEvent = getStandartObject(objMainiTotalParamEvent);
                                arrMainEvent.push(objMainiTotalParamEvent);
                            }
                        });

                        iTotalEvents.forEach(function(item, t) {
                            let objMainiTotalParamEvent = {};
                            let nameTeam;

                            switch (t) {
                                case 0:
                                    nameTeam = obj['firstTeam'];
                                    break;
                                case 1:
                                    nameTeam = obj['secondTeam'];
                                    break;
                            }

                            if(item != undefined && item != null && hadicapUndKf[t] != undefined && hadicapUndKf[t] != null) {
                                objMainiTotalParamEvent['header'] = arrThTable[step] + " " + period + nameTeam + " (" + item.textContent.trim() + ")";
                                objMainiTotalParamEvent['event'] = arrThTable[step+2];
                                objMainiTotalParamEvent['kf'] = hadicapUndKf[t].textContent.trim();
                                objMainiTotalParamEvent = getStandartObject(objMainiTotalParamEvent);
                                arrMainEvent.push(objMainiTotalParamEvent);
                            }
                        });
                    }

                    let objRes = {};
                    // победа1
                    if(arrThTable[step] === '1' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = obj['firstTeam'] + " win";
                        objRes['kf'] = contentEvent;
                    }

                    // победа2
                    if(arrThTable[step] === '2' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = obj['secondTeam'] + " win";
                        objRes['kf'] = contentEvent;
                    }

                    // ничья
                    if(arrThTable[step] === 'X' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = "Draw";
                        objRes['kf'] = contentEvent;
                    }

                    // победа или ничья 1X
                    if(arrThTable[step] === '1X' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = obj['firstTeam'] + " win or draw";
                        objRes['kf'] = contentEvent;
                    }

                    // победа или ничья 2X
                    if(arrThTable[step] === 'X2' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = obj['secondTeam'] + " win or draw";
                        objRes['kf'] = contentEvent;
                    }

                    // победа 1 или 2
                    if(arrThTable[step] === '12' && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = obj['firstTeam'] + " or " + obj['secondTeam'] + " win";
                        objRes['kf'] = contentEvent;
                    }

                    // счет 1:0 0:2 и прочие
                    if(arrThTable[step].indexOf(":") != -1 && contentEvent != '' && contentEvent != undefined) {
                        objRes['header'] = 'Result' + period;
                        objRes['event'] = arrThTable[step];
                        objRes['kf'] = contentEvent;
                    }

                    if(objRes.hasOwnProperty('header') && objRes.header != '' && 
                        objRes.hasOwnProperty('event') && objRes.event != '' && 
                        objRes.hasOwnProperty('kf') && objRes.kf != '') {
                        objRes['header'] = objRes['header'].trim();
                        objRes['event'] = objRes['event'].trim();
                        objRes = getStandartObject(objRes);
                        arrMainEvent.push(objRes);
                    } 
                    }                                                                       
                }
                }
                return arrMainEvent;
            }

            function getSubstringEvents(arrEventsTd, stringTd) {
                let numEvents = []; 
                // получаем подстроки событий   
                for(let m = 0; m < arrEventsTd.length; m++) 
                {
                    let elementArr = (typeof arrEventsTd[m] === 'string') ? arrEventsTd[m] : arrEventsTd[m].textContent.trim();
                    let newArr = stringTd.split(elementArr);
                    let arrEv = [];
                    if(arrEventsTd.length - m > 1) {
                        let elementNextArr = (typeof arrEventsTd[m+1] === 'string') ? arrEventsTd[m+1] : arrEventsTd[m+1].textContent.trim();
                        let events = newArr[1].split(elementNextArr);
                        arrEv = events[0].split(';');
                    }
                    else {
                        arrEv = newArr[1].split(';');
                    }
                    arrEv.pop();
                    numEvents.push(arrEv);
                }
                return numEvents;
            }

            function getArrKf(numEvents, uTdTrAddEvents) {
                let arrKf = [];
                let steps = 0;
                for(let b = 0; b < numEvents.length; b++) 
                {
                    let arrSubKf = [];
                    for(let a = 0; a < numEvents[b].length; a++) 
                    {
                        if(uTdTrAddEvents[steps] != undefined && uTdTrAddEvents[steps] != null) {
                            arrSubKf.push(uTdTrAddEvents[steps].textContent.trim());
                            steps++;
                        }
                        
                    }
                    arrKf.push(arrSubKf);
                }
                return arrKf;
            }

            // перерабатываем для читабельности элемент header в объекте
            function getCuteObject(objAddEvents, paramEvent) {
                if(objAddEvents['event'].indexOf(paramEvent) != -1 && objAddEvents['event'].toLowerCase() != paramEvent) {
                    let subStr = objAddEvents['event'].replace(paramEvent, '').trim();
                    objAddEvents['header'] = objAddEvents['header'] + ' ' + subStr;
                    objAddEvents['event'] = paramEvent;
                }
                return objAddEvents;
            }

            // функция получения событий из tr без класса
            function getAddEvents(tr, events, nameTable) {
                let resultBack = [];
                if(tr != undefined && tr != null) {

                    // проверяем строку на наличие таблицы table.ps
                    let table = tr.querySelectorAll('table.ps');
                                                        
                    // если внутри отсутствует таблица table.ps
                    if(table === undefined || table === null || table.length < 1) {
                        let iInTr = tr.querySelectorAll('i.p2r');
                        let iTr = tr.querySelectorAll('i');
                        let uInTr = tr.querySelectorAll('u');
                        let stringInTr = tr.textContent.trim();
                        let ip2r = tr.querySelectorAll('span.p2r');
                                    
                        if(stringInTr != undefined) {
                            let semiStr = '';
                            if(iInTr != undefined && iInTr.length < 1) {
                                iInTr = [nameTable];
                                semiStr = nameTable + stringInTr; 
                            }
                            else if(ip2r != undefined && ip2r.length > 0) {
                                iInTr = ip2r;
                                semiStr = nameTable + stringInTr;
                            }

                            if(semiStr != '') {
                                stringInTr = semiStr;
                            }
                        }
                        
                        if(stringInTr != undefined && iInTr.length > 0 && uInTr.length > 0) {

                            let re = new RegExp("[(][+-–]*[0-9]+[.][0-9]+[)]", "mg");
                            let arrEventsTd = stringInTr.match(re);
                            let singleI = '';

                            if(arrEventsTd != undefined && arrEventsTd.length > 0) {
                                iInTr = arrEventsTd;
                                if(iTr != undefined && iTr.length > 0) {
                                    singleI = nameTable + ' ' + iTr[0].textContent.trim() + ' ';
                                }
                            }

                            let numEvents = getSubstringEvents(iInTr, stringInTr);

                            // перебирая массив подстрок событий, формируем такой же массив коэфициентов
                            let arrKf = getArrKf(numEvents, uInTr);

                            // resultBack.push(arrKf);
                            let arrEventInTd = [];
                            for(let r = 0; r < iInTr.length; r++) 
                            {
                                for(let u = 0; u < arrKf[r].length; u++) 
                                {
                                    let objAddEvents = {};
                                    if(Array.isArray(iInTr) === true) {
                                        objAddEvents['header'] = iInTr[r];
                                    }
                                    else {
                                        objAddEvents['header'] = iInTr[r].textContent;
                                    }

                                    objAddEvents['header'] = singleI + objAddEvents['header'];
                                    objAddEvents['kf'] = arrKf[r][u];
                                    objAddEvents['event'] = numEvents[r][u].replace(new RegExp(objAddEvents.kf,'g'),'').trim();

                                    // приписываем имя таблице к событию (_._)
                                    let rei = new RegExp("^[(][0-9]+[.][0-9]+[)]+$", "mg");
                                    let arrRei = objAddEvents['header'].trim().match(rei);
                                    if(arrRei != undefined && arrRei.length > 0) {
                                        objAddEvents['header'] = nameTable + ' ' + objAddEvents['header'];
                                    }

                                    // делаем читабельным элемент header
                                    objAddEvents = getCuteObject(objAddEvents, 'over');
                                    objAddEvents = getCuteObject(objAddEvents, 'under');
                                    objAddEvents = getCuteObject(objAddEvents, 'yes');
                                    objAddEvents = getCuteObject(objAddEvents, 'no');
                                    objAddEvents = getCuteObject(objAddEvents, 'even');
                                    objAddEvents = getCuteObject(objAddEvents, 'odd');

                                    // стандартизируем элемент event
                                    objAddEvents = getStandartObject(objAddEvents);
                                    resultBack.push(objAddEvents);
                                }
                            }
                        }
                    }
                }
                return resultBack;
            }

            let games = document.querySelectorAll('div.wrapper tbody');
            let objEvent;
            let arrThTable;
            for(let i = 0; i < games.length; i++) 
            {
                let classTable = games[i].className.split(/\s+/);

                // Перебираем шапку с названием основных событий
                if(classTable.length == 1 && classTable[0] === 'processed') {
                    let thTable = games[i].querySelectorAll('th');

                    arrThTable = [];

                    for(let k = 0; k < thTable.length; k++) 
                    {
                        arrThTable.push(thTable[k].textContent.trim());
                    }
                }
                
                // перебираем строку с кф главных событий
                if(classTable.length == 2 && classTable[0].indexOf("row") != -1 && classTable[1] === 'processed') {

                    // перебираем главные события с датой, названием команд
                    let mainEvents = games[i].querySelectorAll('td');
                    let obj = {};
                    objEvent = {};
                    obj['events'] = [];
                    let objDate = {};
                    obj['numberEvent'] = mainEvents[0].textContent.trim();

                    objDate['date'] = mainEvents[1].textContent.trim().substring(0,5).replace('/','.');
                    objDate['time'] = mainEvents[1].textContent.trim().substring(5);
                    obj['dateGame'] = objDate;


                    // получаем названия команд
                    if(mainEvents[2].className === 'l') {
                        let teams = mainEvents[2].querySelectorAll('a');
                        let arrTeams; 
                        if(teams != undefined && teams != null && teams.length > 0) {
                            arrTeams = mainEvents[2].querySelector('a').innerHTML.split("<br>");
                        }
                        else {
                            arrTeams = mainEvents[2].innerHTML.split("<br>");
                        }
                       
                        obj['firstTeam'] = arrTeams[0];
                        obj['secondTeam'] = arrTeams[1];
                    }

                    // получаем главные события из 1 строки
                    obj['events'] = getMainEvents(arrThTable, mainEvents, obj, '');
                    // стандартизируем элемент event
                    objEvent = obj;
                    // result.push(objEvent);                                     
                }

                // перебираем дополнительные события начиная со 2 строки
                if(classTable.length > 0 && classTable[0].indexOf("row") != -1 && classTable[1] === 'props') {
                    let lastSave = result[result.length - 1];
                    
                    let trTable = games[i].querySelectorAll('tr');
                    let period;
                    let contentTh = '';

                    // перебираем строки
                    for(let s = 0; s < trTable.length; s++) 
                    {
                        let mainBkEvents = trTable[s].querySelectorAll('td');
                        let classTr = trTable[s].className;
                        // первые строки с классом bk
                        if(classTr === 'bk') {
                            if(mainBkEvents[1].textContent.trim() != '') {
                                period = mainBkEvents[1].textContent.trim();
                            }

                            let arrEvents = getMainEvents(arrThTable, mainBkEvents, objEvent, period);
                            objEvent.events = objEvent.events.concat(arrEvents);
                        }
                        // последующие строки tr без класса
                        else {
                            if(trTable[s] != undefined && trTable[s] != null) {
                                // получаем имя таблицы
                                let th = trTable[s].querySelector('td > table.ps > tbody > tr > th');
                                if(th != undefined && th != null) {
                                    contentTh = ' ' + th.textContent.trim();
                                }

                                // получаем события в каждом элементе tr
                                let arrEvents = getAddEvents(trTable[s], objEvent.events, contentTh);

                                if(arrEvents.length > 0) {
                                    objEvent.events = objEvent.events.concat(arrEvents);
                                }
                            }
                        }
                    }
                    // НЕ ТРОНЬ МЕНЯ
                    if(objEvent != null) {
                        result.push(objEvent);
                    }    
                }
            }
        }
        return result;
    })    
    .then(function(result) {
        console.log(result[0].events);
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