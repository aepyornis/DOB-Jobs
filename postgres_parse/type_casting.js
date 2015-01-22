var _ = require('underscore')
 
module.exports = function type_cast(field, i) {
    // var types_in_order = ['integer','integer',varchar(15),varchar(50),varchar(100),'integer','integer','integer',varchar(10),varchar(50),varchar(50),'date',varchar(20),char(3),'boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean','boolean', varchar(50), varchar(50),varchar(50),varchar(20),'date','date','date','date','date','date','money','money',varchar(10),'integer','integer','boolean','boolean','integer','integer','integer','integer','integer','integer','integer','integer','integer','integer',varchar(50),varchar(50),varchar(50),varchar(50),varchar(50),varchar(50),varchar(25),'boolean',varchar(50),varchar(75),varchar(50),varchar(50),varchar(25),'text',char(10)]
    var fields_in_order = ['job','doc','borough','house','streetName','block','lot','bin','jobType','jobStatus','jobStatusDescrp','latestActionDate','buildingType','CB','cluster','landmark','adultEstab','loftBoard','cityOwned','littleE','PCFiled','eFiling','plumbing','mechanical','boiler','fuelBurning','fuelStorage','standPipe','sprinkler','fireAlarm','equipment','fireSuppresion','curbCut','other','otherDescript','applicantName','applicantTitle', 'professionalLicense','professionalCert','preFilingDate','paidDate','fullyPaidDate','assignedDate','approvedDate','fullyPermitted','initialCost','totalEstFee','feeStatus','existZoningSqft','proposedZoningSqft','horizontalEnlrgmt','verticalEnlrgmt','enlrgmtSqft','streetFrontage','existStories','proposedStories','existHeight','proposedHeight','existDwellUnits','proposedDwellUnits','existOccupancy','proposedOccupany','siteFill','zoneDist1','zoneDist2','zoneDist3','zoneSpecial1','zoneSpecial2','ownerType','nonProfit','ownerName','ownerBusinessName','ownerHouseStreet','ownerCityStateZip','ownerPhone','jobDescription','bbl']
    var types = {
        job: 'integer',
        doc: 'integer',
        borough: varchar(15),
        house: varchar(50),
        streetName: varchar(100),
        block: 'integer',
        lot: 'integer',
        bin: 'integer',
        jobType: varchar(10),
        jobStatus: varchar(50),
        jobStatusDescrp: varchar(50),
        latestActionDate: 'date',
        buildingType: varchar(20),
        CB: char(3),
        cluster: 'boolean',
        landmark: 'boolean',
        adultEstab: 'boolean',
        loftBoard: 'boolean',
        cityOwned: 'boolean',
        littleE: 'boolean',
        PCFiled: 'boolean',
        eFiling: 'boolean',
        plumbing: 'boolean',
        mechanical: 'boolean',
        boiler: 'boolean',
        fuelBurning: 'boolean',
        fuelStorage: 'boolean',
        standPipe: 'boolean',
        sprinkler: 'boolean',
        fireAlarm: 'boolean',
        equipment: 'boolean',
        fireSuppresion: 'boolean',
        curbCut: 'boolean',
        other: 'boolean',
        otherDescript: varchar(50),
        applicantName: varchar(50),
        applicantTitle: varchar(50),
        professionalLicense: varchar(25),
        professionalCert: 'boolean',
        preFilingDate: 'date',
        paidDate: 'date',
        fullyPaidDate: 'date',
        assignedDate: 'date',
        approvedDate: 'date',
        fullyPermitted: 'date',
        initialCost: 'money',
        totalEstFee: 'money',
        feeStatus: varchar(10),
        existZoningSqft: 'integer',
        proposedZoningSqft: 'integer',
        horizontalEnlrgmt: 'boolean',
        verticalEnlrgmt: 'boolean',
        enlrgmtSqft: 'integer',
        streetFrontage: 'integer',
        existStories: 'integer',
        proposedStories: 'integer',
        existHeight: 'integer',
        proposedHeight: 'integer',
        existDwellUnits: 'integer',
        proposedDwellUnits: 'integer',
        existOccupancy: 'integer',
        proposedOccupany: 'integer',
        siteFill: varchar(50),
        zoneDist1: varchar(50),
        zoneDist2: varchar(50),
        zoneDist3: varchar(50),
        zoneSpecial1: varchar(50),
        zoneSpecial2: varchar(50),
        ownerType: varchar(25),
        nonProfit: 'boolean',
        ownerName: varchar(50),
        ownerBusinessName: varchar(75),
        ownerHouseStreet: varchar(50),
        ownerCityStateZip: varchar(50),
        ownerPhone: varchar(25),
        jobDescription: 'text',
        bbl: varchar(12)
    }
    //all possible types: integer, money, boolean, varchar(), char(), text, date, 
    
    var field_name = fields_in_order[i];
    var type = _.values(_.pick(types, field_name))[0]

    if (type === 'integer') {
        return parseInt(field);
    } else if (type === 'money') {
        return removesMoneySign(field);
    } else if (type === 'boolean') {
        if (field) {
            if (field === ' ') {
                return 'false';
            }
            return 'true';
        } else {
            return 'false';
        }
    } else if (type === 'date') {
        if (field) {
            if (field === '0' || field === '0.0') {
                return false;
            } else {
            return field.slice(0, 10);
            }
        }
        else {
            return false;
        }
    } else if (type === 'text') {
        return field;
    }  else if (typeof type === 'number') {
        if (field.length <= type) {
            return field;
        } else {
            return field.slice(0,type);
        }
    } else {
        return console.error('typcasting error - ' + field + ' - ' + i);
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
    function removeWhiteSpace(field) {
      if (typeof field === 'string') {
        return field.trim();
      } else {
        return field;
      }
    }
}





// function get_type(field, i) {

//     var type = types_in_order[i];

//     if (type === 'integer') {
//         return type;
//     } else if (type === 'money') {
//         return removesMoneySign(field);
//     } else if (type === 'boolean') {
//         if (field) {
//             return true;
//         } else {
//             return false;
//         }
//     } else if (type === 'date') {

//         if (field) {
//             if (field === '0') {
//                 return null;
//             } else {
//             return field.slice(0, 10);
//             }
//         }
//         else {
//             return null;
//         }
//     } else if (type === 'text') {
//         return field;
//     }  else if (typeof type === 'number') {
//         if (field.length <= type) {
//             return field;
//         } else {
//             return field.slice(0,type)
//         }
//     } else {
//         return console.error('typcasting error' + field + ',' + i);
//     }
// }







