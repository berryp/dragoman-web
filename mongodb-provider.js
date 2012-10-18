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

CatalogProvider.prototype.save = function (catalogs, callback) {
  this.getCollection(function(error, catalog_collection) {
    if (error) {
      callback(error);
      return;
    }

    if (typeof catalogs.length === "undefined") {
      catalogs = [catalogs];
    }

    for (var i = 0; i < catalogs.length; i++) {
      catalog = catalogs[i];
      catalog.languages = catalog.languages || [];
    }

    catalog_collection.insert(catalogs, function() {
      callback(null, catalogs);
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

MessageProvider.prototype.save = function (catalogId, languageCode, messages, callback) {
  this.getCollection(catalogId, languageCode, function(error, message_collection) {
    if (error) {
      callback(error);
      return;
    }

    if (typeof messages.length === "undefined") {
      messages = [messages];
    }

    message_collection.insert(messages, function() {
      callback(null, messages);
    });
  });
};

exports.CatalogProvider = CatalogProvider;
exports.MessageProvider = MessageProvider;