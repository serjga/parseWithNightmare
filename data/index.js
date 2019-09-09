// экспорт функций работы с базами данных
module.exports = {
    writeLeagesInData : forEachSports,
    writeSportsInData : saveNewSport,
    writeEventsInData : forEachEvents,
    writePlayersInData : forEachPlayers,
    writeGamesInData : findAllEvents,
    updateInvalidLeage : updateInvalidLeage,
};

// функция перебора массива полученных данных о лигах с видами спорта
function forEachSports (arr_sports, id_site, today, table_name) {

    if(arr_sports instanceof Array && arr_sports !== 'undefined' && arr_sports.length > 0 ) {
   
        const db = require('./db');
        let connection = db.connect();

        let old_sports = arr_sports;  
        let sport = arr_sports.pop();

        // Создаётся объект findIdSport
        let findIdSport = new Promise((resolve, reject) => {

            let query = {
                text : "SELECT `id`, `en_name` FROM sports WHERE `site_id` = ? AND `en_name` = ?",
                placeholder_arr : [id_site, sport['sport_name']]
            };
                    
            return connection.query(query.text, query.placeholder_arr, function(err, rows, fields) {
                if (err) {
                    return reject(err);
                } 
                else {
                    let obj_result = {};
                    obj_result['items'] = sport;
                    obj_result['sport'] = rows;
                    obj_result['arr_sports'] = arr_sports;

                    return resolve(obj_result);
                }
            });
        });

        findIdSport
            .then(
                result => {
                    if(result.sport.length > 0) {
                        forEachLeage(result, result.sport[0].id, today, table_name);
                        return result.arr_sports;
                    }
                    else {
                        forEachSports(old_sports, id_site, today, table_name);
                    }
                },
                error => {
                    console.log("Ошибка получения данных эемента массива со спортом и лигами: ");
                    console.log(error);
                }
            )
            .then(
                result => {
                    forEachSports(result, id_site, today, table_name);
                }
            );
        connection.end();
    }
}

// поиск в базе данных лиги
// если да, то обновляем дату проверки,
// если нет, то добавляем лигу в базу
function forEachLeage(arr_leages, id_sport, today, table_name) {

    if(arr_leages.items.leages.length > 0) {

        let old_leages = arr_leages;

        const db = require('./db');
        let connection = db.connect();
        let leages = arr_leages.items.leages.pop();

        // Создаётся объект findSameLeage
        let findSameLeage = new Promise((resolve, reject) => {

            let query1 = {
                text : "SELECT `id`, `en_name` FROM " + table_name + " WHERE `sport_id` = ? AND `en_name` = ?",
                placeholder_arr : [id_sport, leages['leage_name']]
            };

            return connection.query(query1.text, query1.placeholder_arr, function(err, obj_leage, fields) {
                if (err) {
                    // connection1.end();
                    return reject(err);
                } 
                else {
                                
                    if(typeof obj_leage[0] === 'object' && obj_leage[0] !== null) {

                        let query2 = {
                            text : "UPDATE " + table_name + " SET update_at = ? WHERE id = ?",
                            placeholder_arr : [today, obj_leage[0].id]
                        };
                        return resolve(query2);
                    }
                    else {
                        let query2 = {
                            text : "INSERT INTO " + table_name + " SET ?",
                            placeholder_arr : [
                                {
                                    sport_id : id_sport,
                                    url : leages.leage_link,
                                    ru_name : leages.leage_name_ru, // здесь все правильно
                                    en_name : leages.leage_name,
                                    create_at : today,
                                    update_at : today,
                                    marker : 0
                                }
                            ]
                        };
                        return resolve(query2);
                    }
                }
            });
        }); 

        findSameLeage
            .then(
                result => {
                    sqlExtand(result);
                    forEachLeage(arr_leages, id_sport, today, table_name);
                },
                error => {
                    // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                    if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                        forEachLeage(old_leages, id_sport, today, table_name);
                    }
                    else {
                        console.log("Ошибка получения данных лиг для обработки: ");
                        console.log(error);
                    }
                }
            );
        connection.end();                    
    }
}

// функция выполнения sql-запроса к базе данных
function sqlExtand(query) {
    const db = require('./db');
    let connection = db.connect();

    connection.query(query.text, query.placeholder_arr, function(err, rows, fields) {
        if (err) {
            // если превышен лимит подключений к базе данных, запускаем функцию еще раз
            if(err.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                sqlExtand(query);
            }
            else {
                console.log('Ошибка при выполнении sql запроса: ' + query.text + ' ' + err);
            }
        } 
        else {
            console.log('SQL-запрос успешно выполнен: ');
        }
    }); 
    connection.end();
}

// перебираем полученные виды спорта и сохраняем новые в базу данных
function saveNewSport(sports, id_site) {
            
    // подключаем базу данных
    const db = require('./db');
    let connection = db.connect();

    // записываем новые виды спорта в базу данных
    sports.forEach(function(item, i, arr) {

    // Создаётся объект findSame
    let findSame = new Promise((resolve, reject) => {

        let query = {
            text : "SELECT `id`, `en_name` FROM sports WHERE `site_id` = ? AND `en_name` = ?",
            placeholder_arr : [id_site, item['en_name']]
        };

        return connection.query(query.text, query.placeholder_arr, function(err, rows, fields) {
            if (err) {
                return reject(err);
            } 
            else {
                console.log(rows);
                return resolve(rows);
            }
        });
    });

    findSame
        .then(
            result => {
                if(result.length < 1) {
                    let query2 = {
                        text : 'INSERT INTO sports SET ?',
                        placeholder_arr : item
                    };

                    let connection2 = db.connect();

                    connection2.query(query2.text, query2.placeholder_arr, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                        } 
                        else {
                            console.log("Новый спорт успешно добавлен в базу данных: ");
                            console.log(query2.placeholder_arr);
                            console.log(rows);
                        }
                        connection2.end();
                    });
                }
            },
            error => {
                console.log("Ошибка записи спорта в базу данных: ");
                console.log(error);
            }
        );
    });
    connection.end();
}

// поиск в базе данных игрового события
// если нет, то добавляем игровое событие в базу
function forEachEvents(arr_events, param) {

    if(arr_events.length > 0) {

        let old_events = arr_events;

        const db = require('./db');
        let connection = db.connect();
        let event = arr_events.pop();
        let result = 0;
        let coloumn_ru;
        let coloumn_en;

        if(param.coloumn === 'ru_name') {
            coloumn_ru = event['event_name'];
            coloumn_en = '';

            if(event['event_result'] === 'ДА') {
                result = 1;
            }
            else if(event['event_result'] === 'НЕТ') {
                result = 2;
            }            
        }
        else if(param.coloumn === 'en_name') {
            coloumn_ru = '';
            coloumn_en = event['event_name'];

            if(event['event_result'] === 'YES') {
                result = 1;
            }
            else if(event['event_result'] === 'NO') {
                result = 2;
            }  
        }

        // Создаётся объект findSameEvent
        let findSameEvent = new Promise((resolve, reject) => {

            if(result != 0) {
                let query1 = {
                    text : "SELECT `id` FROM " + param.table_events + " WHERE `sport_id` = ? AND `result` = ? AND `" + param.coloumn + "` = ?",
                    placeholder_arr : [param.id_sport, result, event['event_name']]
                };

                return connection.query(query1.text, query1.placeholder_arr, function(err, obj_event, fields) {
                    if (err) {
                        return reject(err);
                    } 
                    else {
                        let query2 = {};
                        if(obj_event.length === 0) {

                            query2 = {
                                text : "INSERT INTO " + param.table_events + " SET ?",
                                placeholder_arr : [
                                    {
                                        sport_id : param.id_sport,
                                        result: result,
                                        ru_name : coloumn_ru,
                                        en_name : coloumn_en,
                                    }
                                ]
                            };
                        }
                        return resolve(query2);
                    }
                });
            }
            else {
                forEachEvents(arr_events, param);
            }
        });

        findSameEvent
            .then(
                result => {
                    if (Object.keys(result).length != 0) {
                        sqlExtand(result);
                    }
                    else {
                        console.log('Событие уже было ранее сохранено в базу.');
                    }
                    forEachEvents(arr_events, param);
                },
                error => {
                    // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                    if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                        forEachEvents(old_events, param);
                    }
                    else {
                        console.log("forEachEvents :: Ошибка получения данных событий для обработки: ");
                        console.log(error);
                    }
                }
            );
        connection.end(); 
    }
}

// поиск в базе данных игроков
// если нет, то добавляем игрока в базу
function forEachPlayers(arr_players, param) {

    if(arr_players.length > 0) {

        let old_players = arr_players;

        const db = require('./db');
        let connection = db.connect();
        let player = arr_players.pop();
        let result = 0;
        let coloumn_ru;
        let coloumn_en;

        // Создаётся объект findSamePlayer
        let findSamePlayer = new Promise((resolve, reject) => {

            let query1 = {
                text : "SELECT `id` FROM " + param.table_players + " WHERE `sport_id` = ? AND `leage` = ? AND `en_name` = ?",
                placeholder_arr : [param.id_sport, param.id_leage, player]
            };

            return connection.query(query1.text, query1.placeholder_arr, function(err, obj_event, fields) {
                if (err) {
                    return reject(err);
                } 
                else {
                    let query2 = {};         
                    if(obj_event.length === 0) {

                        query2 = {
                            text : "INSERT INTO " + param.table_players + " SET ?",
                            placeholder_arr : [
                                {
                                    sport_id : param.id_sport,
                                    leage: param.id_leage,
                                    url : param.url,
                                    ru_name : '',
                                    en_name : player,
                                }
                            ]
                        };
                    }
                    return resolve(query2);
                }
            });
        });

        findSamePlayer
            .then(
                result => {
                    if (Object.keys(result).length != 0) {
                        sqlExtand(result);
                    }
                    else {
                        console.log('Игрок уже был ранее сохранен в базу.');
                    }
                    forEachPlayers(arr_players, param);
                },
                error => {
                    // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                    if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                        forEachPlayers(old_players, param);
                    }
                    else {
                        console.log("Ошибка получения данных игроков для обработки: ");
                        console.log(error);
                    }
                }
            );
        connection.end(); 
    }
}

// поиск событий в базе данных
function findAllEvents(arr_games, param) {

    const db = require('./db');
    const tools = require('../script/tools');
    let connection = db.connect();

    let findAllEvent = new Promise((resolve, reject) => {

        let query1 = {
            text : "SELECT * FROM " + param.table_events + " WHERE `sport_id` = ?",
            placeholder_arr : [param.id_sport]
        };

        return connection.query(query1.text, query1.placeholder_arr, function(err, arr_event, fields) {
            if (err) {
                return reject(err);
            } 
            else {
                return resolve(arr_event);
            }
        
        });
    });

    findAllEvent
    .then(
        result => {
            let games = [];
            if(tools.isEmpty(arr_games)) {
                for (id_game in arr_games)
                {
                    let game = arr_games[id_game];
                    games.push(game);
                }                
            }

            // console.log(games);

            return { games : games, arr_event : result };
        },
        error => {
            // если превышен лимит подключений к базе данных, запускаем функцию еще раз
            if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                findAllEvents(arr_games, param);
            }
            else {
                console.log("Ошибка получения всех событий: ");
                console.log(error);
            }
        }
    )
    .then(
        result => {
            // перебираем игры
            for (let i = result.arr_event.length - 1; i >= 0; i--) {

                if(param.coloumn === 'ru_name') {
                    if (result.arr_event[i].result === 1) {
                        result.arr_event[i]['result'] = 'ДА'
                    }
                    else if (result.arr_event[i].result === 2) {
                        result.arr_event[i]['result'] = 'НЕТ' 
                    }
                }
                else if(param.coloumn === 'en_name') {
                    if (result.arr_event[i].result === 1) {
                        result.arr_event[i]['result'] = 'YES'
                    }
                    else if (result.arr_event[i].result === 2) {
                        result.arr_event[i]['result'] = 'NO' 
                    }
                }
            }

            return result;
        },
        error => {
            console.log("Ошибка при переписывании массива игр: ");
            console.log(error);
        }
    )
    .then(
        result => {
            
            // перебираем игры
            for (let i = result.games.length - 1; i >= 0; i--) {
                let events = {};
                // console.log(result.games[i].events);
                // перебираем события игр
                for (let x = result.games[i].events.length - 1; x >= 0; x--) {
                    // перебираем список событий из базы данных
                    result.arr_event.forEach(function(item, n, arr) {
                        if(result.games[i].events[x]['event_name'] === item[param.coloumn]
                        && result.games[i].events[x]['event_result'] === item['result']) 
                        {
                            events[item['id']] = result.games[i].events[x]['kf'];
                        }
                    });
                }
                // переписываем события
                result.games[i]['events'] = JSON.stringify(events);
            }

            return result;
        },
        error => {
            console.log("Ошибка при формировании массива игр: ");
            console.log(error);
        }
    )
    .then(
        result => {
            let arr_games = result.games;
            forEachGames(arr_games, param);
            // console.log(result.games[0].events);
        },
        error => {
            console.log("findAllEvent : Ошибка в promise.");
            console.log(error);
        }
    );
    connection.end();
}

// поиск в базе данных игр
// если нет, то добавляем игру в базу
// если да, обновляем игру
function forEachGames(arr_games, param) {

    if(arr_games.length > 0) {

        let old_games = arr_games;

        const db = require('./db');
        let connection = db.connect();
        let game = arr_games.pop();

        // Создаётся объект findSameEvent
        let findSameEvent = new Promise((resolve, reject) => {

            let query1 = {
                text : "SELECT `id` FROM games WHERE `first_player` = ? AND `second_player` = ? AND `site` = ? AND `sport` = ? AND `leage` = ? AND `date_game` = ?",
                placeholder_arr : [game.players.first_player, game.players.second_player, param.id_site, param.id_sport, param.id_leage, game.date]
            };

            return connection.query(query1.text, query1.placeholder_arr, function(err, obj_game, fields) {
                if (err) {
                    // connection1.end();
                    return reject(err);
                } 
                else {
                    if(obj_game.length === 0) {

                        let query2 = {
                            text : "INSERT INTO games SET ?",
                            placeholder_arr : [
                                {
                                    first_player : game.players.first_player,
                                    second_player : game.players.second_player,
                                    site : param.id_site,
                                    sport : param.id_sport,
                                    leage : param.id_leage,
                                    url : param.url,
                                    create_at : param.today,
                                    update_at : param.today,
                                    date_game : game.date,
                                    events : game.events,
                                    marker : 0,
                                }
                            ]
                        };
                        return resolve(query2);
                    }
                    else {
                        let query2 = {
                            text : "UPDATE games SET update_at = ?, events = ? WHERE id = ?",
                            placeholder_arr : [param.today, game.events, obj_game[0].id]
                        };
                        return resolve(query2);
                    }
                }
            });
        });

        findSameEvent
            .then(
                result => {
                    sqlExtand(result);
                    forEachGames(arr_games, param);
                },
                error => {
                    // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                    if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                        forEachGames(old_games, param);
                    }
                    else {
                        console.log("Ошибка получения данных игроков для обработки: ");
                        console.log(error);
                    }
                }
            );
        connection.end(); 
    }
}

// обновление в базе данных ненужных лиг
function updateInvalidLeage(param) {

    if(typeof param === 'object') {

        const db = require('./db');
        let connection = db.connect();

        // Создаётся объект findLeage
        let findLeage = new Promise((resolve, reject) => {

            let query1 = {
                text : "SELECT `id` FROM " + param.table_leage + " WHERE `id` = ?",
                placeholder_arr : [param.id_leage]
            };

            return connection.query(query1.text, query1.placeholder_arr, function(err, obj_leage, fields) {
                if (err) {
                    return reject(err);
                } 
                else {
                    if(obj_leage.length != 0) {
                        let query2 = {
                            text : "UPDATE " + param.table_leage + " SET marker = ? WHERE id = ?",
                            placeholder_arr : [9, obj_leage[0].id]
                        };
                        return resolve(query2);
                    }
                }
            });
        });

        findLeage
            .then(
                result => {
                    console.log("Отбракована неактуальная лига:");
                    console.log("=> " + param.en_src);
                    sqlExtand(result);
                },
                error => {
                    // если превышен лимит подключений к базе данных, запускаем функцию еще раз
                    if(error.message.indexOf('ER_USER_LIMIT_REACHED') !== -1) {
                        updateInvalidLeage(param);
                    }
                    else {
                        console.log("Ошибка получения данных неактуальной лиги: ");
                        console.log(error);
                    }
                }
            );
        connection.end(); 
    }
}