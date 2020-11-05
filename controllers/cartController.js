const Cart = require('../models/cartModel');

const {
  getAll,
  getOne,
  updateOne,
  createOne,
  deleteOne,
} = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyCart = catchAsync(
  async (req, res, next) => {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return next(
        new AppError(
          'Current user has no cart!',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  }
);

exports.getAllCarts = getAll(Cart, ['user']);

exports.createCart = createOne(Cart, ['user']);

exports.getCart = getOne(Cart, 'cartItems', [
  'user',
]);

exports.updateCart = updateOne(Cart, ['user']);

exports.deleteCart = deleteOne(Cart, ['user']);
