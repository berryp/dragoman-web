var express = require('express');
var app = express();
var fs = require('fs');
var po = require('node-po');
var config = require('./config').config;
var mongoProvider = require('./mongodb-provider');

var indexTemplate = fs.readFileSync(__dirname + '/app/index.html', 'utf8');

// Shortcut function to avoid entering the config information
// everytime you want to instanciate a provider.
function getProvider(name) {
  return new mongoProvider[name](
    config.mongo.host,
    config.mongo.port,
    config.mongo.db
  );
}

var catalogProvider = getProvider('CatalogProvider');
var messageProvider = getProvider('MessageProvider');

app.use(express.static(__dirname + '/app'));
app.use(express.bodyParser()); app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));
// app.use(function(req, res, next){
//   if (!isAuthenticated(req)) {
//     console.log('401');
//     res.statusCode = 401;
//   }
//   next();
// });


function authenticate(username, password, error, success) {
  if (username === 'berryp' && password === 'password') {
    success();
    return;
  }
  error();
}

function isAuthenticated(req) {
  return req.session.user !== undefined;
}

app.get('/', function (req, res) {
  res.send(indexTemplate);
});

app.get('/catalogs', function (req, res) {
  // List the catalogs.
  catalogProvider.findAll(function (error, docs) {
    res.json(docs);
  });
});

app.post('/catalogs', function (req, res) {
  // Create or save a new catalog.
  var catalog = {
    'id': req.body.id,
    'name': req.body.name,
    'description': req.body.description,
    'languages': {
      de: {name: 'German', meta: {}},
      ar: {name: 'Arabic', meta: {}}
    }
  };
  catalogProvider.save(catalog, function (error, catalogs) {
    res.send(catalogs);
  });
});

app.get('/catalogs/:catalogId', function (req, res) {
  catalogProvider.findOne({id: req.params.catalogId}, function (error, catalog) {
    res.send(catalog);
  });
});

app.post('/catalogs/:catalogId/import', function (req, res) {
  po.load(req.files.pofile.path, function (_po) {
    var catalogId = req.body.catalogId;
    var languageCode = req.body.languageCode;

    messageProvider.save(catalogId, languageCode, _po.items, function (error, messages) {
      res.send(messages);
    });
  });
});

app.get('/catalogs/:catalogId/messages/:languageCode', function (req, res) {
  console.log(req.path, req.params);
  messageProvider.findAll(req.params.catalogId, req.params.languageCode,
    function (error, messages) {
      res.send(messages);
    }
  );
});

app.get('/catalogs/:catalogId/messages/:languageCode/:msgid', function (req, res) {
  console.log(req.path, req.params);
  messageProvider.findOne(req.params.catalogId, req.params.languageCode, {msgid: req.params.msgid},
    function (error, message) {
      res.send(message);
    }
  );
});

app.post('/catalogs/:catalogId/messages/:languageCode/:msgid', function (req, res) {
  console.log(req.path, req.params);
  messageProvider.save(req.params.catalogId, req.params.languageCode, req.body, function (error, message) {
    res.send(message);
  });
});

// Start the app.
app.listen(3000);
console.log('Listening on port 3000');