var gulp = require('gulp')
var sass = require('gulp-sass')
var webserver = require('gulp-webserver')

gulp.task('serve', ['sass'], function () {
  gulp.src('./')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      directoryListing: true
    }))

  gulp.watch('./scss/*.scss', ['sass'])
})

gulp.task('sass', function () {
  return gulp.src('./scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./css'))
})

gulp.task('default', ['serve'])
gulp.task('build', ['sass'])
