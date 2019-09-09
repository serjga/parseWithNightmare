// функции базы данных
module.exports = {
    // настройки базы данных
    param: function()
    {
        let obj = {};
        obj['host'] = 'mysql.zzz.com.ua';
        obj['database'] = 'investor_zzz_com_ua';        
        obj['user'] = 'my_admin_bd';
        obj['password'] = 'pobedonosez';

        return obj;
    },

    // получение соединения
    connect: function()
    {
        let mysql = require('mysql');
        /*
        let obj = {};
        obj['host'] = 'mysql.zzz.com.ua';
        obj['database'] = 'investor_zzz_com_ua';        
        obj['user'] = 'my_admin_bd';
        obj['password'] = 'pobedonosez';
        */
        let connection = mysql.createConnection({
            host: 'mysql.zzz.com.ua',
            database: 'investor_zzz_com_ua',
            user: 'my_admin_bd',
            password: 'pobedonosez'
        });

        return connection;
    },
};