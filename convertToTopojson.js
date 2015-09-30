var topojson = require('topojson');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var convertToTopoJson = require('./convertToTopoJson.js');

const GULP_PLUGIN_NAME = 'gulp-convertToTopoJson';

function convertToTopojson(objects, options) {
    return topojson.topology(objects, options);
}

convertToTopojson.gulp = function(objectName, options) {
    var stream = through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(GULP_PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            var geoJson = JSON.parse(file.contents);
            var objects = {};
            objects[objectName] = geoJson;
            var topoJson = convertToTopojson(objects, options);
            file.contents = new Buffer(JSON.stringify(topoJson));
        }

        this.push(file);

        cb();
    });

    return stream;
};

module.exports = convertToTopojson;
