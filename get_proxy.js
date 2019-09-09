function parseProxy(page) {

    let promise = new Promise((resolve, reject) => {
        // const tools = require('./tools');
        let fs = require("fs");
        let jsonString = fs.readFileSync("../yii2-app-advanced/nightjs/proxy.txt", "utf8"); 
        // console.log(jsonString);

        resolve(jsonString);   
    });

    promise
        .then(
            jsonString => {

        let tools = require('./tools');
        /*
        let obj = JSON.parse(jsonString);

        let num = tools.getRandomInRange(0, obj.length);
        let port = obj[num].proxy + ':' + obj[num].port;
        console.log(port);
          */      
        const Nightmare = require('nightmare');    

        // console.log(num);
                
        let nightmare = Nightmare({
            switches: {
                'proxy-server': '',
                'ignore-certificate-errors': true
            },
            show: true
        }); 
        
nightmare
    .goto('https://hidemyna.me/ru/proxy-list/?start=' + page + '#list')
    // .goto('https://hidemyna.me/ru/proxy-list/#list')
    .wait(10000)
    .evaluate(function() {

        let result = [];
        let elements = document.querySelectorAll('.proxy__t tbody tr');

        for (let i = 0; i < elements.length; i++)
        {
            // if (name == elements[i].name) return result.push();
            //return result.push();
            let td = elements[i].getElementsByTagName('td');
            let timeSet = Number(td[3].textContent.replace('мс', '').replace(/\s+/g, ''));
            if(timeSet <= 1500) {
                let obj = {};
                obj['proxy'] = td[0].textContent;
                obj['port'] = td[1].textContent;
                obj['type'] = td[4].textContent;
                obj['timeset'] = timeSet;
                obj['anonime'] = td[5].textContent;
                obj['marker'] = '';

                result.push(obj);
            }
        }
        return result;
    })
    .end()
    .then(function(result) {

            // console.log(result);

            let fs = require("fs");
            // let tools = require('./tools');
            // let jsonString = ;
            return [result, fs.readFileSync("../yii2-app-advanced/nightjs/proxy.txt", "utf8")];
    })
    .then(function(result) {

            let fs = require("fs");
            let tools = require('./tools');

            // console.log(result);
// console.log(result[1]);
// let objRes = result[1];
            let obj = JSON.parse(result[1]);
            

            let newArray = tools.pushNewProxy(result[0], obj);
            fs.writeFileSync("../yii2-app-advanced/nightjs/proxy.txt", JSON.stringify(newArray), { encoding : 'utf8'});

            if(result[0].length > 0) {
                parseProxy(page + 64);
            }

    })
    .catch(function(e)  {
      /*  
        if(e != '') {
            parseProxy();
        }
       */ 
            console.log(e);
    });
        }
    );
}

    parseProxy(64);
  
/*
    for (let i = 1; i < 10; i++)
    {
        let page = i * 64;
        console.log(page);
        parseProxy(page);
    }
  */ 
