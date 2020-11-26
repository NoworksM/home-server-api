const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const tsProject = ts.createProject('tsconfig.json');

const compileTs = () => {
    return tsProject
        .src()
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
};

const dev = () => {
    gulp.watch('src/**/*.ts', compileTs)
};

gulp.task('compile:ts', compileTs);
gulp.task('dev', dev);
gulp.task('default', gulp.series(compileTs));