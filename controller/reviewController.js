const Review = require('./../model/reviewModel');
const factory = require('./handlerFactory');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');

exports.setToursIds = async (req, res, next) => {
  try {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    const tour = await Tour.findById(req.params.tourId);
    const user = await User.findById(req.user.id);
    if (!tour || !user) {
      throw new Error('please enter a valid Tour or User ID');
    }
    next();
  } catch (error) {
    res.status(422).json({
      error: error.message,
    });
  }
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
