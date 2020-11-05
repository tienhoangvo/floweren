const router = require('express').Router({
  mergeParams: true,
});

const {
  getAllCartItems,
  createCartItem,
  getCartItem,
  updateCartItem,
  deleteCartItem,
  addToCart,
  deleteFromCart,
} = require('../controllers/cartItemController');

const {
  protect,
} = require('../controllers/authController');

router.use(protect);

router.post(
  '/add-to-cart/:productId',
  protect,
  addToCart
);

router.delete(
  '/delete-from-cart/:cartItemId',
  protect,
  deleteFromCart
);

router
  .route('/')
  .get(getAllCartItems)
  .post(createCartItem);

router
  .route('/:id')
  .get(getCartItem)
  .patch(updateCartItem)
  .delete(deleteCartItem);

module.exports = router;
