const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
//const APIfeature = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

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

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  //cover image
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);
  req.body.imageCover = imageCoverFileName;
  //console.log(req.files);

  //images
  // the async inside the map will return promises so we need to use Promise.all
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );
  next();
};

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image'); // to upload one image
// upload.array('images', 5); // to upload array of photos with maximum of 5

// this was for testing
// const toursData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
//param middleware in case of invalid id
// exports.checkId = (req, res, next, val) => {
//   console.log(`the id is:  ${val}`);
//   if (req.params.id * 1 > toursData.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };
// TODO:video 64 chaining middleware function : middleware Function is the callback function
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'Bad request',
//       message: 'name and price are required',
//     });
//   }
//   next();
// };
// TODO: callback functions

// exports.getAllTours = (req, res) => {
//   // we should specify the api version

//   res.status(200).json({
//     status: 'success',
//     // data: {
//     //   requestedAt: req.requestTime,
//     //   result: toursData.length,
//     //   tours: toursData,
//     // },
//   });
// };

//exports.getTour = (req, res) => {
// now y is optional params (/:id/:y?)  TODO:
//const id = req.params.id * 1;
// const tour = toursData.find((ele) => ele.id === id);
// console.log(req.params);
// res.status(200).json({
//   status: 'success',
//   data: {
//     tours: tour,
//   },
// });
//};
// exports.createTour = (req, res) => {
// console.log(req.body); // we used this coz we used middleware otherwise will be undefined
// const newId = toursData[toursData.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// toursData.push(newTour);
// fs.writeFile(
//   `${__dirname}/../dev-data/data/tours-simple.json`,
//   JSON.stringify(toursData),
//   (error) => console.log('new tour created'),
// );
// res.status(201).json({
//   status: 'success',
//   data: {
//     tour: newTour,
//   },
// }); // 201 => created
// };

//another way to create a tour

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: 'updated tour here',
//     },
//   });
// };
// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     //204 no content
//     status: 'success',
//     data: null,
//   });
// };

// vid 98 alias function
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// now we do the operations on the database not the json file

//	We use async await coz Tour.create().then().catch() is a promise
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //try {
//   // to exclude the special fields like page and sort etc TODO:
//   // creating a copy of the the req.query
//   // difference between the query object and the mongodb filter object
//   //{ duration: {$gte:5}, difficulty: 'easy' }
//   //{ duration: {gte:'5'}, difficulty: 'easy' }
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((ele) => {
//   //   delete queryObj[ele];
//   // });
//   // //////////////////// video 94 advanced filtering    TODO:
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`);
//   // //this is traditional
//   // let query = Tour.find(JSON.parse(queryStr));

//   /////////////////////////// sorting   //////////////////TODO:
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('name');
//   // }
//   // limiting fields
//   // projecting
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v'); // the minus means excludes
//   // }
//   //////////// video 97
//   // ////////////////////////////////pagination////////////////TODO:
//   // query.skip(2) means skip 2 results before querying
//   // query.limit(10) means limit to 10
//   //page=2&limit=10 from1 to 10 for page 1 and 11 to 20 for page 2 so we skip 10 results
//   // query = query.skip(10).limit(10)
//   // const page = req.query.page * 1 || 1; // Default to page 1 if not provided
//   // const limit = req.query.limit * 1 || 100; // Default to limit 3 if not provided
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);
//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) {
//   //     throw new Error("this page doesn't exist");
//   //   }
//   // }

//   // using mongoose methods to create a query //////TODO:
//   // const allTours =  Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   const features = new APIfeature(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate(); // we only can chain because we return the object in each methodTODO:
//   const allTours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     result: allTours.length,
//     data: {
//       tours: allTours,
//     },
//   });
// });
//	We use async await coz Tour.create().then().catch() is a promiseTODO:
// exports.getTour = catchAsync(async (req, res, next) => {
//   //const tour = await Tour.findById(req.params.id).populate('guides');
//   //we can use populate this way
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   // Tour.findOne({_id: req.params.id})
//   if (!tour) {
//     //throw new AppError('tour not found', 404);
//     return next(new AppError('tour not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
// We use async await coz Tour.create().then().catch() is a promiseTODO:
// exports.createTour = catchAsync(async (req, res, next) => {
//   //try {
//   // creating a document : it looks like we create an object from a function constructor
//   // const testTour = new Tour({
//   //   name: 'The Park Camper',
//   //   price: 997,
//   // });

//   // this is a promise we can consume and this will save the document to DB
//   // testTour
//   //   .save()
//   //   .then((doc) => console.log(doc))
//   //   .catch((err) => console.log(err.message));

//   // another way to create a tour

//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
//We use async await coz Tour.create().then().catch() is a promiseTODO:
// exports.updateTour = catchAsync(async (req, res, next) => {
//   //try {
//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // new : true means returning the updated tour
//     runValidators: true,
//   });

//   if (!updatedTour) {
//     //throw new AppError('tour not found', 404);
//     return next(new AppError('tour not found', 404)); // we used return to end function
//     // if the function continues an error will originate coz of sending two responses
//   }

//   res.status(200).json({
//     status: 'success',
//     updatedTour,
//   });

// }); //We use async await coz Tour.create().then().catch() is a promiseTODO:
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   //try {
//   const deletedTour = await Tour.findByIdAndDelete(req.params.id);

//   if (!deletedTour) {
//     //throw new AppError('tour not found', 404);
//     return next(new AppError('tour not found', 404)); // we used return to end function
//     // if the function continues an error will originate coz of sending two responses
//   }

//   res.status(200).json({
//     status: 'deleted',
//   });
// });

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// vid 100
//aggregation
exports.getTourStats = catchAsync(async (req, res, next) => {
  //try {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    }, // stage 1
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // group by difficulty

        //_id: '$ratingsAverage', // group by rating
        // null means we need te group
        num: { $sum: 1 }, // add 1 to sum when we get a match
        numRatings: { $sum: '$ratingsQuantity' }, // the sum of ratingsQuantity
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    }, // stage 2
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
    // this means we can match again
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    }, //if we have a field with array of 3 elements this will make 3 documents for each element
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'please provide the latitude and longitude in format lat,lng ',
        400,
      ),
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'please provide the latitude and longitude in format lat,lng ',
        400,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, //to get distances in km
      }, //need to be the first stage and need a field with geospatial index
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
