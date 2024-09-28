const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      trim: true,
      unique: true, // not really a validator
      maxlength: [40, 'a tour must have at most 40 characters'],
      minlength: [10, 'a tour must have more than 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   ' name must only contain alphabet characters',
      // ],// it is not usefull coz of the spaces betwwen  the forst hiker TODO:
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'must be either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must be above 1'], // these will work with dates TODO:
      max: [5, 'must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //this will only work on create  and save not updateTODO:
          return value < this.price;
        },
        message: 'Discount price ({value}) must be below the tour price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      select: false, // to hide it // vid 96
      default: Date.now(),
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      // things work different wit embeded objects
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        // things work different wit embeded objects
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    //options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
/////////////////////////////////////vid 102 virtual property //////////////////////////////////////////
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//document middlware runs before the .save() and .create() methods but not inserMany()TODO:
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('this is a before save hook');
//   next();
// });

// we now cann't use this keyword instead we get the doc right like in arguments of the function
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

///////////////////////////////////// query middleware vid 104 ////////////////////////TODO:
// runs before any find queries
//
tourSchema.pre(/^find/, function (next) {
  // /^find/g means any word starts with find
  //tourSchema.pre('find', function (next) {
  // this willl refer to the query which is Tour.find() and we can chain another query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now(); // start of the query

  next();
});

// tourSchema.post('find', function (docs, next) {
//   console.log(`query took ${Date.now() - this.start} ms`);

//   next();
// });

///////////////////////////////// aggregate middleware only runs before aggregation//////TODO:
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });// we made this comment coz we need the geoNear to be the first stage in the pipline

////// imbeding the guides users into tour
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (ele) => await User.findById(ele),
//   );
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// using populating query middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedat',
  });

  next();
});

//tourSchema.index({ price: 1 }); // to create index on the field price
// 1 means ascending
// -1 means  descending

tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index

tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//////////////////////////// creating model//////////////////////////////////////////////TODO:
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
