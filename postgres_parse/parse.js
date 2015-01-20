//node parse from excel to to postgres
var fs = require('fs');
var XLS = require('xlsjs');

function create_excel_files_arr(filePath) {
        var allFiles = fs.readdirSync(filePath);
        //remove any non excel files
        var onlyExcel = allFiles.filter(function(v){
            if (/(\.xls)$/.test(v)) {
                return v;
            }
        })
        return onlyExcel;
}

module.exports = {
    create_excel_files_arr: create_excel_files_arr
}