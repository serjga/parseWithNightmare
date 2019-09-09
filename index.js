const Nightmare = require('nightmare');
// const nightmare = Nightmare({show: true});
var listProxy = fs.readFileSync("hello.txt", "utf8");

while(true) {

let nightmare = Nightmare({
    switches: {
        'proxy-server': '198.27.67.35:3128',
        'ignore-certificate-errors': true
    },
    show: true
});
			

nightmare
    .goto('https://www.marathonbet.com/en/all-events.htm?cpcids=all')
    .evaluate(function() {

            // let searchResults = [];

            // const results =  document.querySelector("script");

            let s = new XMLSerializer();
 			let d = document;
 			let str = s.serializeToString(d);

	        return str;
    })
    .end()
    .then(function(result) {

   		let re = "<script type=\"text\/javascript\">";
   		let scriptBlock = result.split(re);
   		let marker = "reactData";
   		let findBlock;

   		console.log(scriptBlock.length);

        scriptBlock.forEach(function(block) {

       	    if(block.indexOf(marker) != -1) {
        		findBlock = block;
            }
        })

        scriptBlock = findBlock.split("reactData = ");
        scriptBlock = scriptBlock[1].split(";\n//]]&gt;&gt;\n</script>\n");

        scriptBlock = JSON.parse(scriptBlock[0]);

		let str = scriptBlock.prematchLeftPanel.regularMenu.childs;
    	console.log(str);

    	let fs = require("fs");
		fs.writeFileSync("../yii2-app-advanced/nightjs/txt.txt", result,  "ascii");

        if(result != '') {
            break;
        }            
    })
    .catch(function(e)  {
            console.log(e);
    });
}