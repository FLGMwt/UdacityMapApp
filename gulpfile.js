var gulp = require('gulp');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var del = require('del');

var DEST = 'dist';
var paths = {
	scripts: [
		'scripts/*.js',
		'bower_components/knockout/dist/knockout.js',
		'bower_components/jquery/dist/jquery.js',
		'node_modules/oauth-1.0a/oauth-1.0a.js',
		'node_modules/oauth-1.0a/node_modules/crypto-js/crypto-js.js'
	],
	styles: 'styles/*.css'
};

gulp.task('scripts', ['clean:scripts'], function() {
	gulp.src(paths.scripts)
		// .pipe(uglify())
		.pipe(gulp.dest(DEST + '/scripts'));
});

gulp.task('styles', ['clean:styles'], function() {
	gulp.src(paths.styles)
		.pipe(uglifycss())
		.pipe(gulp.dest(DEST + '/styles'));
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
});

gulp.task('clean:scripts', function() {
	return del(DEST + '/scripts');
});

gulp.task('clean:styles', function() {
	return del(DEST + '/styles');
});

gulp.task('default', ['watch', 'scripts', 'styles']);