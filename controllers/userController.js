const multer = require('multer');
const cloudinary = require('./../config/cloundinary');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  for (const prop in obj) {
    if (allowedFields.includes(prop))
      newObj[prop] = obj[prop];
  }

  return newObj;
};

const multerStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(
      null,
      `user-${req.user._id}-${Date.now()}`
    );
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(
      new AppError(
        'Only image files are allowed! ex: jpg|jpeg|png|svg',
        400
      )
    );
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5242880,
  },
});

exports.uploadUserPhoto = upload.single('photo');

exports.getMe = (req, res, next) => {
  if (req.url == '/me') {
    req.params.id = req.user._id;
    return next();
  }

  req.params.user = req.user._id;

  return next();
};
exports.updateMe = catchAsync(
  async (req, res, next) => {
    // 1) Check if POSTed body contains the password field or not
    if (
      req.body.password ||
      req.body.passwordConfirm
    )
      return next(
        new AppError(
          'This route is not password updates. Use /updateMyPassword instead!',
          400
        )
      );

    if (req.file) {
      var uploadInfo = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: req.file.filename,
          folder: '/floweren/users/',
        }
      );
      const imageCover = uploadInfo.secure_url.replace(
        '/upload/',
        '/upload/t_user_photo/'
      );

      req.body.photo = imageCover;
    }
    const filteredBody = filterObj(
      req.body,
      'name',
      'email',
      'photo'
    );
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    // 3) Send the new updatedUser to client
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);

exports.deleteMe = catchAsync(
  async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

exports.redirectCurrentUserUrlById = (
  req,
  res
) => {
  const { url } = req;
  const newUrl = `/api/v1/users${url.replace(
    'me',
    req.user._id
  )}`;

  res.redirect(307, newUrl);
  // return getAllWordLists(req, res, next);
};

exports.getAllUsers = getAll(User);

exports.createUser = createOne(User);

exports.getUser = getOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = catchAsync(
  async (req, res, next) => {
    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: false }
    );

    if (!deletedUser) {
      return next(
        new AppError(
          'Theres no user with that Id',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: deletedUser,
    });
  }
);

exports.getMonthlyCustomers = catchAsync(
  async (req, res, next) => {
    const stats = await User.calcMonthlyCustomers(
      req.params.year
    );

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }
);

exports.compareYearlyCustomers = catchAsync(
  async (req, res, next) => {
    const stats = await User.compareYearlyCustomers(
      req.params.year
    );

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }
);
