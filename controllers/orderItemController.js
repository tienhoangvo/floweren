const OrderItem = require('../models/orderItemModel');
const {
  getAll,
  getOne,
  updateOne,
  createOne,
  deleteOne,
} = require('./handlerFactory');

exports.getAllOrderItems = getAll(OrderItem, [
  'order',
  'product',
]);

exports.createOrderItem = createOne(OrderItem, [
  'order',
  'product',
]);

exports.getOrderItem = getOne(
  OrderItem,
  undefined,
  ['order', 'product']
);

exports.updateOrderItem = (req, res) => {
  res.status(400).json({
    error: 'error',
    message: 'You cannot update order item',
  });
};

exports.deleteOrderItem = deleteOne(OrderItem, [
  'order',
  'product',
]);
