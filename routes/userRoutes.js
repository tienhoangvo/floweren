const router = require('express').Router();
const orderRouter = require('./orderRoutes');
const cartRouter = require('./cartRoutes');
const reviewRouter = require('./reviewRoutes');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
  redirectCurrentUserUrlById,
  uploadUserPhoto,
  getMonthlyCustomers,
  getMyCart,
  addToCart,
  checkOut,
  compareYearlyCustomers,
} = require('../controllers/userController');

const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch(
  '/resetPassword/:token',
  resetPassword
);
router.use(protect);
router.get('/logout', logout);
router.patch('/updateMyPassword', updatePassword);

router.get('/me', getMe, getUser);
router.patch(
  '/updateMe',
  uploadUserPhoto,
  updateMe
);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.get(
  '/get-monthly-customers/:year',
  getMonthlyCustomers
);

router.get(
  '/compare-yearly-customers/:year',
  compareYearlyCustomers
);
router.use('/:user/orders', orderRouter);
router.use('/:user/carts', cartRouter);
router.use('/:user/reviews', reviewRouter);
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
