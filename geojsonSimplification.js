var _ = require('underscore');
var d3 = require('d3');
var geojsonUtils = require('./geojson-utils.js');
var visitCoordinateArrays = geojsonUtils.visitCoordinateArrays;

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var convertToTopoJson = require('./convertToTopoJson.js');

const GULP_PLUGIN_NAME = 'gulp-geojsonSimplification';

function enrichLineStringCoordinatesWithAreaInformation(coordinates, minSegments) {
    var originalCoordinates
    var lastEffectiveArea = 0;
    while (coordinates.length > minSegments+1) {
        coordinates.forEach(function(coordinate, i) {
            if (i > 0 && i < coordinates.length-1 && !(2 in coordinate)) {
                coordinate[2] = sphericalAreaOfTriangleFormedByCoordinates(
                    coordinates[i-1], coordinates[i], coordinates[i+1]
                );
            }
        });

        var removedCoordinate = _(coordinates).min(function(coordinate) {
            if (2 in coordinate) {
                return coordinate[2];
            } else {
                return Infinity;
            }
        });
        var indexOfRemovedCoordinate = _(coordinates).indexOf(removedCoordinate);

        var effectiveArea = Math.max(removedCoordinate[2], lastEffectiveArea);
        removedCoordinate[2] = effectiveArea;
        lastEffectiveArea = effectiveArea;

        delete coordinates[indexOfRemovedCoordinate-1][2];
        delete coordinates[indexOfRemovedCoordinate+1][2];

        coordinates = _(coordinates).without(removedCoordinate);
    }

    coordinates.forEach(function(coordinate) {
        while (coordinate.length > 2) {
            coordinate.pop();
        }
    });

    function sphericalAreaOfTriangleFormedByCoordinates(c0, c1, c2) {
        var triangle = {
            'type': 'Polygon',
            'coordinates': [[c0, c1, c2, c0]]
        };

        var area = d3.geo.area(triangle);
        return Math.min(area, 4 * Math.PI - area);
    }

}

function enrichWithAreaInformation(geometryObject) {
    'use strict';

    visitCoordinateArrays(geometryObject, function(coordinateArray, isRing) {
        var minSegments = isRing ? 3 : 2;
        enrichLineStringCoordinatesWithAreaInformation(coordinateArray, minSegments);
    });
}

enrichWithAreaInformation.gulp = function() {
    var stream = through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(GULP_PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            var geometryObject = JSON.parse(file.contents);
            enrichWithAreaInformation(geometryObject);
            file.contents = new Buffer(JSON.stringify(geometryObject));
        }

        this.push(file);

        cb();
    });

    return stream;
};

module.exports = {
    enrichLineStringCoordinatesWithAreaInformation: enrichLineStringCoordinatesWithAreaInformation,
    enrichWithAreaInformation: enrichWithAreaInformation
};
