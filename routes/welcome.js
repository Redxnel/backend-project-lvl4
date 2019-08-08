import { User } from '../models'; // eslint-disable-line

export default (router) => {
  router.get('root', '/', async (ctx) => {
    if (ctx.state.isSignedIn()) {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('welcome/index', { user, userId });
    } else {
      ctx.render('welcome/index');
    }
  });
};
