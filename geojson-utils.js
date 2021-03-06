module.exports = {
    visitCoordinateArrays: function(geometryObject, visitFn) {
        'use strict';

        visitCoordinateArraysInGeometryObject(geometryObject);

        function visitCoordinateArraysInGeometryObject(geometryObject) {
            switch (geometryObject.type) {
                case 'Point':
                case 'MultiPoint':
                    break;

                case 'LineString':
                    visitCoordinateArraysInLineString(geometryObject);
                    break;
                case 'MultiLineString':
                    visitCoordinateArraysInMultiLineString(geometryObject);
                    break;
                case 'Polygon':
                    visitCoordinateArraysInPolygon(geometryObject);
                    break;
                case 'MultiPolygon':
                    visitCoordinateArraysInMultiPolygon(geometryObject);
                    break;
                case 'GeometryCollection':
                    visitCoordinateArraysInGeometryCollection(geometryObject);
                    break;
                case 'FeatureCollection':
                    visitCoordinateArraysInFeatureCollection(geometryObject);
                    break;
                case 'Feature':
                    visitCoordinateArraysInFeature(geometryObject);
                    break;

                case 'Topology':
                    visitCoordinateArraysInTopology(geometryObject);
                    break;

                default:
                    console.error("Unrecognized geometry type: " + geometryObject.type);
            }
        }

        function visitCoordinateArraysInLineString(lineString) {
            // console.group('LineString', lineString);
            visitFn(lineString.coordinates, false);
            // console.groupEnd();
        }

        function visitCoordinateArraysInMultiLineString(multiLineString) {
            // console.group('MultiLineString', multiLineString);
            multiLineString.coordinates.forEach(function(lineStringCoordinates) {
                visitFn(lineStringCoordinates, false);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInPolygon(polygon) {
            // console.group('Polygon', polygon);
            visitCoordinateArraysInPolygonCoordinates(polygon.coordinates);
            // console.groupEnd();
        }

        function visitCoordinateArraysInPolygonCoordinates(polygonCoordinates) {
            // console.group('polygon coordinate array', polygonCoordinates);
            polygonCoordinates.forEach(function(linearRingCoordinates) {
                visitFn(linearRingCoordinates, true);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInMultiPolygon(multiPolygon) {
            // console.group('MultiPolygon', multiPolygon);
            multiPolygon.coordinates.forEach(function(polygonCoordinates) {
                visitCoordinateArraysInPolygonCoordinates(polygonCoordinates);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInGeometryCollection(geometryCollection) {
            // console.group('GeometryCollection', geometryCollection);
            geometryCollection.geometries.forEach(function(geometry) {
                visitCoordinateArraysInGeometryObject(geometry);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInFeature(feature) {
            // console.group('Feature', feature);
            visitCoordinateArraysInGeometryObject(feature.geometry);
            // console.groupEnd();
        }

        function visitCoordinateArraysInFeatureCollection(featureCollection) {
            // console.group('FeatureCollection', featureCollection);
            featureCollection.features.forEach(function(feature) {
                visitCoordinateArraysInFeature(feature);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInTopology(topology) {
            // console.group('Topology', topology);
            topology.arcs.forEach(function(arc) {
                visitCoordinateArraysInArc(arc);
            });
            // console.groupEnd();
        }

        function visitCoordinateArraysInArc(arc) {
            // console.group('arc', topology);
            var firstCoordinate = arc[0];
            var lastCoordinate = arc[arc.length-1];
            var isRing = firstCoordinate[0] === lastCoordinate[0] &&
                firstCoordinate[1] === lastCoordinate[1];
            visitFn(arc, isRing);
            // console.groupEnd();
        }
    }
};
