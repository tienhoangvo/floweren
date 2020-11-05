const router = require('express').Router();

const {
  getHome,
  getProduct,
  getLoginForm,
  getSignupForm,
  getForgotMyPasswordForm,
  getResetMyPasswordForm,
  getProductsByCategory,
  getAccount,
  getMyCart,
  getMyOrders,
  alerts,
} = require('./../controllers/viewController');

router.use(alerts);

const {
  protect,
  isLoggedIn,
} = require('./../controllers/authController');

router.get(
  '/forgot-my-password/',
  getForgotMyPasswordForm
);

router.get(
  '/reset-my-password/:resetPasswordToken',
  getResetMyPasswordForm
);

router.use(isLoggedIn);

router.get('/products/:slug', getProduct);
router.get('/', getHome);
router.get('/categories', getHome);

router.get('/login', getLoginForm);
router.get('/signup', getSignupForm);

router.use(protect);
router.get('/me', getAccount);
// router.get('/my-cart', getMyCart);
// router.get('/my-orders/:id', getMyOrder);
router.get('/my-orders', getMyOrders);
module.exports = router;
