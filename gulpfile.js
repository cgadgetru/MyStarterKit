var gulp = require('gulp');
var changed = require('gulp-changed');
var rm = require('gulp-rm');
var concat = require('gulp-concat');
var imageMin = require('gulp-imagemin');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var postCss = require('gulp-postcss');
var lost = require('lost');


var processors = [
    autoprefixer({
        browsers: ["> 1%"]
    }),
    lost
];

var paths = {
    styles: 'app/styles/style.scss',
    scripts: 'app/scripts/**.*',
    vendors: 'app/vendors/**.*',
    stylesWatch: 'app/styles/**/*.scss',
    images: 'app/images/*',
    fonts: ['app/fonts/*'],
    indexHtml: 'app/index.html',
    public:'public/',
    html:'app/**.html',
    vendorsPaths:{
        css:[],
        js:['app/vendors/system-polyfills.js','app/vendors/system.js']
    }

};

gulp.task('html', function () {
    gulp.src(paths.html)
        .pipe(gulp.dest(paths.public));
});

gulp.task('vendors-css', function () {
    if (paths.vendorsPaths.css.length > 0 ){
        gulp.src(paths.vendorsPaths.css)
            .pipe(concat('vendor.min.css'))
            .pipe(gulp.dest(paths.public+'vendors'));
    }

});

gulp.task('vendors-js', function () {
    if (paths.vendorsPaths.js.length > 0 ) {
        gulp.src(paths.vendorsPaths.js)
            .pipe(concat('vendors.min.js'))
            .pipe(gulp.dest(paths.public + 'vendors'));
    }
});

/*gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(gulp.dest(paths.public+'scripts'));
});*/

gulp.task('sass', function () {
    gulp.src(paths.public+'/css/**.*', {read: false})
        .pipe(rm({async: false}));
    return gulp.src(paths.styles)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .on('error', console.error)
        .pipe(postCss(processors))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest(paths.public+'/css/'));
});
gulp.task('images', function () {
    gulp.src(paths.images)
        .pipe(changed(paths.images))
        .pipe(imageMin({optimizationLevel: 5}))
        .pipe(gulp.dest(paths.public+'/images/'))
});
gulp.task('fonts', function () {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.public+'/fonts/'))
});

gulp.task('watch', function () {
    /*gulp.watch(paths.scripts, ['scripts', 'html']).on('change', browserSync.reload);*/
    gulp.watch(paths.stylesWatch, ['sass', 'html']).on('change', browserSync.reload);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.fonts, ['fonts']);
    gulp.watch(paths.html, ['html']).on('change', browserSync.reload);
});

var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "public"
        }
    });
});

gulp.task('babel', function() {
    return gulp.src('app/scripts/**.js' )
        .pipe(babel({
            presets: ['es2015'],
            plugins: ["transform-es2015-modules-systemjs"]

        }))
        .pipe(gulp.dest(paths.public+'scripts'));
});

gulp.task('build', ['vendors-css','vendors-js','babel', 'sass', 'images', 'fonts', 'html']);

gulp.task('default', ['build', 'watch', 'browser-sync']);


