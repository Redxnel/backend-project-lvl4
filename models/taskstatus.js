export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      unique: { msg: 'This status already exists' },
      validate: {
        notEmpty: { msg: 'Enter status name!' },
      },
    },
  }, {});

  TaskStatus.associate = (models) => {
    TaskStatus.hasMany(models.Task, { foreignKey: 'status', as: 'Tasks' });
  };

  return TaskStatus;
};
