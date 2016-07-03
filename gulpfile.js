
var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var cleanCSS = require('gulp-clean-css');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var cssbeautify = require('gulp-cssbeautify');

var filesToMove = [
  './src/images/*.*' ,
  './src/css/fonts/*.*',
  './src/views/*.*',
  './src/libs/*.*',
  './src/partials/*.*',
  './src/templates/*.*',
  './src/upload/*.*',
  './src/favicon.ico',
  './src/.htaccess'
];
var filesToLint = [
  './src/js/**/*.js' 
];
gulp.task('lint', function() {
  return gulp.src(filesToLint)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('clean', function(){
    return gulp.src('./public', {read: false})
    .pipe(clean());
});
gulp.task('move',['clean'], function(){
  return gulp.src(filesToMove, { base: './src' })
  .pipe(gulp.dest('./public'));
});
gulp.task('css', function() {
    return gulp.src('./src/css/*.css')
    .pipe(cssbeautify())
    .pipe(gulp.dest('./src/css'));
});
gulp.task('build', ['lint','move','css'], function () {
   return gulp.src('./src/*.html')
   .pipe(useref())
   .pipe(gulpif('*.css', cleanCSS()))
   .pipe(gulpif('*.js', uglify()))
   .pipe(gulp.dest('./public'));
});
gulp.task('buildDevelop', ['lint','clean', 'css'], function () {
    return  gulp.src('./src/**', { base: './src' })
    .pipe(gulp.dest('./public'));
});
gulp.task('default',['clean'], function(){
    return gulp.watch('./src/**', ['build']);
});

