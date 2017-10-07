'use strict';

// import
import gulp from 'gulp';
import gutil from 'gulp-util';
import notify from 'gulp-notify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import pleeease from 'gulp-pleeease';
import watchify from 'watchify';
import browserify from 'browserify';
import vueify from 'vueify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import pug from 'gulp-pug';
import browserSync from 'browser-sync';
import readConfig from 'read-config';
import watch from 'gulp-watch';
import RevLogger from 'rev-logger';
import Koko from 'koko';
require('dotenv').config({ silent: true });


// const
const PORT = process.env.PORT || null;
const SRC = './src';
const CONFIG = './src/config';
const HTDOCS = '../public';
const BASE_PATH = '';
const DEST = `${HTDOCS}${BASE_PATH}`;

const revLogger = new RevLogger({
    'style.css': `${DEST}/css/style.css`,
    'script.js': `${DEST}/js/script.js`
});


// css
gulp.task('sass', () => {
    const config = readConfig(`${CONFIG}/pleeease.json`);
    return gulp.src(`${SRC}/scss/style.scss`)
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(pleeease(config))
        .pipe(gulp.dest(`${DEST}/css`));
});

gulp.task('css', gulp.series('sass'));


// js
gulp.task('browserify', () => {
  bundleJs();
});

gulp.task('watchify', () => {
  bundleJs(true);
});

gulp.task('js', gulp.parallel('browserify'));


// html
gulp.task('pug', () => {
    const locals = readConfig(`${CONFIG}/meta.yml`);
    locals.versions = revLogger.versions();
    locals.basePath = BASE_PATH;
    
    return gulp.src(`${SRC}/pug/**/[!_]*.pug`)
        .pipe(pug({
            locals: locals,
            pretty: true,
            basedir: `${SRC}/pug`
        }))
        .pipe(gulp.dest(`${DEST}`));
});

gulp.task('html', gulp.series('pug'));


// serve
gulp.task('server', () => {
  new Koko(DEST, {
    openPath: (gutil.env.open ? '/' : null),
    staticPort: (gutil.env.port || PORT || null),
  }).start();
});


// watch
gulp.task('watch', () => {
    watch([`${SRC}/scss/**/*.scss`], gulp.series('sass'));
    // watch([`${SRC}/js/**/*.js`, `${SRC}/js/components**/*.vue`], gulp.series('watchify'));
    gulp.series('watchify');
    watch([
        `${SRC}/pug/**/*.pug`,
        `${SRC}/config/meta.yml`
    ], gulp.series('pug'));

    revLogger.watch((changed) => {
        gulp.series('pug')();
    });
});

gulp.task('serve', gulp.series('server'));


// default
gulp.task('build', gulp.parallel('css', 'js', 'html'));
gulp.task('default', gulp.series('build', 'serve', 'watch'));


// functions
function bundleJs(watching = false) {
  const entries = `${SRC}/js/script.js`;
  const paths = ['./node_modules'];
  const dest_file = 'script.js';
  const dest_path = `${DEST}/js`;
  const b = browserify({
    entries: entries,
    paths: paths,
    transform: [babelify, vueify],
    plugin: watching ? [watchify] : null,
  });
  b.on('update', () => {
    console.log('scripts update...');
    bundler();
  });
  function bundler() {
    return b.bundle()
      .on('error', notify.onError('<%= error.message %>'))
      .pipe(source(dest_file))
      .pipe(buffer())
      .pipe(uglify({ output: { comments: /^!/ }}))
      .pipe(gulp.dest(dest_path))
      .pipe(notify('scripts bundle completed!'));
  }
  return bundler();
}
