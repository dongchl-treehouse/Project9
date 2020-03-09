'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model { }
  
  User = sequelize.define('User');
  
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Oooops! First Name is required',
        },
        notEmpty: {
          msg: 'Oooops! First Name is required',
        },
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Oooops! Last Name is required',
        },
        notEmpty: {
          msg: 'Oooops! Last Name is required',
        },
      },
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Oooops! Password is required',
        },
        notEmpty: {
          msg: 'Oooops! Password is required',
        },
      },
    },

    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Oooops! email Address is required',
        },
        notEmpty: {
          msg: 'Oooops! email Address is required',
        },
      },
    },
  }, { sequelize });


  User.associate = function (models) {
    User.hasMany(models.Course, {
      as: 'selector',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};