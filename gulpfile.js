'use strict';

var gulp = require('gulp');
var path = require('path');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var htmlmin = require('gulp-htmlmin');
var del = require('del');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var webpack = require('webpack-stream');

var input = 'src/';
var output = 'build/';

var getWebpackConfig = function(mode) {
  return {
    mode: mode,
    output: {
      filename: 'app.js',
    },
    resolve: {
      alias: {
        svelte: path.resolve('node_modules', 'svelte'),
      },
      extensions: ['.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.(html|svelte)$/,
          exclude: /node_modules/,
          use: 'svelte-loader',
        },
        {
          test: /\.(js)$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ]
    },
  };
}


gulp.task('sprite', function () {
  return gulp.src(input + 'img/sprite/*.svg')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{ removeViewBox: false }],
      })
    ]))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest(output + 'img/'));
});

gulp.task('img', function () {
  return gulp.src(input + 'img/*.{gif,png,jpg,jpeg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo({
        plugins: [{ removeViewBox: false }],
      })
    ]))
    .pipe(gulp.dest(input + 'img/'));
});

gulp.task('webp', function () { // не тестив
  return gulp.src(input + 'img/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(input + 'img/'));
});

gulp.task('css', function () {
  return gulp.src(input + 'sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer() // autoprefixer({browsers: ['last 2 version']}),
    ]))
    .pipe(gulp.dest(output + 'css/'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(output + 'css/'))
    .pipe(server.stream());
});


gulp.task('html', function () {
  return gulp.src(input + 'html/pages/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin())
    .pipe(gulp.dest(output));
});

gulp.task('js-prod', function () {
  return gulp.src(input + 'js/app.js')
    .pipe(webpack(getWebpackConfig('production')))
    .pipe(gulp.dest(output))
});

gulp.task('js-dev', function () {
  return gulp.src(input + 'js/app.js')
    .pipe(webpack(getWebpackConfig('development')))
    .pipe(gulp.dest(output))
});

gulp.task('clean', function () {
 return del(output);
});

gulp.task('copy', function () {
  return gulp.src([
      input + 'fonts/**/*.{woff,woff2}',
      input + 'img/*.*', // маска *.* не позволяет копировать папки sprite-svg
      input + 'favicon/*',
      input + '*.json',
    ], {
      base: input,
    })
    .pipe(gulp.dest(output));
});

gulp.task('server', function () {
  server.init({
    server: output,
    notify: false,
  });

  gulp.watch(input + 'sass/**/*.scss', gulp.series('css', 'refresh'));
  gulp.watch(input + 'html/**/*.html', gulp.series('html', 'refresh'));
  gulp.watch(input + 'js/**/*.js', gulp.series('js-dev', 'refresh'));
  gulp.watch(input + 'js/**/*.svelte', gulp.series('js-dev', 'refresh'));
  gulp.watch(input + 'fonts/**/*.{woff,woff2}', gulp.series('copy', 'refresh'));
  gulp.watch(input + 'img/*.{gif,png,jpg,jpeg,svg}', gulp.series('copy', 'refresh'));
  gulp.watch(input + 'img/sprite/*.svg', gulp.series('sprite', 'refresh'));
  gulp.watch(input + '*.json', gulp.series('copy', 'refresh'));
});

gulp.task('refresh', function(done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'css',
  'sprite',
  'js-prod',
  'html',
));

gulp.task('start', gulp.series(
  'clean',
  'copy',
  'css',
  'sprite',
  'js-dev',
  'html',
  'server',
));
