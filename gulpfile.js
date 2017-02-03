const gulp = require('gulp'),
    tsc = require('gulp-typescript'),
    peg = require('gulp-peg'),
    merge = require('merge2'),
    rename = require('gulp-rename'),
    gulpIgnore = require('gulp-ignore');



gulp.task('typescript', () => {
    const project = tsc.createProject('tsconfig.json', {
        declaration: true
    });

    var tsResult = gulp.src(['src/**/*.ts'])
        .pipe(project());

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('lib')),
        tsResult.js
        .pipe(gulpIgnore.exclude('**/parser.js')).pipe(gulp.dest('lib'))
    ]);
});

gulp.task('build:test', () => {
    const project = tsc.createProject('tsconfig.json', {
        declaration: true
    });

    var tsResult = gulp.src(['test/**/*.ts'])
        .pipe(project());

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('lib')),
        tsResult.js
        .pipe(gulp.dest('test'))
    ]);
})

gulp.task('grammar', () => {

    return merge([
        gulp.src('./grammars/ceveral.pegjs')
        .pipe(peg())
        .pipe(rename("parser.js"))
        .pipe(gulp.dest('lib')),
        gulp.src('./grammars/options.pegjs')
        .pipe(peg())
        .pipe(rename('parser.js'))
        .pipe(gulp.dest('lib/options'))

    ])
});

gulp.task('build', ['grammar', 'typescript']);

gulp.task('watch', () => {
    gulp.watch(['src/**/*.ts'], ['typescript']);
    gulp.watch(['test/src/**/*.ts'], ['build:test']);
    gulp.watch(['grammar/*.pegjs'], ['grammar'])
})


gulp.task('default', ['build', 'build:test'])