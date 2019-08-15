import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models'; // eslint-disable-line

export default (router) => {
  router
    .get('session#new', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session#update', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      const error = { errors: [] };
      if (!user) {
        error.errors.push({ path: 'email', message: ctx.t('validation:user.unknownUser') });
      }

      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.flash.set(ctx.t('flash-messages:sessions.create'));
        ctx.redirect(router.url('root'));
        return;
      }

      error.errors.push({ path: 'password', message: ctx.t('validation:password.wrongPassword') });
      ctx.render('sessions/new', { f: buildFormObj({ email }, error) });
    })
    .delete('session#destroy', '/session', async (ctx) => {
      ctx.session = {};
      ctx.flash.set(ctx.t('flash-messages:sessions.destroy'));
      ctx.redirect(router.url('root'));
    });
};
