const router = require('express').Router({
  mergeParams: true,
});
const orderItemRouter = require('./orderItemRoutes');

router.use('/:order/orderItems', orderItemRouter);

const {
  getAllOrders,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  getMonthlyRevenue,
  compareYearlyRevenue,
  getCheckoutSession,
  getCurrentUserOrders,
} = require('../controllers/orderController');

const {
  protect,
  restrictTo,
} = require('../controllers/authController');

router.get(
  '/checkout-session',
  protect,
  getCheckoutSession
);

router.get(
  '/get-my-orders',
  protect,
  getCurrentUserOrders
);

router.use(
  protect,
  restrictTo('admin', 'employee')
);

router.get('/stats', getOrderStats);
router.get(
  '/compare-yearly-revenue/:year',
  compareYearlyRevenue
);

router.get(
  '/monthly-revenue/:year',
  getMonthlyRevenue
);

router
  .route('/')
  .get(getAllOrders)
  .post(createOrder);

router
  .route('/:id')
  .get(getOrder)
  .patch(protect, updateOrder)
  .delete(protect, deleteOrder);

module.exports = router;
