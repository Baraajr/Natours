const express = require('express');
const tourControllers = require('../controllers/tourControllers');
const authControllers = require('../controllers/authController');
// const reviewControllers = require('../controllers/reviewControllers');
const reviewRouter = require('./reviewRoutes');
//  creating router
const router = express.Router();

//videos 63
//creating a param moddleware
//router.param('id', tourControllers.checkId);

// we created a new route like so if u want to get all reviews on aspecified tour
//just hit htpp://127.0.0.1:3000/api/v1/tours/:tourId/reviews/
// and the .get('/') will be called
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);
router.route('/tour-stats').get(tourControllers.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/centre/:latlng/:unit')
  .get(tourControllers.getToursWithin);
// we could make it a query string like this
// /tours-within?distance=454&centre=40,65&unit=mil

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour,
  );
router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour,
  )
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );

//Post /tour/54s4fddf/reviews
// router
//   .route('/:tourId/reviews')
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo('user'),
//     reviewControllers.createReview,
//   );

module.exports = router;
