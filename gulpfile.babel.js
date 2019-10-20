import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import eslint from 'gulp-eslint';
import del from 'del';
import runSequence from 'run-sequence';
import ts from 'gulp-typescript';

const tsProj = ts.createProject('tsconfig.json');

const config = {
  paths: {
    js: {
      src: 'src/**/*.js',
      dist: 'dist/',
    },
    ts: {
      src: 'src/**/*.ts',
      dist: 'dist/',
    },
    test: {
      src: 'test/**/*.js',
      dist: 'test-dist/',
      run: 'test-dist/**/*.js',
    },
  },
};

gulp.task('clean', () => del(config.paths.js.dist));

gulp.task('build', ['build-src', 'build-src-ts', 'build-test']);

gulp.task('build-src', [], () => gulp.src(config.paths.js.src)
  .pipe(babel())
  .pipe(gulp.dest(config.paths.js.dist))
);

gulp.task('build-src-ts', [], () => gulp.src(config.paths.ts.src)
  .pipe(tsProj())
  .pipe(babel())
  .pipe(gulp.dest(config.paths.ts.dist))
);

gulp.task('build-test', ['lint-test'], () => gulp.src(config.paths.test.src)
  .pipe(babel())
  .pipe(gulp.dest(config.paths.test.dist))
);

gulp.task('lint-src-ts', () => gulp.src(config.paths.ts.src)
  .pipe(eslint())
  .pipe(eslint.format())
);

gulp.task('lint-src', () => gulp.src(config.paths.js.src)
  .pipe(eslint())
  .pipe(eslint.format())
);

gulp.task('lint-test', () => gulp.src(config.paths.test.src)
  .pipe(eslint())
  .pipe(eslint.format())
);

gulp.task('watch', () => {
  gulp.watch(config.paths.js.src, ['build-src', 'build-src-ts', 'test']);
  gulp.watch(config.paths.test.src, ['build-test', 'test']);
});

gulp.task('test', ['build'], () => gulp.src([config.paths.test.run])
  .pipe(mocha({ reporter: 'spec' }))
  .on('error', (err) => console.log(err.stack))
);

// Default Task
gulp.task('default', () => runSequence('clean', ['build', 'test']));
