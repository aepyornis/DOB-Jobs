var squel = require('squel');

/* OOP Inheritance mechanism (substitute your own favourite library for this!) */
Function.prototype.inheritsFrom = function( parentClassOrObject ) {
  this.prototype = new parentClassOrObject;
  this.prototype.constructor = this;
  this.prototype.parent = parentClassOrObject.prototype;
};
 

var CountQuery = function(options) {
  this.parent.constructor.call(this, options, [
    new squel.cls.StringBlock(options, 'COUNT(*) as c'),
    new squel.cls.FromTableBlock(options),
    new squel.cls.WhereBlock
  ]);
};
CountQuery.inheritsFrom(squel.cls.QueryBuilder);

module.exports = function(options) {
  return new CountQuery(options)
}
