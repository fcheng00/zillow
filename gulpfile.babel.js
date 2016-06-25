import gulp from 'gulp';
import selenium from 'selenium-standalone';
import webdriver from 'gulp-webdriver';

let seleniumServer;


gulp.task('selenium', (done) => {
  selenium.install({logger: console.log}, () => {
    selenium.start((err, child) => {
      if (err) { return done(err); }
      seleniumServer = child;
      done();
    });
  });

});

gulp.task('e2e', ['selenium'], () => {
  return gulp.src('wdio.conf.js')
    .pipe(webdriver()).on('error', () => {
      seleniumServer.kill();
      process.exit(1);
    });
});


gulp.task('test', ['e2e'], () => {
  seleniumServer.kill();
});

gulp.task('home', () => {
  return gulp.src('wdio.conf.js').pipe(webdriver()).on('error', () => {
    process.exit(1);
  });
});



gulp.task('detail', () => {
  return gulp.src('wdio.detail.conf.js').pipe(webdriver()).on('error', () => {
    process.exit(1);
  });
});

