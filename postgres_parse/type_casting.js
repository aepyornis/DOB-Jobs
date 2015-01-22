// var _ = require('underscore')
var types_in_order = ['integer','integer',varchar(15),varchar(50),varchar(100),'integer','integer','integer',varchar(10),varchar(50),varchar(50),'date',varchar(20),char(3),'boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean', varchar(50), varchar(50),varchar(50),varchar(20),'date','date','date','date','date','date','money','money',varchar(10),'integer','integer','boolean','boolean','integer','integer','integer','integer','integer','integer','integer','integer','integer','integer',varchar(50),varchar(50),varchar(50),varchar(50),varchar(50),varchar(50),varchar(25),'boolean',varchar(50),varchar(75),varchar(50),varchar(50),varchar(25),'text',char(10)]
    
module.exports = function type_cast(field, i) {
    //all possible types: integer, money, boolean, varchar(), char(), text, date, 
    var type = types_in_order[i];

    if (type === 'integer') {
        return parseInt(field);
    } else if (type === 'money') {
        return removesMoneySign(field);
    } else if (type === 'boolean') {
        if (field) {
            return true;
        } else {
            return false;
        }
    } else if (type === 'date') {

        if (field) {
            if (field === '0') {
                return null;
            } else {
            return field.slice(0, 10);
            }
        }
        else {
            return null;
        }
    } else if (type === 'text') {
        return field;
    }  else if (typeof type === 'number') {
        if (field.length <= type) {
            return field;
        } else {
            return field.slice(0,type)
        }
    } else {
        return console.error('typcasting error' + field + ',' + i);
    }


    function varchar(chars) {
        return chars;
    }
    function char(chars) {
        return chars;
    }
    function removesMoneySign(money) {
          if (money === 0 || money === '0') {
            return 0;
          } else if (typeof money === 'number') {
            return money;
          } else if (typeof money === 'string') {
            return money.replace('$', '');
          } else {
            console.log('the money is not a string or a number');
            return 'undefined';
          }
    }
}


function get_type(i) {



}