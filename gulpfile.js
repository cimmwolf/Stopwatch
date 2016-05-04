var path = require('path');
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var sass = require('gulp-sass');
var stylemod = require('gulp-style-modules');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var vulcanize = require('gulp-vulcanize');
var concat = require('gulp-concat');
var version = require('gulp-version-append');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var polyclean = require('polyclean');
var htmlmin = require('gulp-htmlmin');
var cache = require('gulp-cached');

gulp.task('default', ['scripts', 'css', 'components', 'images'], function () {
    gulp.src('app.html')
        .pipe(version(['js', 'css'], {appendType: "guid"}))
        .pipe(polyclean.cleanCss())
        .pipe(polyclean.leftAlignJs())
        .pipe(polyclean.uglifyJs())
        .pipe(htmlmin({removeComments: true}))
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./'));
    return gulp.src('bower_components/**/*.html')
        .pipe(polyclean.cleanCss())
        .pipe(polyclean.leftAlignJs())
        .pipe(polyclean.uglifyJs())
        .pipe(htmlmin({removeComments: true}))
        .pipe(gulp.dest('bower_components'));
});

gulp.task('scripts', ['coffee'], function () {
    return gulp.src([
            'app/*.js',
            'node_modules/reflect-metadata/Reflect.js',
            'node_modules/@angular/core/core.umd.js',
            'node_modules/@angular/common/common.umd.js',
            'node_modules/@angular/compiler/compiler.umd.js',
            'node_modules/@angular/platform-browser/platform-browser.umd.js',
            'node_modules/@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js',
            'bower_components/moment/locale/ru.js'
        ])
        .pipe(cache('uglifying'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('coffee', function () {
    return gulp.src(['src/coffee/app.component.coffee', 'src/coffee/main.coffee'])
        .pipe(concat('main.js'))
        .pipe(coffee())
        .pipe(gulp.dest('app'));
});

gulp.task('js-modules', function () {
    return gulp.src('src/coffee/*.module.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('dist/js-modules'));
});

gulp.task('css',['sass'], function () {
    gulp.src('dist/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('sass', function () {
    return gulp.src(['src/sass/*.sass', '!src/sass/*.module.sass'])
        .pipe(sass({includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('style-modules', function () {
    return gulp.src('src/sass/*.module.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(stylemod({
            filename: function (file) {
                return path.basename(file.path, path.extname(file.path));
            },
            moduleId: function (file) {
                return path.basename(file.path, path.extname(file.path));
            }
        }))
        .pipe(gulp.dest('dist/css-modules'));
});

gulp.task('images', function () {
    return gulp.src(['src/img/**/*', 'bower_components/d-style/src/img/main-background.jpg'])
        .pipe(newer('dist/img'))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('components', ['style-modules', 'js-modules'], function () {
    return gulp.src('src/components/*')
        .pipe(vulcanize({
            inlineScripts: true,
            inlineCss: true,
            stripComments: true,
            excludes: ['bower_components/'],
            stripExcludes: false
        }))
        .pipe(gulp.dest('dist/components'));
});