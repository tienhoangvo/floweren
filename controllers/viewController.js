const catchAsync = require('../utils/catchAsync');
const Product = require('./../models/productModel');
const Order = require('./../models/productModel');
const Cart = require('./../models/cartModel');
const Category = require('./../models/categoryModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'order')
    res.locals.alert =
      "Your order was successful! Please check your email for a confirmation. If your order doesn't show up here immediately, please come back later.";

  next();
};

exports.getHome = catchAsync(
  async (req, res, next) => {
    const products = await Product.find().populate(
      'category',
      'name'
    );
    res.status(200).render('overview', {
      title: 'A Flowers Shop',
      products,
    });
  }
);

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your new account',
  });
};

exports.getProduct = catchAsync(
  async (req, res) => {
    console.log('FROM GET PRODUCT', req.params);
    const product = await Product.findOne({
      slug: req.params.slug,
    }).populate('reviews');

    console.log('FROM GET PRODUCT', product);
    res.status(200).render('product', {
      title: product.name,
      product,
    });
  }
);

exports.getAccount = (req, res) => {
  res.status(200).render('settings', {
    title: 'Account settings',
    user: req.user,
  });
};

exports.getMyOrders = (req, res) => {
  const { orders } = req.user;
  res.status(200).render('myOrders', {
    title: 'My orders',
    orders,
  });
};

exports.getCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  });

  res.status(200).render('myCart', {
    title: 'My cart',
    cart,
  });
});

exports.getMyOrder = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const order = await Order.findOne({
      id,
    });

    res.status(200).render('order', {
      title: `My order | ${order.createdAt.toLocaleString()}`,
      order,
    });
  }
);

exports.getForgotMyPasswordForm = (req, res) => {
  res.status(200).render('forgotMyPassword', {
    title: 'Forgot my password',
  });
};

exports.getResetMyPasswordForm = (req, res) => {
  res.status(200).render('resetMyPassword', {
    title: 'Reset my password',
  });
};
