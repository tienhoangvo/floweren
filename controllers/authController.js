const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const Email = require('./../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (
  statusCode,
  user,
  req,
  res
) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    secure:
      req.secure ||
      req.headers['x-forwared-proto'] === 'https',
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = exports.createUser = catchAsync(
  async (req, res, next) => {
    if (req.body.role) req.body.role = undefined;

    const newUser = await User.create(req.body);

    await new Email(
      newUser,
      `${req.protocol}://${req.get('host')}/me`
    ).sendWelcome();

    createSendToken(201, newUser, req, res);
  }
);

exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new AppError(
          'Please provide email and password!',
          400
        )
      );
    }
    const user = await User.findOne({
      email,
    }).select('+password');

    if (
      !user ||
      !(await user.correctPassword(
        password,
        user.password
      ))
    ) {
      return next(
        new AppError(
          'Incorect email or password',
          401
        )
      );
    }

    createSendToken(200, user, req, res);
  }
);

// Only for rendered pages, no errors!
exports.protect = catchAsync(
  async (req, res, next) => {
    console.log('FROM PROTECT', req.url);
    // 1) Getting token and check if it's there
    let token;
    const { authorization } = req.headers;
    if (
      authorization &&
      authorization.startsWith('Bearer')
    ) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access to get access.',
          401
        )
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    // 3) Check if user still exists
    const currentUser = await User.findById(
      decoded.id
    );
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to the token does no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the JWT was issued
    if (
      currentUser.changedPasswordAfter(
        decoded.iat
      )
    ) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(
        decoded.id
      );

      if (!currentUser) {
        return next();
      }

      // 4) Check if user changed password after the JWT was issued
      if (
        currentUser.changedPasswordAfter(
          decoded.iat
        )
      ) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }

  next();
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'You do no have permission to perform this action!',
          403
        )
      );
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1) Check if user with the email exists
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user)
      return next(
        new AppError(
          'There is no user with that email address!',
          404
        )
      );

    // 2) Create a resetToken
    const resetToken = user.createPasswordResetToken();
    await user.save({
      validateBeforeSave: false,
    });

    // 3) Send the resetToken to the user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/reset-my-password/${resetToken}`;

    try {
      await new Email(
        user,
        resetURL
      ).sendPasswordReset();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({
        validateBeforeSave: false,
      });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email!',
    });
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on the token
    const hasedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hasedToken,
      passwordResetTokenExpires: {
        $gt: Date.now(),
      },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user)
      return next(
        new AppError(
          'Token is invalid or has expired!',
          400
        )
      );

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.password = req.body.password;
    user.passwordConfirm =
      req.body.passwordConfirm;
    await user.save();

    // 3) Update passwordChangedAt property for the user

    // 4) Log the user in, send JWT
    res.status(200).json({
      status: 'success',
      message:
        'Successfully update your password!',
    });
  }
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    const {
      passwordCurrent,
      password,
      passwordConfirm,
    } = req.body;

    // 1) Get the user from the collection
    const user = await User.findById(
      req.user._id
    ).select('+password');

    // 2) Compare user.password and passwordCurrent
    if (
      !(await user.correctPassword(
        passwordCurrent,
        user.password
      ))
    )
      return next(
        new AppError(
          'Your current password is wrong',
          401
        )
      );

    // 3) If so, update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(200, user, req, res);
  }
);
