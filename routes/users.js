import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
import { encrypt } from '../lib/secure';
import { User } from '../models'; // eslint-disable-line

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users', '/users', async (ctx) => {
      const { request: { body: form } } = ctx;
      const user = User.build(form.form);
      const users = await User.findAll();
      const emails = users.map(u => u.email);
      const error = { errors: [] };

      if (emails.includes(form.form.email)) {
        error.errors.push({ path: 'email', message: 'This email already exists!' });
        ctx.render('users/new', { f: buildFormObj({}, error) });
        return;
      }

      try {
        await user.save();
        ctx.flash.set('Your profile has been created');
        ctx.redirect(router.url('root'));
      } catch (err) {
        ctx.flash.set('Something wrong');
        ctx.render('users/new', { f: buildFormObj(user, err) });
      }
    })
    .get('profile', '/users/profile', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/profile', { f: buildFormObj(user) });
    })
    .patch('profile', '/users/profile', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const { request: { body: form } } = ctx;
      const user = await User.findByPk(userId);
      try {
        await user.update(form.form);
        ctx.flash.set('Your profile has been updated');
        ctx.redirect(router.url('profile'));
      } catch (error) {
        ctx.render('users/profile', { f: buildFormObj(user, error) });
      }
    })
    .delete('deleteUser', '/users', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      try {
        await user.destroy();
        ctx.session = {};
        ctx.flash.set('Your profile has been deleted');
        ctx.redirect(router.url('root'));
      } catch (error) {
        ctx.render(router.url('profile'));
      }
    })
    .get('changePassword', '/users/changePassword', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/changePassword', { f: buildFormObj(user) });
    })
    .patch('changePassword', '/users/changePassword', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const { password, newPassword, confirmPassword } = ctx.request.body.form;
      const user = await User.findByPk(userId);
      const error = { errors: [] };

      if (newPassword !== confirmPassword) {
        error.errors.push({ path: 'confirmPassword', message: 'Passwords do not match' });
        ctx.render('users/changePassword', { f: buildFormObj({}, error) });
        return;
      }

      if (user && user.passwordDigest === encrypt(password)) {
        try {
          await user.update({ password: newPassword });
          ctx.flash.set('Yor password has been updated');
          ctx.redirect(router.url('root'));
          return;
        } catch (e) {
          ctx.render('users/changePassword', { f: buildFormObj(user, e) });
        }
      } else {
        error.errors.push({ path: 'password', message: 'Incorrect password!' });
      }
      ctx.render('users/changePassword', { f: buildFormObj({}, error) });
    });
};
