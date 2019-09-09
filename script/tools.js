// общие функции
module.exports = {
    isEmpty : isEmpty,
    getDateFormateTimestamp: function () {
        let now = new Date();
        let date = now.getDate();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
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
    // функция создания массива уникальных событий
    createArrUniqueEvent: function(game_arr)
    {
        let result = [];
        if(isEmpty(game_arr)) {
            for (id_game in game_arr)
            {
                let game = game_arr[id_game];
                if(isEmpty(game) && game.hasOwnProperty('events') && Array.isArray(game['events'])) {
                    for (let k = 0; k < game['events'].length; k++)
                    {
                        let unique_marker = 0;
                        result.forEach(function(event, i) {
                            if(game['events'][k]['event_name'] === result[i]['event_name'] &&
                                game['events'][k]['event_result'] === result[i]['event_result']) {
                                unique_marker = 1;
                            }
                        });

                        if(unique_marker === 0) {
                            result.push({ 
                                event_name : game['events'][k]['event_name'], 
                                event_result : game['events'][k]['event_result']
                            });
                        }
                    }
                }
            }
        }

        return result;
    },
    // функция создания массива уникальных игроков
    createArrUniquePlayers: function(game_arr)
    {
        let result = [];
        if(isEmpty(game_arr)) {
            for (id_game in game_arr)
            {
                let game = game_arr[id_game];
                if(isEmpty(game) && game.hasOwnProperty('players')) {
                    let unique_first = 0;
                    let unique_second = 0;

                    if(result.indexOf(game['players']['first_player']) != -1) {
                        unique_first = 1;
                    }

                    if(result.indexOf(game['players']['second_player']) != -1) {
                        unique_second = 1;
                    }

                    if(unique_first === 0) {
                        result.push(game['players']['first_player']);
                    }

                    if(unique_second === 0) {
                        result.push(game['players']['second_player']);
                    }
                }
            }
        }
        return result;
    },

    // поиск элемента в объекте с возвратом ключа
    searchInObject: function(obj, val)
    {
        for (let key in obj) {
            if(obj[key] == val) {
                return key;
            }
        }
    },
};

function isEmpty(obj) {
    if(!JSON.stringify(obj)=='{}')
    {
        return false;
    }
    return true;
}