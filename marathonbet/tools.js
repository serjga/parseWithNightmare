// функции-инструменты Марафон
module.exports = {
    createRuUrl : createRuUrl,
};

// создаем русскую ссылку
function createRuUrl(leage, param) {
    return param.site_url + leage.url.replace('/en/','/su/');
}