const multer = require('multer');
const slugify = require('slugify');
const cloudinary = require('./../config/cloundinary');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileName = `product-${
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

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.getAllProducts = getAll(Product, [
  'category',
]);

exports.createProduct = catchAsync(
  async (req, res, next) => {
    if (req.params.category)
      req.body.category = req.params.category;
    if (req.files) {
      if (req.files.imageCover) {
        var uploadInfo = await cloudinary.uploader.upload(
          req.files.imageCover[0].path,
          {
            public_id:
              req.files.imageCover[0].filename,
            folder: '/floweren/products/',
          }
        );

        const imageCover = uploadInfo.secure_url.replace(
          '/upload/',
          '/upload/t_product_imageCover/'
        );

        req.body.imageCover = imageCover;
      }

      if (req.files.images) {
        const uploadPromises = req.files.images.map(
          (image) =>
            cloudinary.uploader.upload(
              image.path,
              {
                public_id: image.filename,
                folder: '/floweren/products/',
              }
            )
        );

        const uploads = await Promise.all(
          uploadPromises
        );
        const images = uploads.map((upload) =>
          upload.secure_url.replace(
            '/upload/',
            '/upload/t_product_image/'
          )
        );
        req.body.images = images;
      }
    }

    const product = await Product.create(
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: product,
    });
  }
);

exports.getProduct = getOne(Product, undefined, [
  'category',
]);

exports.updateProduct = catchAsync(
  async (req, res, next) => {
    const updateQuery = { _id: req.params.id };
    if (req.params.category) {
      updateQuery.category = req.params.category;
    }

    if (req.files) {
      if (req.files.imageCover[0]) {
        var uploadInfo = await cloudinary.uploader.upload(
          req.files.imageCover[0].path,
          {
            public_id:
              req.files.imageCover[0].filename,
            folder: '/floweren/products/',
          }
        );

        const imageCover = uploadInfo.secure_url.replace(
          '/upload/',
          '/upload/t_product_imageCover/'
        );

        req.body.imageCover = imageCover;
      }

      if (req.files.images) {
        const uploadPromises = req.files.images.map(
          (image) =>
            cloudinary.uploader.upload(
              image.path,
              {
                public_id: image.filename,
                folder: '/floweren/products/',
              }
            )
        );

        const uploads = await Promise.all(
          uploadPromises
        );
        const images = uploads.map((upload) =>
          upload.secure_url.replace(
            '/upload/',
            '/upload/t_product_image/'
          )
        );
        req.body.images = images;
      }
    }

    const product = await Product.findOneAndUpdate(
      updateQuery,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: product,
    });
  }
);

exports.deleteProduct = deleteOne(Product, [
  'category',
]);

exports.getProductsStats = catchAsync(
  async (req, res, next) => {
    const stats = await Product.calcStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }
);

exports.getTopTenBestSellingProducts = catchAsync(
  async (req, res, next) => {
    const stats = await Product.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      { $sort: { soldQuantity: -1 } },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: 10,
      data: stats,
    });
  }
);

exports.getTopTenHighestRatingProducts = catchAsync(
  async (req, res, next) => {
    const stats = await Product.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      {
        $sort: {
          avgRatings: -1,
          numberOfRatings: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: 10,
      data: stats,
    });
  }
);
