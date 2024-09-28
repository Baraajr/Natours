const express = require('express');
const userControllers = require('../controllers/userControllers');
const authControllers = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.get('/logout', authControllers.logout);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.use(authControllers.protect); // all routes that comes after that will be protected

router.patch('/updateMyPassword', authControllers.updatePassword);
router.patch(
  '/updateMe',
  userControllers.uploadUserPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe,
);
router.delete('/deleteMe', userControllers.deleteMe);
router.get('/me', userControllers.getMe, userControllers.getUser);

router.use(authControllers.restrictTo('admin'));
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(
    authControllers.restrictTo('admin', 'lead-guide'),
    userControllers.createUser,
  );
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

// POST /tour/2d64d1df56/reviews

module.exports = router;
