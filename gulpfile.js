var gulp         = require('gulp');
var mocha        = require('gulp-mocha');
var nodemon      = require('gulp-nodemon');
var sass         = require('gulp-sass');
var rename       = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');

//
// Tests
// --------------------------------------------------
gulp.task('test', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha({ reporter:'spec' }));
});

//
// SCSS
// --------------------------------------------------
gulp.task('scss', function () {
  return gulp.src('client/scss/screen.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./public/css/'))
});

//
// Server
// --------------------------------------------------
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

//
// Watch and task runners
// --------------------------------------------------
gulp.task('watch', function () {
  gulp.watch(['client/scss/**/*.scss'], ['scss']);
  gulp.watch(['lib/**/*.js','test/**/*.js'], [
    'test']);
});

gulp.task('default', [
  'test',
  'scss',
  'nodemon',
  'watch'
]);

gulp.task('build', [
  'test',
  'scss'
])