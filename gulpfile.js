var gulp         = require('gulp');
var mocha        = require('gulp-mocha');

gulp.task('test', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha({ reporter:'spec' }));
});

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js','test/**/*.js'], [
    'test']);
});

gulp.task('default', [
  'test',
  'watch'
]);