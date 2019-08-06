import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
import { TaskStatus } from '../models'; // eslint-disable-line

export default (router) => {
  router
    .get('statuses', '/statuses', checkAuth, async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const taskStatus = await TaskStatus.build();
      ctx.render('statuses', { f: buildFormObj(taskStatus), taskStatuses });
    })
    .post('addStatus', '/statuses', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const taskStatus = await TaskStatus.build(form.form);
      const taskStatuses = await TaskStatus.findAll();
      const statuses = taskStatuses.map(s => s.name);
      const error = { errors: [] };

      if (statuses.includes(form.form.name)) {
        error.errors.push({ path: 'name', message: 'This status already exists!' });
        ctx.render('statuses', { f: buildFormObj(taskStatus, error), taskStatuses });
        return;
      }

      try {
        await taskStatus.save();
        ctx.flash.set('Status has been created!');
        ctx.redirect(router.url('statuses'));
      } catch (err) {
        ctx.render('statuses', { f: buildFormObj(taskStatus, err), taskStatuses });
      }
    })
    .get('editStatus', '/status/:id/edit', checkAuth, async (ctx) => {
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      ctx.render('statuses/edit', { f: buildFormObj(taskStatus) });
    })
    .patch('editStatus', '/status/:id/edit', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      try {
        await taskStatus.update(form.form);
        ctx.flash.set('Status has been updated!');
        ctx.redirect(router.url('statuses'));
      } catch (error) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(taskStatus, error), taskStatuses });
      }
    })
    .delete('editStatus', '/status/:id/edit', checkAuth, async (ctx) => {
      const taskStatus = await TaskStatus.findByPk(ctx.params.id);
      try {
        await taskStatus.destroy();
        ctx.flash.set('Status has been deleted!');
        ctx.redirect(router.url('statuses'));
      } catch (error) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(taskStatus, error), taskStatuses });
      }
    });
};
