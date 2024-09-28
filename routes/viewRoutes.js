const express = require('express');
const viewControllers = require('../controllers/viewControllers');
const authControllers = require('../controllers/authController');
const bookingsControllers = require('../controllers/bookingControllers');

const router = express.Router();

// vid 179
//overview page
router.get('/', authControllers.isLoggedIn, viewControllers.getOverview);

// tour details page
router.get('/tour/:slug', authControllers.isLoggedIn, viewControllers.getTour);

// login form
router.get('/login', authControllers.isLoggedIn, viewControllers.getLoginForm);

// sign up form
router.get(
  '/signup',
  authControllers.isLoggedIn,
  viewControllers.getRegisterForm,
);

// account page
router.get('/me', authControllers.protect, viewControllers.getAccount);
router.get(
  '/my-tours',
  bookingsControllers.createBookingCheckout,
  authControllers.protect,
  viewControllers.getMyTours,
);

// updating the user data in the account page
router.post(
  '/submit-user-data',
  authControllers.protect,
  viewControllers.updateUserData,
);

module.exports = router;
