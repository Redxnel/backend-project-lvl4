import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
import { TaskStatus } from '../models'; // eslint-disable-line

export default (router) => {
  router
    .get('statuses#index', '/statuses', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const taskStatuses = await TaskStatus.findAll();
      const taskStatus = await TaskStatus.build();
      ctx.render('statuses', { f: buildFormObj(taskStatus), taskStatuses, userId });
    })
    .post('statuses#create', '/statuses', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const { request: { body: form } } = ctx;
      const taskStatus = await TaskStatus.build(form.form);
      const taskStatuses = await TaskStatus.findAll();
      try {
        await taskStatus.save();
        ctx.flash.set(ctx.t('flash-messages:statuses.create'));
        ctx.redirect(router.url('statuses#index'));
      } catch (err) {
        ctx.render('statuses', { f: buildFormObj(taskStatus, err), taskStatuses, userId });
      }
    })
    .get('statuses#edit', '/statuses/:id/edit', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      ctx.render('statuses/edit', { f: buildFormObj(taskStatus), userId });
    })
    .patch('statuses#update', '/statuses/:id', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      try {
        await taskStatus.update(form.form);
        ctx.flash.set(ctx.t('flash-messages:statuses.update'));
        ctx.redirect(router.url('statuses#index'));
      } catch (error) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(taskStatus, error), taskStatuses });
      }
    })
    .delete('statuses#destroy', '/statuses/:id', checkAuth, async (ctx) => {
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      try {
        await taskStatus.destroy();
        ctx.flash.set(ctx.t('flash-messages:statuses.destroy'));
        ctx.redirect(router.url('statuses#index'));
      } catch (error) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(taskStatus, error), taskStatuses });
      }
    });
};
