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
      
nightmare
    .goto('https://air.parimatch.com/en/')
    .wait(5000)
    .evaluate(function() {

            let result = [];
            let elements = document.querySelectorAll('a.sportbox-head__title_link');
            for (let i = 0; i < elements.length; i++)
            {
                let obj = {};
                obj['name'] = elements[i].textContent;
                obj['href'] = elements[i].getAttribute('href');
                obj['marker'] = '';
                result.push(obj);
            }

            return result;
    })
    .end()
    .then(function(result) {

            console.log(result);

            let fs = require("fs");
            fs.writeFileSync("../yii2-app-advanced/nightjs/parimatch_sports.txt", JSON.stringify(result),  "ascii");
/*           
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