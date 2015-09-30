var gulp = require('gulp');
var connect = require('gulp-connect');
var clean = require('gulp-clean');
var rename = require("gulp-rename");
var convertToTopoJson = require('./convertToTopoJson.js');
var geojsonSimplification = require('./geojsonSimplification.js');

gulp.task('clean', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
});

gulp.task('copy-app-files', function () {
  gulp.src('./app/**/*')
    .pipe(gulp.dest('dist/'));
});

gulp.task('convert-to-topojson', function() {
    gulp.src('./uk.geo.json')
        .pipe(convertToTopoJson.gulp('subunits', {
            id: function(feature) {
                return feature.properties.SU_A3;
            },
            propertyTransform: function(feature) {
                return {
                    name: feature.properties.NAME
                };
            },
            quantization: null
        }))
        .pipe(geojsonSimplification.enrichWithAreaInformation.gulp())
        .pipe(rename('uk.topo.json'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('connect', ['build'], function () {
    gulp.watch(['./app/**/*'], ['build']);
    connect.server({
        root: 'dist/',
        port: 8008,
        livereload: true
    });
});

gulp.task('build',
  ['copy-app-files', 'convert-to-topojson']
);
