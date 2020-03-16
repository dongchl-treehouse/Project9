'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // userId: {
    //     type: Sequelize.INTEGER,
    // },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Oooops! Title is required',
          },
          notEmpty: {
            msg: 'Oooops! Title is required',
          },
        },
    },
    description: {
      type:Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Oooops! Description is required',
        },
        notEmpty: {
          msg: 'Oooops! Description is required',
        },
      },
    },
    
    estimatedTime: {
      type:Sequelize.STRING,
      allowNull: true,
  
    }, 

    materialsNeeded: {
      type:Sequelize.STRING,
      allowNull: true,
  
    }, 

 }, { sequelize });

 Course.associate = function(models) {
    Course.belongsTo(models.User, {
      as: 'selector',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
 }


  return Course;
};

