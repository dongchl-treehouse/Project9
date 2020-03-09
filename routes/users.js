'use strict';

const express = require('express');

const router = express.Router();

// const sequelize = require('sequelize');
// const User = require('../db/models/Users');
// const Course = require('../db/models/Courses');

const { sequelize, models } = require('../db');
const { User, Course } = models;

const auth = require('basic-auth');

const bcryptjs = require('bcryptjs');

const { check, validationResult} = require('express-validator');
const userValidator = check('name').exists({checkNull:true, checkFalsy:true}).withMessage('Please provide a value for "user"');

// create Authentication Middleware
const authenticateUser = async(req, res, next) => {
  // parse the authorization Header
  const credentials = auth(req);

  var message = "";

  if (credentials) {
    // attempt to retrieve the user from the data store
    // const user = User.find(u => u.username === credentials.name);
    console.log(credentials);

    let user;
    try {
      console.log("start to find one user:" + credentials.name);
      user = await User.findOne({ where: {emailAddress: credentials.name}});
      console.log(user);
    } catch (error) {
      console.log("read user error: " + error);
      throw error;      
    }
    
    if (user) {
      // use bcrytjs npm package to compare user's password
      console.log(credentials.pass);
      console.log(user.password);
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      console.log(authenticated);
      // if the psswords match
      if (authenticated) {
        console.log('authentication successful for username:${user.username}')
        req.currentUser = user;
      }
      else
        message = "Authetication failure for username:${user.username}";
    }
    else {
      message = "User not found for username:${credentials.name}";
    }
  }
  else {
    message = "Auth header not found";
  }

  if (message.length > 0) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  }
  else{
    next();
  }
}

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      //res.status(500).send(error);
       next(error);
    }
  }
}

// Get /api/users 200 -returns the currently authenticated user
router.get('/', authenticateUser, asyncHandler(async(req,res) =>{  
  var user = req.currentUser;
  console.log(user);
  
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
  res.status(200).end()
}));

// Post /api/users 201 - creates a users, sets the Location header to "/", and returns no content

router.post('/', asyncHandler(async (req, res) => {
  // Get the user from the request body.
  const user = req.body;
  // Hashing the password  
  console.log(" new user's original password" + user.password); 
  user.password = bcryptjs.hashSync(user.password);
  console.log(user.password); 
  
  try {
    await User.create(req.body);
  }catch (error) {
    throw error;
  }
  
  // Set the status to 201 Created and end the response.
  return res.status(201).end();
  
}));


module.exports = router