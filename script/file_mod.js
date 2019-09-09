"use strict";
module.exports = {
    saveNewItemsInFile : saveNewItemsInFile,
    makeEmptyFile : makeEmptyFile,
    saveInFile : saveInFile,
    readFile : readFile,
};

let fs = require("../node_modules/fs-extra");

// добавляем новые записи в файл
function saveNewItemsInFile(obj, file_dir) {

    let fileContent;
    if (fs.existsSync(file_dir)) {
        fileContent = fs.readFileSync(file_dir, {encoding : 'utf8'});
    }
    else {
        fileContent = '[]';
    }

    if( typeof fileContent === 'string' && fileContent.length < 2) {
        fileContent = [];
        fileContent.push(obj);
    }
    else {
        fileContent = JSON.parse(fileContent);
        if(Array.isArray(fileContent)) {
            fileContent.push(obj);
        }            
    }
    // console.log(fileContent);

    fs.writeFileSync(file_dir, JSON.stringify(fileContent),  {encoding : 'utf8'});
}

// формируем пустой файл
function makeEmptyFile(file_dir) {
    fs.writeFileSync(file_dir, '',  {encoding : 'utf8'});
}

// пишем данные в файл
function saveInFile(file_dir, content) {
    fs.writeFileSync(file_dir, JSON.stringify(content),  {encoding : 'utf8'});
}

// читаем файл
function readFile(file_dir) {
    let jsonString = fs.readFileSync(file_dir, {encoding : 'utf8'});
    return JSON.parse(jsonString);
}