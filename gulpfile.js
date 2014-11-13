var gulp    = require('gulp');
var mocha   = require('gulp-mocha');
var nodemon = require('gulp-nodemon');

gulp.task('test', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha({ reporter:'spec' }));
});

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js','test/**/*.js'], [
    'test']);
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js',
    ext: 'html js',
    ignore: [],
    stdout: true
  })
  .on('restart', function () {
    // console.log('restarted!')
  });
});

gulp.task('default', [
  'test',
  'nodemon',
  'watch'
]);