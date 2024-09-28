const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIfeature = require('../utils/apiFeatures');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    //try {
    const deletedDoc = await model.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return next(new AppError('tour not found', 404)); // we used return to end function
      // if the function continues an error will originate coz of sending two responses
    }
    res.status(204).json({
      status: 'deleted',
      data: null,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // new : true means returning the updated tour
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('no document found with this id ', 404)); // we used return to end function
      // if the function continues an error will originate coz of sending two responses
    }

    res.status(200).json({
      status: 'success',
      updatedDoc,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    // this to check if we want to populate or not
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    // to allow nested Get reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeature(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(); // we only can chain because we return the object in each method
    const allDocs = await features.query;

    res.status(200).json({
      status: 'success',
      result: allDocs.length,
      data: {
        data: allDocs,
      },
    });
  });
