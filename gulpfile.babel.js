import gulp from 'gulp';
import repl from 'repl';
import container from './container';
import getServer from '.';

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 4000, cb);
});

gulp.task('console', () => {
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});
