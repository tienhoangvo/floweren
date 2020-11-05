const router = require('express').Router();
const productRouter = require('./productRoutes');

router.use('/:category/products', productRouter);

const {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImageCover,
} = require('../controllers/categoryController');

const {
  protect,
  restrictTo,
} = require('../controllers/authController');

router
  .route('/')
  .get(getAllCategories)
  .post(
    protect,
    restrictTo('admin', 'employee'),
    uploadImageCover,
    createCategory
  );

router
  .route('/:id')
  .get(getCategory)
  .patch(
    protect,
    restrictTo('admin', 'employee'),
    uploadImageCover,
    updateCategory
  )
  .delete(
    protect,
    restrictTo('admin', 'employee'),
    deleteCategory
  );

module.exports = router;
