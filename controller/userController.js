const { findById, findByIdAndUpdate } = require('../model/tourModel');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.NewUpdate = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const filteredBody = filterObj(req.body, 'name', 'email');
      const upuser = await User.findByIdAndUpdate(user.id, filteredBody, {
        new: true,
        runValidators: true,
      });

      if (!upuser.email) {
        throw new Error('Provide a validate email data');
      }
      res.status(200).json({
        status: 'success',
        data: {
          upuser,
        },
      });
    } else {
      const newuser = await User.create(req.body);
      if (!newuser) {
        throw new Error('Please provide valid data');
      }
      res.status(201).json({
        status: 'success',
        data: {
          newuser,
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
// filtering fields which are allowed to upadte
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = async (req, res, next) => {
  try {
    if (req.user.password || req.body.password) {
      throw new Error(
        'This route is not for password updates. Please use /updatePassword'
      );
    }
    // 2) passed fields are only allowed to update
    const filteredBody = filterObj(req.body, 'name', 'email');

    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      throw new Error('Please provide a validate data');
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// this api endpoints access only to admin
exports.AllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
