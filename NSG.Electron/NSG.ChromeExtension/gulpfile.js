var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    del = require('del'),
    htmlToJsCompiler = require('gulp-html-to-js'),
    minify = require('gulp-minify'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    imagemin = require('gulp-imagemin');


var errorHandler = function (error) {
    console.log(error);
    this.emit('end');
}

var resolveMinifiedPath = function (path) {
    var params = path.split("/");
    var file = params.splice(params.length - 1, 1)[0];
    var newPath = params.join("/") + "/";

    return {
        file: file,
        path: newPath
    };
}

// Clean the distributable css directory
gulp.task('minify:clean:css', function () {
    return del('css/');
});

// Compile out sass files and minify it
gulp.task('minify:css', ['minify:clean:css'], function () {
    var min = resolveMinifiedPath("./dist/css/app.min.css");
    return gulp.src('scss/*.scss')
        .pipe(plumber(errorHandler))
        .pipe(sass())
        .pipe(cssmin())
        .pipe(concat("app.min.css"))
        .pipe(gulp.dest("dist/min/css"));
});

// Compile out sass files and minify it
gulp.task('minify:lib:css', function () {
    return gulp.src([
        "lib/css/*.css",
        "lib/css/*min.css",
        "lib/css/*-min.css"
    ])
        .pipe(plumber(errorHandler))
        .pipe(sass())
        .pipe(cssmin())
        .pipe(concat("lib.min.css"))
        .pipe(gulp.dest("dist/min/css"));
});

gulp.task('minify:lib:js', function () {
    return gulp.src([
        "lib/js/base/*.js",
        "lib/js/base/*min.js",
        "lib/js/addons/*.js",
        "lib/js/addons/*min.js",
        "lib/js/tp/*.js",
        "lib/js/tp/*min.js",
    ])
        .pipe(plumber(errorHandler))
        .pipe(concat("lib.min.js"))
        .pipe(gulp.dest("dist/min/js"));
});

//Watch CSS task
gulp.task('default:app:css', function () {
    gulp.watch('scss/*.scss', ['minify:css']);
});


gulp.task('minify:templates:app:js:concat', function () {
    return gulp.src([
        'wwwroot/js/templates/**/*.html',
        'wwwroot/js/views/**/*.html',
    ])
      .pipe(htmlToJsCompiler({ concat: 'nsg.templates.min.js', prefix: 'templates/nsg', global: 'window.TemplatesNSG' }))
      .pipe(gulp.dest('minifiedTemplates/'));
});

gulp.task('uglify:minify:app:js', ['minify:templates:app:js:concat'], function (cb) {
    pump([
          gulp.src([
              'minifiedTemplates/nsg.templates.min.js',
              'wwwroot/js/configs/app.js',
              'wwwroot/js/services/shared.service.js',
              'wwwroot/js/**/*.js'
          ]),
          uglify(),
          concat('app.min.js'),
          gulp.dest('dist/min/js')
    ],
      cb
    );
});

//Watch CSS task
gulp.task('default:app:js', function () {
    gulp.watch(
        ['wwwroot/js/**/*.js', 'wwwroot/js/**/*.html'], ['uglify:minify:app:js']);
});
