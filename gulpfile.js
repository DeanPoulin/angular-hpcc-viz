'use strict';

var gulp = require('gulp');
var path = require('path');
var $ = require('gulp-load-plugins')();

gulp.task('jshint', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
});

gulp.task('scripts', ['jshint'], function () {
 return gulp.src(['src/viz.js', 'src/**/*.js'])
    .pipe($.ngAnnotate())
    .pipe($.concat('angular-hpcc-viz.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.uglify())
    .pipe($.rename('angular-hpcc-viz.min.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(['dist'], { read: false })
    .pipe($.rimraf());
});

gulp.task('default', ['clean'], function () {
  return gulp.start('scripts');
});

/**
 * Copy build output directly to another application
 * Example: gulp copy --appdir ../my-app
 */
gulp.task('copy', function () {
  if (!$.util.env.appdir) {
    throw new Error('--appdir is required');
  }

  var dest = path.join($.util.env.appdir, 'src/main/webapp/app/bower_components/angular-hpcc-viz');
  
  gulp.src(['dist/**/*', 'bower.json', 'README.md', 'CHANGELOG.md'])
    .pipe(gulp.dest(dest));
});
