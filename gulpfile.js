
// Require

var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    concat  = require('gulp-concat'),
    connect = require('gulp-connect');

// Setup

var destFolder = 'public/comics/special/400';


// Helpers

function reload (files) {
  gulp.src(files.path).pipe(connect.reload());
}

function prettyLog (label, text) {
  gutil.log( gutil.colors.bold("  " + label + " | ") + text );
}

function errorReporter (err){
  gutil.log( gutil.colors.red("Error: ") + gutil.colors.yellow(err.plugin) );
  if (err.message)    { prettyLog("message", err.message); }
  if (err.fileName)   { prettyLog("in file", err.fileName); }
  if (err.lineNumber) { prettyLog("on line", err.lineNumber); }
  return this.emit('end');
};


// Tasks

gulp.task('server', function () {
  connect.server({
    root: 'public',
    livereload: true
  });
});

gulp.task('script', function () {
  return gulp.src([ 'src/*.js' ])
    .pipe(concat('200.min.js'))
    .pipe(gulp.dest('public'));
});


// Register

gulp.task('default', [ 'server', 'script' ], function () {
  gulp.watch(['src/*'], ['script']);
  gulp.watch(['public/**/*']).on('change', reload);
});

