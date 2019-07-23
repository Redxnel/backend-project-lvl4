import path from 'path';
import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import Router from 'koa-router';
import methodOverride from 'koa-methodoverride';
import koaLogger from 'koa-logger';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import bodyparser from 'koa-bodyparser';
import koaWebpack from 'koa-webpack';
import serve from 'koa-static';
import _ from 'lodash';

import webpackConfig from './webpack.config';
import addRoutes from './routes';
import container from './container';

export default () => {
  const app = new Koa();

  const rollbar = new Rollbar('POST_SERVER_ITEM_ACCESS_TOKEN');

  app.keys = ['secretKey'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
    };
    await next();
  });
  app.use(bodyparser());
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(serve(path.join(__dirname, 'public')));

  container.logger(`NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === 'development') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  app.use(koaLogger());
  const router = new Router();
  addRoutes(router, container);
  app
    .use(router.allowedMethods())
    .use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  });

  pug.use(app);

  return app;
};
