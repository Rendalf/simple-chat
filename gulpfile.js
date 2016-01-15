const gulp = require("gulp");
const babelify = require("babelify");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");

const config = {
	bundle: "app.js",
	srcJs: "src/index.js",
	distJsPath: "public/js/",
};

// browserify js
gulp.task("build", () => {
	browserify(config.srcJs)
		.transform(babelify)
		.bundle()
		.pipe(source(config.bundle))
		.pipe(buffer())
		.pipe(gulp.dest(config.distJsPath));
});