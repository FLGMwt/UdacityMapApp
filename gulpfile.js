var gulp = require('gulp');
var uglify = require('gulp-uglify');
var del = require('del');

var DEST = 'dist';

gulp.task('scripts', ['clean'], function() {
	gulp.src('scripts/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(DEST));
});

gulp.task('clean', function() {
	return del(DEST);
});

gulp.task('default', ['clean', 'scripts']);