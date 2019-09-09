function parseSports(block) {
	let arr = [];
	let obj = {};
	arr = block.split("<table class=\"category-header\">");


	let getBlockId = arr[0].replace(" data-collapsible=\"", "");
	let sportID = getBlockId.split("\"");

	let sportParam = getBlockId.split("<a data-ellipsis=\"{}\" class=\"sport-category-label\" href=\" ");
	sportParam = sportParam[1].split("\">");
	let sportHref = sportParam[0];
	sportParam = sportParam[1].split("</a>");
	let sportName = sportParam[0];

	obj['uid'] = sportID[0];
	obj['name'] = sportName;
	obj['href'] = sportHref;

	return obj;
}

function parseLeages(block, uid) {
	let arr = [];
	let result = [];
	
	arr = block.split("<a class=\"category-label-link\" href=\"");

    arr.forEach(function(arrElement) {

        if(arrElement.search("<span class=\"nowrap\">") > -1) {
        	let obj = {};

			let arrHref = arrElement.split("\">");

			let arrName = arrElement.split("<h2 data-ellipsis=\"{}\" class=\"category-label\">");
			arrName = arrName[1].split("</h2>");

			let replaceBlock = arrName[0].replace( /<\/span>/g, "" );
			arrName = replaceBlock.split("<span class=\"nowrap\">");

			let name = '';
   			arrName.forEach(function(elementName) {
           		name = name + elementName + " ";
    		})

   			obj['uid'] = uid;
    		obj['name'] = name.replace(" ", "");
    		obj['href'] = arrHref[0].replace(" ", "");
    		result.push(obj);
    	}
    })

	return result;
}

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

            let fs = require("fs");
            fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_sports.txt", JSON.stringify(arraySports),  "ascii");
            fs.writeFileSync("../yii2-app-advanced/nightjs/marathon_leage.txt", JSON.stringify(arrayLeage),  "ascii");


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