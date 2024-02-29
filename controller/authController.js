const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // set cookie
  res.cookie('jwt', token, cookieOptions);
  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//signup
exports.signUp = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new Error('duplicate email 📨');
    } else {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });
      if (!newuser) {
        throw new Error('Please provide valid email or name');
      }
      const token = signToken(newUser);

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      res.cookie('jwt', token, cookieOptions);

      newUser.password = undefined;

      res.status(201).json({
        status: 'success',
        data: {
          newUser,
        },
      });
    }
  } catch (error) {
    res.status(422).json({
      error: error.message,
    });
  }
};

//LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Please provide  email or password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Please provide Valid email ');
    }
    const isPassCorrect = await user.correctPassword(password, user.password);

    if (!isPassCorrect) {
      throw new Error('Please provide Valid password');
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new Error(
        'you are not logged in! Please login in to get the access'
      );
    }

    // validate
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decode); { id: '65d984f44b3001e6777fed34', iat: 1709056722, exp: 1716832722 }

    const currentUser = await User.findById(decode.id);
    if (!currentUser) {
      throw new Error('the user belonging to this token no longer exitss ');
    }

    if (currentUser.changedPasswordAfter(decode.iat)) {
      throw new Error('User recently changed password !Please login again');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    try {
      if (!role.includes(req.user.role)) {
        throw new Error('You dont have permission to perform this action ⚠️⚠️');
      }
      next();
    } catch (error) {
      res.status(403).json({
        error: error.message,
      });
    }
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('Please provide Valid email ');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3000/api/v1/users/resetPassword/${resetToken}`;

    const message = `If you forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\n If you didn't forget your password , please ignore this email !`;

    try {
      sendEmail({
        email: user.email,
        subject: 'Your password reset token valid for 10 min  ',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'token sent to email ',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email . Try again later!',
          500
        )
      );
    }
  } catch (error) {
    res.status(422).json({
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error('Token is invalid or expired');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      throw new Error('Your current password is wrong');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordChangeAt = Date.now();
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};
