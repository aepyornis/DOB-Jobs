var squel = require('squel');

/* OOP Inheritance mechanism (substitute your own favourite library for this!) */
Function.prototype.inheritsFrom = function( parentClassOrObject ) {
  this.prototype = new parentClassOrObject;
  this.prototype.constructor = this;
  this.prototype.parent = parentClassOrObject.prototype;
};

/* Create the 'command' clause */
 
var NullBlock = function() {};
NullBlock.inheritsFrom(squel.cls.Block);

/* this method will get exposed within the query builder */
NullBlock.prototype.nullOrder = function(order) {
  this._order = order;
};

NullBlock.prototype.buildStr = function() {
  if (this._order) {
    return 'NULLS ' + this._order;
  } else {
    return '';
  }
  
};

NullBlock.prototype.buildParam = function() {
  return {
    text: this.buildStr(),
    values: []
  }
}

var mySelect = function(options) {
  return squel.select(options, [
      new squel.cls.StringBlock(options, 'SELECT'),
      new squel.cls.DistinctBlock(options),
      new squel.cls.GetFieldBlock(options),
      new squel.cls.FromTableBlock(options),
      new squel.cls.JoinBlock(options),
      new squel.cls.WhereBlock(options),
      new squel.cls.GroupByBlock(options),
      new squel.cls.OrderByBlock(options),
      new NullBlock(),
      new squel.cls.LimitBlock(options),
      new squel.cls.OffsetBlock(options),
      new squel.cls.UnionBlock(options)
  ]);
};
// mySelect.inheritsFrom(squel.cls.QueryBuilder);

module.exports = function(options) {
  return new mySelect(options)
}

