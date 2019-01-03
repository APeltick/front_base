let gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    prefixer    = require('gulp-autoprefixer'),
    cleanCSS    = require('gulp-clean-css'),
    gcmq        = require('gulp-group-css-media-queries'),
    image       = require('gulp-image'),
    //rename      = require('gulp-rename'),
    replace     = require('gulp-replace'),
    del         = require('del');

gulp.task('sass-main', function () {
    return gulp.src([
        '!./app/scss/libs.scss',
        './app/scss/main.scss'
    ])
        .pipe(sass())
        .pipe(prefixer({
            browsers: ['> 0.1%']
        }))
        .pipe(gcmq())
        .pipe(gulp.dest('./app/css/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass-libs', function () {
    return gulp.src('./app/scss/libs.scss')
        .pipe(sass())
        .pipe(prefixer({
            browsers: ['> 0.1%']
        }))
        .pipe(gulp.dest('./app/css/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('js-main', function () {
    return gulp.src([
        '!./app/js/libs.min.js',
        '!./app/js/main.js',
        './app/js/**/*.js'
    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/js/'));
});

gulp.task('js-libs', function () {
    return gulp.src([
        '',
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest('./app/js/'));
});

gulp.task('img', function () {
    return gulp.src('./app/img/**/*')
        .pipe(image({
            pngquant: true,
            optipng: false,
            zopflipng: false,
            jpegRecompress: false,
            mozjpeg: true,
            guetzli: false,
            gifsicle: true,
            svgo: false,
            concurrent: 10,
            quiet: true
        }))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('sync', function () {
    browserSync.init({
        server: {
           baseDir: './app/'
        },
        notify: false
    });
});

gulp.task('watch', ['sync', 'sass-libs', 'sass-main', 'js-libs', 'js-main'], function () {
    gulp.watch('./app/scss/**/*.scss', ['sass-libs', 'sass-main']);
    gulp.watch("./app/*.html").on('change', browserSync.reload);
    gulp.watch([
        "!./app/js/libs.min.js",
        "./app/js/**/*.js"
    ], ['js-main']).on('change', browserSync.reload);
});

gulp.task('del', function () {
    return del.sync('./dist/*');
});

gulp.task('build', ['del', 'img', 'sass-libs', 'sass-main', 'js-libs', 'js-main'], function () {
    //---CSS
    gulp.src([
        './app/scss/libs.scss',
        './app/scss/main.scss'
    ])
        .pipe(sass())
        .pipe(concat('main.min.css'))
        .pipe(prefixer({
            browsers: ['> 0.1%']
        }))
        .pipe(gcmq())
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(gulp.dest('./dist/css/'));

    // ---JS
    gulp.src([
        './app/js/libs.min.js',
        './app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest('./dist/js/'));

    //--HTML
    gulp.src('./app/**/*.html')
        .pipe(replace(/(<!--<css>)[\s\S]*?(<\/css>-->)/gm, '<link rel="stylesheet" href="./css/main.min.css">'))
        .pipe(replace(/(<!--<js>)[\s\S]*?(<\/js>-->)/gm, '<script src="./js/main.min.js"></script>'))
        .pipe(gulp.dest('./dist/'));

    //--Fonts
    gulp.src('./app/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts/'));
});