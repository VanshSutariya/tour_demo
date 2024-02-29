// const AppError = require('./../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const Tour = require('../model/tourModel');

exports.getAll = (Model) => async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
      const tour = await Tour.findById(req.params.tourId);
      if (!tour) {
        throw new Error('Please enter a Valid Tour Id');
      }
    }

    const feature = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await feature.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new Error('No document found with that ID');
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      throw new Error('no document found using that ID ');
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    if (!doc) {
      throw new Error('please enter a valid details ');
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.getOne = (Model) => async (req, res, next) => {
  try {
    let doc = await Model.findById(req.params.id);
    if (!doc) {
      throw new Error('Please enter valid ID');
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) { 
    
    res.status(404).json({
      error: error.message,
    });
  }
};
