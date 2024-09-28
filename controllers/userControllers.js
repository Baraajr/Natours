/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
// const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// multer configuration to save image to hard disk but we used cloudinary instead

/*
// multer configuration vid 198
// cb stands for callback
// Set up storage engine
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
});

// to use the buffer before writing the file to storage
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.uploadUserPhoto = upload.single('photo');
*/
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadUserPhoto = upload.single('photo');

// Saving image to Cloudinary directly from buffer
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Convert the buffer to a base64 string
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  // Upload the base64 image directly to Cloudinary
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: 'users',
    public_id: `user-${req.user.id}-${Date.now()}`,
    format: 'jpg',
  });

  req.body.photo = result.secure_url; // Cloudinary URL

  console.log(`Image uploaded to Cloudinary, URL: ${result.secure_url}`);

  next();
});

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400), false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();

//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);

//   next();
// });

// exports.uploadUserPhoto = upload.single('photo');
// // to filter the body
// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });
exports.createUser = (req, res) => {
  res.status(500).json({
    // 500 => error
    status: 'error',
    message: 'this route is not defined. please use signup',
  });
};
//Do not update password with this
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// Update User Information
exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent users from updating their password in this route
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for updating passwords. Use /updateMyPassword.',
        400,
      ),
    );
  }

  // Filter out fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Add the photo URL from Cloudinary (if it exists) to the filtered body
  if (req.body.photo) filteredBody.photo = req.body.photo;

  console.log({ filteredBody });

  // Update the user in the database
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Return the updated user
    runValidators: true, // Run schema validation
  });

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
