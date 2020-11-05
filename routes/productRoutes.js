const router = require('express').Router({
  mergeParams: true,
});

const {
  protect,
  restrictTo,
} = require('../controllers/authController');

const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getProductsStats,
  getTopTenBestSellingProducts,
  getTopTenHighestRatingProducts,
} = require('../controllers/productController');

router
  .route('/')
  .get(getAllProducts)
  .post(
    protect,
    restrictTo('admin', 'employee'),
    uploadProductImages,
    createProduct
  );

router.get(
  '/stats',
  protect,
  restrictTo('admin', 'employee'),
  getProductsStats
);

router.get(
  '/top-ten-best-selling-products',
  getTopTenBestSellingProducts
);

router.get(
  '/top-ten-highest-rating-products',
  getTopTenHighestRatingProducts
);

router
  .route('/:id')
  .get(getProduct)
  .patch(
    protect,
    restrictTo('admin', 'employee'),
    uploadProductImages,
    updateProduct
  )
  .delete(
    protect,
    restrictTo('admin', 'employee'),
    deleteProduct
  );

module.exports = router;
