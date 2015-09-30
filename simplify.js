(function() {
    'use strict';

    function prepare(geoJsonObject) {
        processGeometryObject(geoJsonObject);
    }

    function processGeometryObject(geometryObject) {
        switch (geometryObject.type) {
            case 'Point':
            case 'MultiPoint':
                break;

            case 'LineString':
                processLineString(geometryObject);
                break;
            case 'MultiLineString':
                processMultiLineString(geometryObject);
                break;
            case 'Polygon':
                processPolygon(geometryObject);
                break;
            case 'MultiPolygon':
                processMultiPolygon(geometryObject);
                break;
            case 'GeometryCollection':
                processGeometryCollection(geometryObject);
                break;
            case 'FeatureCollection':
                processFeatureCollection(geometryObject);
                break;
            case 'Feature':
                processFeature(geometryObject);
                break;

            default:
                console.error("Unrecognized geometry type: " + geometryObject.type);
        }
    }

    function processLineString(lineString) {
        console.group('LineString', lineString);
        processLineStringCoordinates(lineString.coordinates);
        console.groupEnd();
    }

    function processLineStringCoordinates(lineStringCoordinates) {
        console.group('line string coordinates', lineStringCoordinates);
        augmentLineStringCoordinatesWithAreaInformation(lineStringCoordinates, 1);
        console.log(lineStringCoordinates);
        console.groupEnd();
    }

    function processMultiLineString(multiLineString) {
        console.group('MultiLineString', multiLineString);
        multiLineString.coordinates.forEach(function(lineStringCoordinates) {
            processLineStringCoordinates(lineStringCoordinates);
        });
        console.groupEnd();
    }

    function processPolygon(polygon) {
        console.group('Polygon', polygon);
        processPolygonCoordinates(polygon.coordinates);
        console.groupEnd();
    }

    function processPolygonCoordinates(polygonCoordinates) {
        console.group('polygon coordinate array', polygonCoordinates);
        polygonCoordinates.forEach(function(linearRingCoordinates) {
            augmentLineStringCoordinatesWithAreaInformation(linearRingCoordinates, 3);
            console.log(linearRingCoordinates);
        });
        console.groupEnd();
    }

    function processMultiPolygon(multiPolygon) {
        console.group('MultiPolygon', multiPolygon);
        multiPolygon.coordinates.forEach(function(polygonCoordinates) {
            processPolygonCoordinates(polygonCoordinates);
        });
        console.groupEnd();
    }

    function processGeometryCollection(geometryCollection) {
        console.group('GeometryCollection', geometryCollection);
        geometryCollection.geometries.forEach(function(geometry) {
            processGeometryObject(geometry);
        });
        console.groupEnd();
    }

    function processFeature(feature) {
        console.group('Feature', feature);
        processGeometryObject(feature.geometry);
        console.groupEnd();
    }

    function processFeatureCollection(featureCollection) {
        console.group('FeatureCollection', featureCollection);
        featureCollection.features.forEach(function(feature) {
            processFeature(feature);
        });
        console.groupEnd();
    }

    function augmentLineStringCoordinatesWithAreaInformation(coordinates, minSegments) {
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

        function sphericalAreaOfTriangleFormedByCoordinates(c0, c1, c2) {
            var triangle = {
                'type': 'Polygon',
                'coordinates': [[c0, c1, c2, c0]]
            };

            var area = d3.geo.area(triangle);
            return Math.min(area, 4 * Math.PI - area);
        }

    }

    window.simplify = {
        prepare: prepare
    };
})();
