var ArgumentParser = argparse = require('argparse').ArgumentParser;
var express = require('express');
var app = express();
var fs = require('fs');
var po = require('node-po');
var Config = require('./config').Config;
var mongoProvider = require('./mongodb-provider');

var indexTemplate = fs.readFileSync(__dirname + '/app/index.html', 'utf8');

var parser = new ArgumentParser();
parser.addArgument(['-p', '--port']);
parser.addArgument(['-c', '--config']);

var args = parser.parseArgs();
var config = new Config(args);


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

app.get('/api/applications', function (req, res) {
  // List the catalogs.
  catalogProvider.findAll(function (error, docs) {
    res.json(docs);
  });
});

app.post('/api/applications', function (req, res) {
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

app.get('/api/applications/:applicationId', function (req, res) {
  catalogProvider.findOne({id: req.params.applicationId}, function (error, catalog) {
    res.send(catalog);
  });
});

app.post('/api/applications/:applicationId/import', function (req, res) {
  po.load(req.files.pofile.path, function (_po) {
    var applicationId = req.body.applicationId;
    var languageCode = req.body.languageCode;

    messageProvider.save(applicationId, languageCode, _po.items, function (error, messages) {
      res.send(messages);
    });
  });
});

app.get('/api/applications/:applicationId/:languageCode', function (req, res) {
  messageProvider.findAll(req.params.applicationId, req.params.languageCode,
    function (error, messages) {
      res.send(messages);
    }
  );
});

app.get('/api/applications/:applicationId/messages/:languageCode/:msgid', function (req, res) {
  messageProvider.findOne(req.params.applicationId, req.params.languageCode, {msgid: req.params.msgid},
    function (error, message) {
      res.send(message);
    }
  );
});

app.post('/api/applications/:applicationId/messages/:languageCode/:msgid', function (req, res) {
  messageProvider.save(req.params.applicationId, req.params.languageCode, req.body, function (error, message) {
    res.send(message);
  });
});

// Start the app.
var port = args.port || 3000;
app.listen(port);
console.log('Listening on port', port);