import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      const error = { errors: [] };
      if (!user) {
        error.errors.push({ path: 'email', message: 'The user is not found' });
      }

      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }

      ctx.flash.set('email or password were wrong');
      error.errors.push({ path: 'password', message: 'Incorrect password' });
      ctx.render('sessions/new', { f: buildFormObj({ email }, error) });
    })
    .delete('sessionDelete', '/session', async (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
