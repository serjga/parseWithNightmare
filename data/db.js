// функции базы данных
module.exports = {
    // настройки базы данных
    param: function()
    {
        let obj = {};
        obj['host'] = '';
        obj['database'] = '';        
        obj['user'] = '';
        obj['password'] = '';

        return obj;
    },

    // получение соединения
    connect: function()
    {
        let mysql = require('mysql');
        let connection = mysql.createConnection({
            host: '',
            database: '',
            user: '',
            password: ''
        });

        return connection;
    },
};
