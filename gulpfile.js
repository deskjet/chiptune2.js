const gulp = require('gulp'),
terser = require('gulp-terser'),
replace = require('gulp-replace'),
rename = require('gulp-rename'),
gzip = require('gulp-gzip'),
brotli = require('gulp-brotli')

// this was inserted in Dockerfile instead of the import line
gulp.task('preparePoly', () => {
	return gulp.src('polyfills.js')
	.pipe(terser())
	.pipe(replace(/export /g, ''))
	.pipe(gulp.dest('_tmp'))
})

gulp.task('terser', () => {
	return gulp.src(['chiptune3.js','chiptune3.worklet.js'])
	.pipe(terser())
	.pipe(rename({suffix:'.min'}))
	.pipe(gulp.dest('.'))
})

gulp.task('gzip', () => {
	return gulp.src(['chiptune3.min.js','chiptune3.worklet.min.js','libopenmpt.worklet.js'])
	.pipe(gzip())
	.pipe(gulp.dest('.'))
})

gulp.task('brotli', () => {
	return gulp.src(['chiptune3.min.js','chiptune3.worklet.min.js','libopenmpt.worklet.js'])
	.pipe(brotli())
	.pipe(gulp.dest('.'))
})

gulp.task('default', gulp.series('terser',gulp.parallel('gzip','brotli')))