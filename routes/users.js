import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
import { encrypt } from '../lib/secure';
import { User } from '../models'; // eslint-disable-line

export default (router) => {
  router
    .get('users#index', '/users', async (ctx) => {
      const users = await User.findAll();
      const { userId } = ctx.session;
      ctx.render('users', { users, userId });
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
      const { request: { body: form } } = ctx;
      const user = User.build(form.form);
      try {
        await user.save();
        ctx.flash.set(ctx.t('flash-messages:profile.create'));
        ctx.redirect(router.url('root'));
      } catch (err) {
        ctx.flash.set('Something wrong');
        ctx.render('users/new', { f: buildFormObj(user, err) });
      }
    })
    .get('profile#edit', '/users/profile/:id/edit', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/profile', { f: buildFormObj(user), userId });
    })
    .patch('profile#update', '/users/profile/:id', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const { request: { body: form } } = ctx;
      const user = await User.findByPk(userId);
      try {
        await user.update(form.form);
        ctx.flash.set(ctx.t('flash-messages:profile.update'));
        ctx.redirect(router.url('profile#update'));
      } catch (error) {
        ctx.render('users/profile', { f: buildFormObj(user, error), userId });
      }
    })
    .delete('profile#destroy', '/users/profile/:id', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      try {
        await user.destroy();
        ctx.session = {};
        ctx.flash.set(ctx.t('flash-messages:profile.destroy'));
        ctx.redirect(router.url('root'));
      } catch (error) {
        ctx.render(router.url('profile#show'));
      }
    })
    .get('password#edit', '/users/settings/:id/edit', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/changePassword', { f: buildFormObj(user), userId });
    })
    .patch('password#update', '/users/settings/:id', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const { password, newPassword, confirmPassword } = ctx.request.body.form;
      const user = await User.findByPk(userId);
      const error = { errors: [] };

      if (!newPassword) {
        error.errors.push({ path: 'newPassword', message: ctx.t('validation:password.newPasswordCreate') });
        ctx.render('users/changePassword', { f: buildFormObj({}, error), userId });
        return;
      }

      if (newPassword !== confirmPassword) {
        error.errors.push({ path: 'confirmPassword', message: ctx.t('validation:password.confirm') });
        ctx.render('users/changePassword', { f: buildFormObj({}, error), userId });
        return;
      }

      if (user && user.passwordDigest === encrypt(password)) {
        try {
          await user.update({ password: newPassword });
          ctx.flash.set(ctx.t('validation:password.update'));
          ctx.redirect(router.url('root'));
          return;
        } catch (e) {
          ctx.render('users/changePassword', { f: buildFormObj(user, e), userId });
        }
      } else {
        error.errors.push({ path: 'password', message: ctx.t('validation:password.wrongPassword') });
      }
      ctx.render('users/changePassword', { f: buildFormObj({}, error), userId });
    });
};
