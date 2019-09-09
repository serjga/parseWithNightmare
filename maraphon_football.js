function parseMenu() {

    let promise = new Promise((resolve, reject) => {
        // const tools = require('./tools');
        let fs = require("fs");

        let jsonString = fs.readFileSync("proxy.txt", "utf8"); 
        // console.log(jsonString);

        resolve(jsonString);   
    });

    promise
        .then(
            jsonString => {

        // let obj = fs.readFileSync("proxy.txt", "utf8");
        let tools = require('./tools');
        let obj = JSON.parse(jsonString);

        let num = tools.getRandomInRange(0, obj.length);
        let port = obj[num].proxy;
        // console.log(jsonString);
                
        const Nightmare = require('nightmare'); 
        
        console.log(num);
                
        let nightmare = Nightmare({
            switches: {
                'proxy-server': '',
                'ignore-certificate-errors': true
            },
            show: true
        }); 

        
let wind = nightmare
    .goto('https://www.marathonbet.com/su/betting/Football/')
    .inject('js', '../../YII_advance/node-js/node_modules/jquery/dist/jquery.min.js');    

    let previousHeight = 0;
    let currentHeight = 10;
    while(previousHeight != currentHeight) {
        previousHeight = currentHeight;

        wind.evaluate(function() {
            document.querySelector('#footer').scrollIntoView(top);
        })
        .wait(3000);

        currentHeight = wind.evaluate(function() {

            let scrollHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );

            return scrollHeight;
        });
    }
 wind.evaluate(function() {

                let elements = document.querySelectorAll('div.coupon-row');

                function second_passed(start, stop) {

                    let elements = document.querySelectorAll('div.coupon-row');
                 
                    for (let i = start; i < stop; i++)
                    {
                        if(elements.length > stop) {
                            let but = elements[i].querySelectorAll('.member-area-button');
                            but[1].click(); 
                        }
                        
                    }
                }

                let interval = elements.length / 10;
                interval = Math.floor(interval) + 1;

                for (let i = 0; i < interval; i++)
                {
                    let start = i * 10;
                    let stop = start + 10;

                    setTimeout(second_passed(start, stop), 5000); 
                }
            })
 .wait(5000);


wind
    .evaluate(function() {
            
            let result = [];

            let elements = document.querySelectorAll('div.coupon-row');
            for (let i = 0; i < elements.length; i++)
            {
                
               
                let but = elements[i].querySelectorAll('.member-area-button');
               
                let obj = {};
                obj['name'] = but[1].textContent;
                result.push(obj);
            }

            return result;
    })
    
    .then(function(result) {

        console.log(result);
/*
            let re = "<div id=\"allEventsContent\">";
            let allEvents = result.split(re);
            allEvents = allEvents[1].split("<div id=\"body_footer\">");
            allEvents = allEvents[0].split("class=\"sport-category-container\"");

            let findBlock;

            //findBlock = parseSports(allEvents[1]);
            // findLeage = parseLeages(allEvents[1]);

            

            let arraySports = [];
            let arrayLeage = [];

            allEvents.forEach(function(block) {

                if(block.search("class=\"sport-category-label\"") != -1) {
                    let objSport = parseSports(block);
                    arraySports.push(objSport); 

                    arrayLeage = arrayLeage.concat(parseLeages(block, objSport.uid));
                }
            })

            console.log(arrayLeage);

            let fs = require("fs");
            fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_sports.txt", JSON.stringify(arraySports),  "ascii");
            fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_leage.txt", JSON.stringify(arrayLeage),  "ascii");
*/

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

parseMenu();