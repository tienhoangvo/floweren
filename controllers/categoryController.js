const multer = require('multer');
const slugify = require('slugify');
const cloudinary = require('./../config/cloundinary');
const Category = require('../models/categoryModel');

const {
  getAll,
  getOne,
  deleteOne,
} = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const fileName = `categories-${
      req.params.id
        ? req.params.id
        : slugify(req.body.name, { lower: true })
    }-${Date.now()}`;
    cb(null, fileName);
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

exports.uploadImageCover = upload.single(
  'imageCover'
);

exports.getAllCategories = getAll(Category);

exports.createCategory = catchAsync(
  async (req, res, next) => {
    if (req.file) {
      var uploadInfo = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: req.file.filename,
          folder: '/floweren/categories/',
        }
      );

      const imageCover = uploadInfo.secure_url.replace(
        '/upload/',
        '/upload/t_category_imageCover/'
      );

      req.body.imageCover = imageCover;
    }

    const category = await Category.create(
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: category,
    });
  }
);

exports.getCategory = getOne(
  Category,
  'products'
);

exports.updateCategory = catchAsync(
  async (req, res, next) => {
    if (req.file) {
      var uploadInfo = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: req.file.filename,
          folder: '/floweren/categories/',
        }
      );

      const imageCover = uploadInfo.secure_url.replace(
        '/upload/',
        '/upload/t_category_imageCover/'
      );

      req.body.imageCover = imageCover;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: category,
    });
  }
);

exports.deleteCategory = deleteOne(Category);
