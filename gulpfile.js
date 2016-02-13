var gulp = require('gulp'),
    gulpPlugins = require('gulp-load-plugins')(),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    browserSync = require('browser-sync');

//browserify
gulp.task('browserify',function (){
  browserify({
    entries: 'app/src/sketch.js',
    extensions: ['.js']
  })
  .transform(babelify,{presets: ['es2015']},{ debug: true })
		.bundle()
    .pipe(gulpPlugins.plumber())
		.on('error', function (err) {
			console.log('Error : ' + err.message);
			this.emit('end');
		})
    .pipe(source('sketch.js'))
  	.pipe(gulp.dest('app/dist'))
    .pipe(browserSync.stream());
});

//server
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: 'app/dist'
        }
    });
});

//watch
gulp.task('watch', function() {
  var targets = [
    'app/src/**/*.js',
  ];
  gulp.watch(targets, ['browserify']);
  gulp.watch('app/dist/*.html').on('change', browserSync.reload);
});


gulp.task('default',['serve','watch']);
