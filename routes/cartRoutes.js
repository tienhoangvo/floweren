const router = require('express').Router({
  mergeParams: true,
});

const cartItemRouter = require('./cartItemRoutes');
router.use('/:cart/cartItems', cartItemRouter);

const {
  getAllCarts,
  createCart,
  getCart,
  updateCart,
  deleteCart,
  getMyCart,
} = require('../controllers/cartController');

const {
  protect,
  restrictTo,
} = require('../controllers/authController');

router.get('/get-my-cart', protect, getMyCart);

router
  .route('/')
  .get(getAllCarts)
  .post(protect, createCart);

router
  .route('/:id')
  .get(getCart)
  .patch(
    protect,
    restrictTo('admin', 'employee'),
    updateCart
  )
  .delete(
    protect,
    restrictTo('admin', 'employee'),
    deleteCart
  );

module.exports = router;
