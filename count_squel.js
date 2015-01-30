var squel = require('squel');

/* We create a convenience method to make it easy to instantiate our customized UPDATE builder */
/* OOP Inheritance mechanism (substitute your own favourite library for this!) */
Function.prototype.inheritsFrom = function( parentClassOrObject ) {
  this.prototype = new parentClassOrObject;
  this.prototype.constructor = this;
  this.prototype.parent = parentClassOrObject.prototype;
};
 
/* Create the text clause */
var textBlock = function() {};
textBlock.inheritsFrom(squel.cls.Block);
 
textBlock.prototype.text = function(p) {
  this._p = p;
};
textBlock.prototype.buildStr = function() {
  return this._p;
};
 
/* Create the 'PRAGMA' query builder */
var PragmaQuery = function(options) {
  this.parent.constructor.call(this, options, [
      new squel.cls.StringBlock(options, 'COUNT (*) as c'),
      new squel.cls.FromTableBlock,
      new squel.cls.WhereBlock,
      new textBlock(),

  ]);
};
PragmaQuery.inheritsFrom(squel.cls.QueryBuilder);

/* Create squel.pragma() convenience method */

module.exports = function(options) {
  return new PragmaQuery(options)
};
 
 