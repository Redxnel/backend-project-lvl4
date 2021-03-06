export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: { msg: 'This tag already exists!' },
      validate: {
        notEmpty: true,
      },
    },
  }, {});

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, { through: 'TagTask' });
  };

  return Tag;
};
