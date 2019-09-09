function findSameSport(search, massive) {
    let result = 0;
    for(let k = 0; k < massive.length; k++){
        if(massive[k].sport === search) {
            result = massive[k].leages;
        }          
    }
    return result;    
}

function findSameNameLeage(firstString, secondString, border) {
    let result = 0;

    let firstArray = firstString.split(border);
    let secondArray = secondString.split(border);

    for(let k = 0; k < firstArray.length; k++) {
        for(let i = 0; i < secondArray.length; i++) {
            let numDefis;
            let num;

            if (firstArray[k].search( / /i ) > -1 || secondArray[i].search( / /i ) > -1) {
                num = findSameNameLeage(firstArray[k], secondArray[i], ' ');
            }

            if(firstArray[k].toUpperCase() == secondArray[i].toUpperCase() || num > 2) {
                result++;
            }
        }          
    }
    return result;    
}

function findSameLeage(firstArray, secondArray) {
    let result = [];
    
    for(let k = 0; k < firstArray.length; k++) {
        let numFirst = 0;
        let obj = {};

        for(let i = 0; i < secondArray.length; i++) {

            let numFind = findSameNameLeage(firstArray[k].leage, secondArray[i].leage, '. ');

            if(numFind > numFirst) {
                numFirst = numFind;
                obj['nameMarathon'] = firstArray[k].leage;
                obj['marathon'] = firstArray[k].href;
                obj['nameParimatch'] = secondArray[i].leage;
                obj['parimatch'] = secondArray[i].href;
            }
        }
        if(numFirst > 1) {
            result.push(obj);  
        }
    }
    return result;    
}

function parseEventsMarathon() {
    let fs = require("fs");
    const Nightmare = require('nightmare');    
                
    let nightmare = Nightmare({
        switches: {
            'proxy-server': '',
            'ignore-certificate-errors': true
        },
        show: true
    });

    nightmare
    .goto('https://www.marathonbet.com/en/all-events.htm?cpcids=all')
    .evaluate(function() {
        // перебираем контейнеры с ссылками на Марафоне
        let search_element;

        search_element = 'div.sport-category-container';

        let result = [];

        let elements = document.querySelectorAll(search_element);

        if(elements instanceof Object ) {
            for (let i = 0; i < elements.length; i++)
            {
                let sport = elements[i].querySelector('div.sport-category-header a.sport-category-label');
                let obj_sport = {};
                    obj_sport['id'] = i;
                    obj_sport['sport'] = sport.textContent.replace(/\n/g,"").trim();
                    obj_sport['href'] = sport.getAttribute('href').trim();
                    obj_sport['marker'] = '';

                let leages_arr = [];

                let menu = elements[i].querySelectorAll('div.sport-category-content a.category-label-link');

                if(menu instanceof Object ) {
                    for (let k = 0; k < menu.length; k++)
                    {
                        let obj_menu = {};
                        let name_menu = menu[k].textContent;
                        name_menu = name_menu.replace(/\n/g,"");

                        obj_menu['lid'] = k;
                        obj_menu['leage'] = name_menu.trim();
                        obj_menu['href'] = menu[k].getAttribute('href').trim();
                        obj_menu['marker'] = '';
                        leages_arr.push(obj_menu);
                    }
                }

                obj_sport['leages'] = leages_arr;
                result.push(obj_sport);
            }
        }

        return result;
    })
    .end()
    .then(function(result) {
        //console.log(result[0]);

        let fs = require("fs");
        fs.writeFileSync("Marathon_menu.txt", JSON.stringify(result), { encoding : 'utf8'});

        if(result.length > 0) {
            parseEventsPariMatch();
        }
    })
    .catch(function(e)  {
            console.log(e);
    });
}

// ПАРИ МАТЧ
function parseEventsPariMatch() {
    let fs = require("fs");
    const Nightmare = require('nightmare');    
                
    let nightmare = Nightmare({
        switches: {
            'proxy-server': '',
            'ignore-certificate-errors': true
        },
        show: true
    });

    nightmare
    .goto('https://www.parimatch.com/en/')
    .evaluate(function() {
        // открываем ссылки Пари Матч - 1 проход
        let search_element = '#lobbySportsHolder > li > a';

        let elements = document.querySelectorAll(search_element);

        for (let i = 0; i < elements.length; i++)
        {
            elements[i].click();
        }        
    })
    .wait(5000)
    .evaluate(function() {
        // разбираем меню Пари Матч
        let result = [];

        let search_element = '#lobbySportsHolder > li';
        let elements = document.querySelectorAll(search_element);

        if(elements instanceof Object ) {
            for (let i = 0; i < elements.length; i++)
            {
                let sport = elements[i].querySelector('a');
                let obj_sport = {};
                    obj_sport['id'] = i;
                    obj_sport['sport'] = sport.textContent.replace(/\n/g,"").trim();
                    obj_sport['href'] = sport.getAttribute('href').trim();
                    obj_sport['marker'] = '';

                

                let menu = elements[i].querySelectorAll('ul.groups > li > a');

                if(menu instanceof Object ) {
                    let leages_arr = [];

                    for (let k = 0; k < menu.length; k++)
                    {
                        let obj_menu = {};
                        let name_menu = menu[k].textContent;
                        name_menu = name_menu.replace(/\n/g,"");

                        obj_menu['lid'] = k;
                        obj_menu['leage'] = name_menu.trim();
                        obj_menu['href'] = menu[k].getAttribute('href').trim();
                        obj_menu['marker'] = '';
                        leages_arr.push(obj_menu);
                    }

                    obj_sport['leages'] = leages_arr;
                    result.push(obj_sport);
                }
            }
        }
        return result;       
    })
    .end()
    .then(function(result) {
        // console.log(result[0]);

        let fs = require("fs");
        fs.writeFileSync("PariMatch_menu.txt", JSON.stringify(result), { encoding : 'utf8'});
    })
    .then(function() {
        let objReturn = {};

        let fs = require("fs");
        jsonMarathon = fs.readFileSync('Marathon_menu.txt', "utf8");
        jsonPariMatch = fs.readFileSync('PariMatch_menu.txt', "utf8");

        objReturn['marathon'] = jsonMarathon;
        objReturn['parimatch'] = jsonPariMatch;

        return objReturn;
    })
    .then(function(result) {
        let objReturn = [];
        

        let objMarathon = JSON.parse(result.marathon);
        let objPariMatch = JSON.parse(result.parimatch);

        for(let k = 0; k < objMarathon.length; k++) {
            let leages = [];
            leages_arr = findSameSport(objMarathon[k].sport, objPariMatch);

            if(leages_arr != 0) {
                leages = findSameLeage(objMarathon[k].leages, leages_arr);
            }

            if(leages.length > 0) {
                leages.push( { sport : objMarathon[k].sport } );
                objReturn.push(leages);
            }
        }
        console.log(objReturn);

        return objReturn;
    })
    .then(function(result) {
        let fs = require("fs");
        fs.writeFileSync("meet.txt", JSON.stringify(result), { encoding : 'utf8'});
    })
    .catch(function(e)  {
            console.log(e);
    });
}

parseEventsMarathon();
// parseEventsPariMatch();