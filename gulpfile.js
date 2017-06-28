var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

gulp.task('sass', function() {
  return gulp.src('scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true,outputStyle: 'expanded'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task("watch",['browserSync','sass'], function () {
  gulp.watch("scss/**/*.scss", ["sass"]);
});

gulp.task("default", ["sass", "watch"]);

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
  });
});
