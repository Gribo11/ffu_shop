"use strict";

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    include = require('gulp-file-include'),
    server = require('gulp-server-livereload'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    noop = require('gulp-noop'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    svgSprite = require('gulp-svg-sprite'),
    uglify = require('gulp-uglify'),
    prettify = require('gulp-html-prettify'),
    watch = require('gulp-watch');

var path = {
    build : {
        html : './dist/',
        js : './dist/js/',        
        css  : './dist/css/',
        img : './dist/img/',
        svg : './src/custom_icons/',
        fonts : './dist/fonts/'
    },
    src : {
        html : './src/*.html',
        html_inc : './src/html_parts/',
        js : './src/js/*.js',
        css  : './src/scss/main.scss',
        img : './src/img/**/*.*',
        svg : './src/img/svg/*.svg',
        fonts : './src/fonts/**/*.*'
    },
    watch : {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        svg : 'src/img/svg/*.svg',
        fonts: 'src/fonts/*.*'
    }
};

var serverConfig = {
    port: 8048,
    livereload: true,    
    //open: true
    proxies: [
        {
            source: '/server',
            target: 'http://192.168.30.154:8000'
        }
    ]
};

//const production = process.env.NODE_ENV == 'production';
const production = 'production';

gulp.task('build_html', function(){
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(include({
            prefix: '@@',
            basepath: path.src.html_inc
        }))
        .pipe( production ? prettify({indent_char: ' ', indent_size: 4}) : noop() )
        .pipe(gulp.dest(path.build.html))
});

gulp.task('build_css', function(){
    gulp.src( path.src.css )
        .pipe( plumber() )
        .pipe( include({
            prefix: '@@',
            basepath: './'
        }) )
        .pipe( sourcemaps.init() )
        .pipe( sass() )
        .pipe( autoprefixer() )
        .pipe( production ? cssmin() : noop() )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest(path.build.css) )
});

gulp.task('build_js', function(){
    return gulp.src( path.src.js )
        .pipe( plumber() )        
        //.pipe( gulpWebpack( require('./webpack.config.js'), webpack ) )        
        .pipe( include({
            prefix: '@@',
            basepath: './'
        }) )
        .pipe( sourcemaps.init() )
        .pipe( production ? uglify() : noop() )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest( path.build.js ) );
});

gulp.task('build_img', function() {
    gulp.src( path.src.img )
        .pipe( production ? imagemin() : noop() )
        .pipe( gulp.dest(path.build.img) )
});

gulp.task('build_svg', function() {
    gulp.src( path.src.svg )
        /*.pipe( imagemin([
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: true}
                ]
            })
        ]) )*/
        .pipe( svgSprite({
            shape : {
                dimensions : {
                    maxWidth : 70,
                    maxHeight : 70
                },
                id : {
                    generator : "ffu-icon-%s"
                },
                transform : [
                    {
                        svgo : {
                            plugins: [
                                { removeViewBox: false },
                                { cleanupIDs: true }
                            ]
                        }
                    }
                ]
                //dest : path.build.svg // uncomment to save separate svgs
            },
            svg : {
                xmlDeclaration : false,
                doctypeDeclaration : false
            },
            mode : {
                symbol : {                    
                    dest : '.',
                    sprite : 'icons-sprite.svg'
                }
                
            }
        }) )
        .pipe( gulp.dest(path.build.svg) )
});

gulp.task('copy_resources', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'build_html',
    'build_css',
    'build_js',
    'build_img',
    'build_svg',
    'copy_resources'
]);

gulp.task('watch', function(){    
    if ( ! production ) {
        watch([path.watch.html], function(e, cb){
            gulp.start('build_html');
        });
        watch([path.watch.css], function(e, cb){
            gulp.start('build_css');
        });
        watch([path.watch.js], function(e, cb){
            gulp.start('build_js');
        });
        watch([path.watch.img], function(e, cb){
            gulp.start('build_img');
        });
        watch([path.watch.svg], function(e, cb){
            gulp.start('build_svg');
        });
        watch([path.watch.fonts], function(e, cb){
            gulp.start('copy_resources');
        });
    }
});

gulp.task('server', function() {
    gulp.src( path.build.html )
        .pipe( production ? noop() : server(serverConfig) );
});

gulp.task('default', ['build','server','watch']);