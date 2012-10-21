var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var CatalogProvider = function (host, port, db) {
  this.db = new Db(db, new Server(host, port, {auto_reconnect: true}), {safe:true});
  this.db.open(function(){});
};

CatalogProvider.prototype.getCollection = function (callback) {
  this.db.collection('catalogs', function(error, catalog_collection) {
    if (error) {
      callback(error);
      return;
    }

    callback(null, catalog_collection);
  });
};

CatalogProvider.prototype.findAll = function (callback) {
  this.getCollection(function(error, catalog_collection) {
    if (error) {
      callback(error);
      return;
    }

    catalog_collection.find().toArray(function(error, results) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, results);
    });
  });
};

CatalogProvider.prototype.findOne = function (query, callback) {
  this.getCollection(function(error, catalog_collection) {
    if (error) {
      callback(error);
      return;
    }
    catalog_collection.findOne(query, function(error, result) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, result);
    });
  });
};

CatalogProvider.prototype.save = function (catalog, callback) {
  this.getCollection(function(error, catalog_collection) {
    if (error) {
      callback(error);
      return;
    }

    catalog._id = new ObjectID(catalog._id);
    catalog.languages = catalog.languages || [];

    catalog_collection.save(catalog, function() {
      callback(null, catalog);
    });
  });
};

var MessageProvider = function (host, port, db) {
  this.db = new Db(db, new Server(host, port, {auto_reconnect: true}), {safe:true});
  this.db.open(function(){});
};

MessageProvider.prototype.getCollection = function (catalogId, languageCode, callback) {
  this.db.collection(catalogId + '.' + languageCode, function(error, message_collection) {
    if (error) {
      callback(error);
      return;
    }
    callback(null, message_collection);
  });
};

MessageProvider.prototype.findAll = function (catalogId, languageCode, callback) {
  this.getCollection(catalogId, languageCode, function(error, message_collection) {
    if (error) {
      callback(error);
      return;
    }

    message_collection.find().toArray(function(error, results) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, results);
    });
  });
};

MessageProvider.prototype.findOne = function (catalogId, languageCode, query, callback) {
  this.getCollection(catalogId, languageCode, function(error, message_collection) {
    if (error) {
      callback(error);
      return;
    }

    message_collection.findOne(query, function(error, result) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, result);
    });
  });
};

MessageProvider.prototype.save = function (catalogId, languageCode, message, callback) {
  this.getCollection(catalogId, languageCode, function(error, message_collection) {
    if (error) {
      callback(error);
      return;
    }

    message._id = new ObjectID(message._id);

    message_collection.save(message, function() {
      callback(null, message);
    });
  });
};

exports.CatalogProvider = CatalogProvider;
exports.MessageProvider = MessageProvider;