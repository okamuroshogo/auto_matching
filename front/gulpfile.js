'use strict';

// import
const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const gulpIgnore = require('gulp-ignore');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const readConfig = require('read-config');
const Koko = require('koko');
const watch = require('gulp-watch');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const pleeease = require('gulp-pleeease');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babelify = require('babelify');
const vueify = require('vueify');
const watchify = require('watchify');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
require('dotenv').config({ silent: true });


// const
const PORT = process.env.PORT || null;
const FALLBACK = '404.html';

const HTTP_PATH = '../public/';
const DEST_PATH = '../public/';
const SRC_PATH = './src/';
const CONFIG_PATH = './config/';
const DEST_HTML = DEST_PATH;
const DEST_CSS = `${DEST_PATH}css/`;
const DEST_JS = `${DEST_PATH}js/`;
const SRC_PUG = `${SRC_PATH}pug/`;
const SRC_SASS = `${SRC_PATH}sass/`;
const SRC_JS = `${SRC_PATH}js/`;
const GLOB_UNBUILD = '!' + `${SRC_PATH}**/_**`;
const GLOB_PUG = `${SRC_PUG}**/*.pug`;
const GLOB_SASS = `${SRC_SASS}**/*.sass`;
const GLOB_SCSS = `${SRC_SASS}**/*.scss`;
const GLOB_JS = `${SRC_JS}**/*.js`;
const GLOB_CONFIG = `${CONFIG_PATH}**/*`;

const CONFIG_PATHS = {
  site: `${CONFIG_PATH}site.yml`,
  jsCopy: `${CONFIG_PATH}js-copy.json`,
  browserify: `${CONFIG_PATH}browserify.json`,
  pleeease: `${CONFIG_PATH}pleeease.json`,
  eslintrc: `${CONFIG_PATH}eslintrc.json`,
};


// tasks
gulp.task('default',['build', 'server', 'watch']);
gulp.task('build', ['html', 'css', 'js']);
gulp.task('html', ['pug']);
gulp.task('css', ['sass']);
gulp.task('js', ['browserify', 'js-copy']);
// TODO: キャッシュバスター cf. https://github.com/kayac/kayac-html5-starter/pull/36

gulp.task('watch', () => {
  watch(GLOB_PUG, () => {
    gulp.start('pug');
  });
  watch(GLOB_JS, () => {
    gulp.start('js-copy');
  });
  watch([GLOB_SASS, GLOB_SCSS], () => {
    gulp.start('sass');
  });
  watch(GLOB_CONFIG, () => {
    gulp.start('build');
  });
  gulp.start('watchify');
});

gulp.task('server', () => {
  // TODO: DEST_PATHが存在しないとエラーになる問題
  // TODO: FALLBACK設定
  // TODO: URLをecho
  new Koko(DEST_PATH, {
    openPath: (gutil.env.open ? '/' : null),
    staticPort: (gutil.env.port || PORT || null),
  }).start();
});

gulp.task('pug', () => {
  const config = readConfig(CONFIG_PATHS.site);
  // TODO: locals.basePath = BASE_PATH; cf. https://github.com/kayac/kayac-html5-starter/pull/41/files
  gulp.src([GLOB_PUG, GLOB_UNBUILD])
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(pug({
      locals: config,
      pretty: true
    }))
    .pipe(rename((path) => {
      // ex. hoge.pug -> hoge.html
      // ex. hoge__.pug -> hoge/index.html
      // ex. hoge__fuga.pug -> hoge/fuga.html
      // ex. hoge__fuga__.pug -> hoge/fuga/index.html
      if (!!path.basename.match(/__$/)) {
        path.dirname += '/' + path.basename.replace(/__/g, '/');
        path.basename = 'index';
      }
      else {
        let ary = path.basename.split('__');
        let base = ary.pop();
        let dir = ary.join('/');
        path.dirname += '/' + dir;
        path.basename = base;
      }
    }))
    .pipe(gulp.dest(DEST_HTML));
});

gulp.task('sass', () => {
  const config = readConfig(CONFIG_PATHS.pleeease);
  gulp.src([GLOB_SASS, GLOB_SCSS, GLOB_UNBUILD])
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(pleeease(config))
    .pipe(gulp.dest(DEST_CSS))
    .pipe(notify('sass build succeeded!!'));
});

gulp.task('js-copy', () => {
  const config = readConfig(CONFIG_PATHS.jsCopy);
  gulp.src(config.files)
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(gulpif(!gutil.env.develop, uglify({ output: { comments: /^!/ }}))) // developモードではminifyしない
    .pipe(gulp.dest(DEST_JS));
});

gulp.task('browserify', () => {
  bundleJs();
});

gulp.task('watchify', () => {
  bundleJs(true);
});

gulp.task('lint', () => {
  const config = readConfig(CONFIG_PATHS.eslintrc);
  gulp.src([GLOB_JS, GLOB_UNBUILD])
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(eslint(config))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


// functions
function bundleJs(watching = false) {
  const config = readConfig(CONFIG_PATHS.browserify);
  const b = browserify({
    entries: config.entries,
    paths: config.paths,
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
      .pipe(source(config.dest))
      .pipe(buffer())
      .pipe(gulpif(!gutil.env.develop, uglify({ output: { comments: /^!/ }}))) // developモードではminifyしない
      .pipe(gulp.dest(DEST_JS))
      .pipe(notify('scripts bundle completed!'));
  }
  return bundler();
}
