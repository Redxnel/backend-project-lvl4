export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Create a task name!' },
      },
    },
    description: DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'The status can`t be blank!' },
      },
    },
    creator: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'The task must have an author' },
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'The task must have executor!' },
      },
    },
  }, {
    scopes: {
      creatorId: id => ({
        where: {
          creator: id,
        },
      }),
      statusId: id => ({
        where: {
          status: id,
        },
      }),
      executorId: id => ({
        where: {
          assignedTo: id,
        },
      }),
    },
  });

  Task.associate = (models) => {
    Task.belongsToMany(models.Tag, { through: 'TagTask' });
    Task.belongsTo(models.User, { as: 'Creator', foreignKey: 'creator' });
    Task.belongsTo(models.User, { as: 'Executor', foreignKey: 'assignedTo' });
    Task.belongsTo(models.TaskStatus, { as: 'Status', foreignKey: 'status' });
    Task.addScope('tag', tagName => ({
      include: [
        {
          model: models.Tag,
          where: {
            name: tagName,
          },
        },
      ],
    }));
  };

  return Task;
};
