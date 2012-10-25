var fs = require('fs');
var yaml = require('js-yaml');
var config = {};

// Defaults for local development.
var config_file = process.env.APP_SETTINGS_YAML || './devel.yaml';

var Config = function (args) {
    if (args.config && fs.existsSync(args.config)) {
        config_file = args.config;
    }

    try {
        var config = require(config_file);
        if (config === undefined) {
            throw Error;
        }
        console.log("Using '" + config_file + "'");
        return config;
    } catch(e) {
        console.log("Could not load config '" + config_file + "'");
    }
};

exports.Config = Config;