const router = require('express').Router({
  mergeParams: true,
});

const {
  getAllOrderItems,
  createOrderItem,
  getOrderItem,
  updateOrderItem,
  deleteOrderItem,
} = require('../controllers/orderItemController');

const {
  restrictTo,
  protect,
} = require('../controllers/authController');

router.use(
  protect,
  restrictTo('admin', 'employee')
);

router
  .route('/')
  .get(getAllOrderItems)
  .post(createOrderItem);

router
  .route('/:id')
  .get(getOrderItem)
  .patch(updateOrderItem)
  .delete(deleteOrderItem);

module.exports = router;
