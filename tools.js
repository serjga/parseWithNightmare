// общие функции
module.exports = {
    getProxy: function () {
        let fs = require("fs");
        /*
        let obj = fs.readFileSync("proxy.txt", "utf8");
        obj = JSON.parse(obj);

        let num = getRandomInRange(0, obj.length);
        console.log(num);
        */

        return fs.readFile("proxy.txt", 'utf8', function(err, contents) {
            return contents;
        });

        // return fs.readFileSync("proxy.txt", "utf8");
    },
    getRandomInRange: function (min, max) {
    // whatever
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    findByName: function(containerClass, name)
    {
        let result = [];
        let c = document.getElementsByClassName(containerClass);
        if (!c) return null;
        let elements = c.getElementsByTagName(name);
        for (let i = 0; i < elements.length; i++)
        {
            // if (name == elements[i].name) return result.push();
            return result.push();
        }
        return result;
    },

    pushNewProxy: function(newArr, item)
    {
        let result = true;

        newArr.forEach(function(obj) {

            if(Array.isArray(item) == true) {
                if(module.exports.pushNewProxy(item, obj) != false) {
                    item.push(obj);
                }
            }
            else {
                if(obj.proxy == item.proxy) {
                    result = false;
                    return result;
                }
            }
        });
        return item;        
    },

    findFreeMarker: function(newArr)
    {
        for (let i = 0; i < newArr.length; i++)
        {

            if(newArr[i].marker == '') {
                newArr[i].marker = 'select';
                let k = newArr.length - i;
                return [newArr, k];
            }
        }
    },
    
    findFreeMarkerPageHref: function(newArr)
    {
        for (let i = 0; i < newArr.length; i++)
        {

            if(newArr[i].marker == '') {
                return newArr[i].href;
            }
        }
    },
    
    getMarathonDate: function(date)
    {
        const marathonDate = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];
        const baseDate = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        let arr = date.split(' ');
        let month = arr[1].toLowerCase();
        let obj = {};

        for (let i = 0; i < marathonDate.length; i++)
        {
            if(marathonDate[i] == month) {
                obj['date'] = arr[0] + '.' + baseDate[i];
            }
        }
        
        let timeKey = arr.indexOf(':');

        if(timeKey > -1) {
            obj['time'] = arr[timeKey];
        }

        return obj;
    },

    // функция поиска подходящего спорта на русском
    findSport: function(href, array)
    {
        for (let i = 0; i < array.length; i++)
        {
            let src = href.replace("/en/", "/su/");

            if(src === array[i]['sport_link']) {
                return array[i];
            }
        }
    },

    // функция поиска подходящей лиги на русском
    findLeage: function(href, array)
    {
        for (let i = 0; i < array.length; i++)
        {
            let src = href.replace("/en/", "/su/");

            if(src === array[i]['leage_link']) {
                return array[i]['leage_name'];
            }
        }
    },

    // функция поиска подходящей лиги на русском без опоры на спорт (перебор всего массива)
    findLeageInAllArr: function(href, array)
    {
        for (let i = 0; i < array.length; i++)
        {
            let leages = array[i]['leages'];

            for (let k = 0; k < leages.length; k++)
            {
                let src = href.replace("/en", "");

                if(src === leages[k]['leage_link']) {
                    return leages[k]['leage_name'];
                }
            }
        }
    },         
};