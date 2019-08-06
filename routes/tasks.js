import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
import { Tag, Task, TaskStatus, User } from '../models'; // eslint-disable-line

const parseTags = str => str.toLowerCase()
  .split('#')
  .slice(1)
  .map(s => `#${s.trim()}`);

const findOrCreateTags = async (tags) => {
  const findOrCreate = t => Tag.findOrCreate({ where: { name: t } });
  const result = await Promise.all(tags.map(findOrCreate));
  return result.map(a => a[0]);
};

export default (router) => {
  router
    .get('tasks', '/tasks', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      if (Object.keys(ctx.query).length === 0) {
        const tasks = await Task.findAll({ include: [{ all: true }] });
        ctx.render('tasks', {
          tasks, users, taskStatuses, userId,
        });
        return;
      }

      const scope = [];
      const {
        creator, status, assignedTo, searchTags,
      } = ctx.query;

      if (creator || creator === userId) {
        scope.push({ method: ['creatorId', creator] });
      }
      if (status) {
        scope.push({ method: ['statusId', status] });
      }
      if (assignedTo) {
        scope.push({ method: ['executorId', assignedTo] });
      }
      if (searchTags) {
        const tag = parseTags(searchTags);
        scope.push({ method: ['tag', tag[0]] });
      }

      const tasks = await Task
        .scope(scope)
        .findAll({ include: [{ all: true }] });
      ctx.render('tasks', {
        tasks, users, taskStatuses, userId,
      });
    })
    .get('newTask', '/tasks/new', checkAuth, async (ctx) => {
      const task = await Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .post('tasks', '/tasks', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const { userId } = ctx.session;
      const taskStatus = await TaskStatus.findOne({
        where: {
          name: 'new',
        },
      });
      form.form.creator = userId;
      form.form.status = taskStatus.id;
      const tags = parseTags(form.form.tags);
      const arrTags = await findOrCreateTags(tags);
      const task = await Task.build(form.form);
      try {
        await task.save();
        await task.setTags(arrTags);
        ctx.redirect(router.url('tasks'));
      } catch (error) {
        const taskStatuses = await TaskStatus.findAll();
        const users = await User.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, error), taskStatuses, users });
      }
    })
    .get('editTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const task = await Task.findByPk(ctx.params.id);
      const taskStatuses = await TaskStatus.findAll();
      const users = await User.findAll();
      const tags = await task.getTags();
      const tagsString = tags.map(tag => tag.name).join(' ');
      task.tags = tagsString;
      const executor = await User.findOne({
        where: {
          id: task.assignedTo,
        },
      });
      const currentStatus = await TaskStatus.findOne({
        where: {
          id: task.status,
        },
      });
      ctx.render('tasks/edit', {
        f: buildFormObj(task),
        taskStatuses,
        users,
        executor,
        currentStatus,
      });
    })
    .patch('editTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const tags = parseTags(form.form.tags);
      const arrTags = await findOrCreateTags(tags);
      const task = await Task.findByPk(ctx.params.id);
      try {
        await task.update(form.form);
        await task.setTags(arrTags);
        ctx.redirect(router.url('tasks'));
      } catch (error) {
        const tasks = await Task.findAll({ include: ['Creator', 'Executor', 'Status'] });
        ctx.render('tasks', { f: buildFormObj(task, error), tasks });
      }
    })
    .delete('deleteTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const task = await Task.findByPk(ctx.params.id);
      try {
        await task.destroy();
        ctx.redirect(router.url('tasks'));
      } catch (error) {
        const tasks = await Task.findAll({ include: ['Creator', 'Executor', 'Status'] });
        ctx.render('tasks', { f: buildFormObj(task, error), tasks });
      }
    });
};
