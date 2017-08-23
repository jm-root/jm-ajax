'use strict'

var gulp = require('gulp')
var clean = require('gulp-clean')
var gulpSequence = require('gulp-sequence')
var jshint = require('gulp-jshint')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var babel = require('gulp-babel')
var browserify = require('gulp-browserify')
var eslint = require('gulp-eslint')
var jsdoc = require('gulp-jsdoc3')

gulp.task('clean', function () {
  return gulp.src(['dist/*', 'lib/*'])
    .pipe(clean({force: true}))
})

gulp.task('jshint', function () {
  return gulp.src([
    'lib/**/*.js'
  ])
    .pipe(jshint())
    .pipe(jshint.reporter())
})

gulp.task('eslint', function () {
  return gulp.src([
    'src/**/*.js',
    'test/**/*.js'
  ])
    .pipe(eslint({configFle: './.eslintrc'}))
    .pipe(eslint.format())
})

gulp.task('es6to5', ['eslint'], function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./lib/'))
})

gulp.task('pack', ['es6to5'], function () {
  return gulp.src('./lib/browser.js')
    .pipe(browserify())
    .pipe(concat('dist/js/jm-ajax.js'))
    .pipe(gulp.dest(''))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('')
    )
})

gulp.task('doc', function (cb) {
  gulp.src(['README.md', './src/**/*.js'], {read: false})
    .pipe(jsdoc(cb))
})

gulp.task('default', gulpSequence('clean', ['pack']))
