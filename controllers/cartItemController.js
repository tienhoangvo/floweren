const CartItem = require('./../models/cartItemModel');
const Cart = require('./../models/cartModel');
const AppError = require('./../utils/appError');
const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.addToCart = catchAsync(
  async (req, res, next) => {
    // 1) Check if user has a cart or not
    let cart = req.user.carts[0];
    console.log('Current user cart', cart);
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
      });

      console.log('New user cart', cart);
    }

    const updateObject = req.body.quantity
      ? { quantity: req.body.quantity }
      : { $inc: { quantity: 1 } };
    let cartItem = await CartItem.findOneAndUpdate(
      {
        cart: cart._id,
        product: req.params.productId,
      },
      updateObject,
      {
        runValidators: true,
        new: true,
      }
    );

    if (!cartItem) {
      cartItem = await CartItem.create({
        cart: cart._id,
        product: req.params.productId,
        quantity: req.body.quantity
          ? req.body.quantity
          : 1,
      });
    }

    return res.status(201).json({
      status: 'success',
      data: cartItem,
    });
  }
);

exports.deleteFromCart = catchAsync(
  async (req, res, next) => {
    const cart = await CartItem.findByIdAndDelete(
      req.params.cartItemId
    );

    if (!cart) {
      return next(
        new AppError(
          'No cart found with that Id',
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

exports.getAllCartItems = getAll(CartItem, [
  'cart',
  'product',
]);

exports.createCartItem = createOne(CartItem, [
  'cart',
  'product',
]);

exports.getCartItem = getOne(
  CartItem,
  'product',
  ['cart', 'product']
);

exports.updateCartItem = updateOne(CartItem, [
  'cart',
  'product',
]);

exports.deleteCartItem = deleteOne(CartItem, [
  'cart',
  'product',
]);
