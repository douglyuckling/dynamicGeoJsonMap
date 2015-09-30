var fs = require('fs');
var topojson = require('topojson');

var inputFilePath = 'uk.geo.json';
var outputFilePath = 'app/uk.topo.json';

function convertToTopoJson(geoJson) {
    return topojson.topology({
        subunits: geoJson
    }, {
        id: function(feature) {
            return feature.properties.SU_A3;
        },
        propertyTransform: function(feature) {
            return {
                name: feature.properties.NAME
            };
        },
        quantization: null
    });
}

fs.readFile(inputFilePath, 'utf8', function(err, data) {
    if (err) err;
    var geoJson = JSON.parse(data);
    var topoJson = convertToTopoJson(geoJson);

    fs.writeFile(outputFilePath, JSON.stringify(topoJson), function(err) {
        console.log("Saved " + outputFilePath);
    });
});
