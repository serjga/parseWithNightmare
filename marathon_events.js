// общие функции
module.exports = {
    testPage: function () {
        let fs = require("fs");
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
    .goto('https://www.marathonbet.com/en/all-events.htm?cpcids=all')
    .evaluate(function() {

            let s = new XMLSerializer();
            let d = document;
            let str = s.serializeToString(d);

            return str;
    })
    .end()
    .then(function(result) {

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

            //let fs = require("fs");
            //fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_sports.txt", JSON.stringify(arraySports),  "ascii");
            //fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_leage.txt", JSON.stringify(arrayLeage),  "ascii");


    })
    .catch(function(e)  {
            console.log(e);
    });
    }
};