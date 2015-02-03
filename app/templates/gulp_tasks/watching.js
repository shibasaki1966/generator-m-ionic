/* jshint -W079 */ // prevent redefinition of $ warning

'use strict';
// gulp
var gulp = require('gulp');
var paths = gulp.paths;
// plugins
var $ = require('gulp-load-plugins')();
// modules
var http = require('http');
var connect = require('connect');
var opn = require('opn');
var serveStatic = require('serve-static');
var connectLiveReload = require('connect-livereload');

var createConnectServer = function (paths) {
  var app = connect()
    .use(connectLiveReload({port: 35729}));
  for (var key in paths) {
    app.use(serveStatic(paths[key]));
  }
  http.createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
};

// WATCH
gulp.task('watch', ['serve'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/index.html',
    '.tmp/main/styles/*.css',
    'app/*/assets/**/*',
    'app/*/templates/**/*'
  ].concat(paths.jsFiles),
  function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    if (event.type === 'changed') {
      $.livereload.reload();
    }
    else { // added or deleted
      gulp.start('inject-only'); // inject in index (implicitly reloads)
    }
  });

  // watch for changes in scss
  gulp.watch('app/*/styles/**/*.scss', ['styles']);
  // watch for changes in bower.json
  gulp.watch('bower.json', ['wiredep']);
});
gulp.task('serve', ['connect', 'inject', 'styles'], function () {
  opn('http://localhost:9000');
});
gulp.task('connect', function () {
  createConnectServer(['app', '.tmp']);
});

// WATCH-BUILD
gulp.task('watch-build', ['serve-build'], function () {
  $.livereload.listen();

  gulp.watch(paths.dist + '/**/*', function () {
    $.livereload.reload();
  });
});
gulp.task('serve-build', ['connect-build', 'build'], function () {
  opn('http://localhost:9000');
});
gulp.task('connect-build', function () {
  createConnectServer(paths.dist);
});
