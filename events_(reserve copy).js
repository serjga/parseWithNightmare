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
    .goto('https://air.parimatch.com/en/')
    .evaluate(function() {
        // открываем ссылки Пари Матч - 1 проход
        let link = window.location;
        let search_element = 'div.sportbox__content a.sportbox-head__title_link';

        let elements = document.querySelectorAll(search_element);

        for (let i = 0; i < elements.length; i++)
        {
            elements[i].click();
        }        
    })
    .wait(5000)
    .evaluate(function() {
        // открываем ссылки Пари Матч - 2 проход
        let link = window.location;
        let search_element = 'div.sportbox__content div.sportbox__content a.sportbox-head__title_link';

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
        let search_element = 'sportbox-head';
        let elements = document.querySelectorAll(search_element);
        

        if(elements instanceof Object ) {
            for (let i = 0; i < elements.length; i++)
            {
                // let container_element = elements[i].parent();
                let sport = elements[i].querySelector('div.sportbox-head__add a.sportbox-head__title_link');
                let obj_sport = {};
                    obj_sport['id'] = i;
                    obj_sport['sport'] = sport.textContent.trim();
                    obj_sport['href'] = sport.getAttribute('href').trim();
                    obj_sport['marker'] = '';

                

                let countries = elements[i].querySelectorAll('div.sportbox__content sportbox-category');

                if(countries instanceof Object ) {

                    let countries_arr = [];

                    for (let k = 0; k < countries.length; k++)
                    {
                        let country = countries[k].querySelector('div.sportbox-head_detailed div.sportbox-head__add a.sportbox-head__title_link');

                        let obj_country = {};
                        let name_country = country.textContent;
                        name_country = name_country.replace(/\n/g,"");

                        obj_country['cid'] = k;
                        obj_country['country_name'] = name_country.trim();
                        obj_country['href'] = country.getAttribute('href').trim();
                        obj_country['marker'] = '';

                        let leages = countries[k].querySelectorAll('div.sportbox__content sportbox-item');

                        if(leages instanceof Object ) {
                            let leages_arr = [];

                            for (let x = 0; x < leages.length; x++)
                            {
                                let leage = leages[x].querySelector('a.sportbox-item__title_link');
                                let obj_leage = {};

                                let name_leage = leage.textContent;
                                name_leage = name_leage.replace(/\n/g,"");

                                obj_leage['lid'] = x;
                                obj_leage['leage_name'] = name_leage.trim();
                                obj_leage['href'] = leage.getAttribute('href').trim();
                                obj_leage['marker'] = '';

                                leages_arr.push(obj_leage);
                            }

                            obj_country['leages'] = leages_arr;
                        }
                        countries_arr.push(obj_country);
                    }
                    obj_sport['country'] = countries_arr;
                }

                result.push(obj_sport);
            }
        }

        return result;       
    })
    .end()
    .then(function(result) {
        // console.log(result);

        let fs = require("fs");
        fs.writeFileSync("PariMatch_menu.txt", JSON.stringify(result), { encoding : 'utf8'});
    })
    .catch(function(e)  {
            console.log(e);
    });
}

 parseEventsMarathon();
// parseEventsPariMatch();