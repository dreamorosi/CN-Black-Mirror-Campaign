var gulp = require('gulp')
var sass = require('gulp-sass')
var browserSync = require('browser-sync').create()

gulp.task('serve', ['sass'], function () {
  browserSync.init({
    server: {
      baseDir: './',
      directory: true
    }
  })

  gulp.watch('./scss/*.scss', ['sass'])
  gulp.watch('./*.html').on('change', browserSync.reload)
  gulp.watch('./js/*.js').on('change', browserSync.reload)
})

gulp.task('sass', function () {
  return gulp.src('./scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream())
})

gulp.task('default', ['serve'])
gulp.task('build', ['sass'])
