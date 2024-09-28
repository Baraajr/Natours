const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

// render the over view page
exports.getOverview = catchAsync(async (req, res, next) => {
  //1)get tour data from collection
  const tours = await Tour.find();

  //2)build template
  // built in the view folder

  //3)render the template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
//  to render the tour details page
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });
  if (!tour) {
    return next(new AppError('there is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

// to render the log in page
exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'log into your account',
  });
});

// to render the account page
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};

// update the user data in the account page
exports.updateUserData = catchAsync(async (req, res, next) => {
  //console.log(req.body);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'your account',
    user,
  });
});

// rendering the sign up form
exports.getRegisterForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'regitser',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2) find tours with returned IDs
  const tourIds = bookings.map((ele) => ele.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'my tours',
    tours,
  });
});
