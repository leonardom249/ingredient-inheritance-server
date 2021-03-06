'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Recipe} = require('../models/recipe');
const router = express.Router();
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});



router.get('/recipes', jwtAuth, (req, res, next)=>{
  const userId = req.user.userId;
  let filter = {userId};
  return Recipe.find(filter)
    .then(results=> {
      res.json(results);
    })
    .catch(err=> next(err));
});

router.get('/recipes/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Recipe.findOne({ _id: id, userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});



router.post('/recipes', jsonParser, jwtAuth, (req, res, next) => {
  const requiredFields = ['title', 'ingredients', 'recipe'];
  const missingField = requiredFields.find(field => !(field in req.body));
  const userId = req.user.userId;
  console.log(userId);
  
  if (missingField) {
    const err = new Error(`Missing ${missingField} in request body`);
    err.status = 400;
    return next(err);
  }
  
  let {title, ingredients, recipe} = req.body;  
  
  return Recipe.create({
    title,
    ingredients,
    recipe,
    userId
  })
    .then(result => {
      res.location(`${req.originalUrl}/${result._id}`).status(201).json(result);
    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json(err);
    });
});
  
  
router.put('/recipes/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const { title, ingredients, recipe } = req.body;
  const userId = req.user.userId;
  const updateNote = { title, ingredients, recipe, userId };
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (!ingredients) {
    const err = new Error('Missing `ingredients` in request body');
    err.status = 400;
    return next(err);
  }
  if (!recipe) {
    const err = new Error('Missing `recipe` in request body');
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Recipe.findByIdAndUpdate(id, updateNote, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

router.delete('/recipes/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  Recipe.findOneAndRemove({ _id: id, userId })
    .then(result => {
      if (!result) {
        next();
      }
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;