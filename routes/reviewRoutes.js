const express = require('express');
const reviewControllers = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

Router.use(authControllers.protect);

Router.route('/')
  .get(reviewControllers.getAllReviews)
  .post(
    authControllers.restrictTo('user'),
    reviewControllers.setTourUserIds,
    reviewControllers.createReview,
  );

Router.route('/:id')
  .get(reviewControllers.getReview)
  .delete(
    authControllers.restrictTo('user', 'admin'),
    reviewControllers.deleteReview,
  )
  .patch(
    authControllers.restrictTo('user', 'admin'),
    reviewControllers.updateReview,
  );

module.exports = Router;
