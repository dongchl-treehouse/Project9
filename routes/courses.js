const express = require('express');

const router = express.Router();


const { sequelize, models } = require('../db');
const { User, Course } = models;

const auth = require('basic-auth');

const bcryptjs = require('bcryptjs');

const { check, validationResult} = require('express-validator');


// create Authentication Middleware
const authenticateUser = async(req, res, next) => {
    // parse the authorization Header
    const credentials = auth(req);
  
    var message = "";
  
    if (credentials) {
      // attempt to retrieve the user from the data store
      console.log(credentials);
      const user = await User.findOne({ where: {emailAddress: credentials.name}});
      
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
        message = "User not found for username:${user.username}";
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
         next(error);
      }
    }
}
    
// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/', asyncHandler(async(req,res) =>{
    var courses = await Course.findAll( {
        include: [
            {
                model: User,
                as: 'selector',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            }
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    });
    courses = courses.map(c => c.toJSON());
    // console.log(courses);
    res.json(courses);
    res.status(200).end()
}));

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/:id', asyncHandler(async(req,res) =>{
    const course = await Course.findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'selector',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            }
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    });
    res.json(course);
}));

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/',  asyncHandler(async (req, res) => {    
    console.log(req.body);
    try {
      const course = await Course.create(req.body);
      res.status(201).location('/api/courses/${course.id}').end();
    }catch (error) {
        console.log(error);
        if(error.name === 'SequelizeValidationError'){
            const errors = error.errors.map(err => err.message);
            res.status(400).json(errors);
        }else {
            throw error;
        }
    }    
}));
    
// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/:id', authenticateUser, asyncHandler(async (req, res) => {    
    try {
      const course = await Course.findByPk(req.params.id);

      if(req.body.title && req.body.description){
        if(req.currentUser.id == course.userId)
        {
            try {
                await course.update(req.body);
                res.status(204).end();
                     
            } catch (error) {
                if(error.name === 'SequelizeValidationError'){
                    const errors = error.errors.map(err => err.message);
                    res.status(400).json(errors);
                }else {
                    throw error;
                }                
            }
        }
        else{
            res.status(403).json('User is not correct.');

        }
      }
      else{
          res.status(400).json('Title and description are needed.');
      }
    }catch (error) {
      throw error;
    }    
}));

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {    
    try {
        const course = await Course.findByPk(req.params.id);
        if(req.currentUser.id == course.userId)
        {
           await course.destroy();
        }
      }catch (error) {
          console.log(error);
        throw error;
      }
      
      return res.status(204).end();
      
}));
      
module.exports = router
