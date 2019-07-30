import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: { msg: 'Invalid email address!' },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
        return value;
      },
      validate: {
        len: {
          args: [6, +Infinity],
          msg: 'Create a password above 6 symbols!',
        },
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  });
  return User;
};
