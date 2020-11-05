const stripe = require('./../config/stripe');
const User = require('./../models/userModel');
const Cart = require('./../models/cartModel');
const Order = require('./../models/orderModel');
const OrderItem = require('./../models/orderItemModel');
const catchAsync = require('./../utils/catchAsync');

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory');

exports.getCurrentUserOrders = catchAsync(
  async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      data: req.user.orders,
    });
  }
);

exports.getAllOrders = getAll(Order, ['user']);

exports.createOrder = createOne(Order, ['user']);

exports.getOrder = getOne(Order, undefined, [
  'user',
]);

exports.updateOrder = updateOne(Order, ['user']);

exports.deleteOrder = deleteOne(Order, ['user']);

exports.getOrderStats = catchAsync(
  async (req, res, next) => {
    const stats = await Order.calcStats();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }
);

exports.getMonthlyRevenue = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`01-01-${year}`),
            $lte: new Date(`12-31-${year}`),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          orders: { $push: '$_id' },
          numberOfCompletedOrders: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  }
);

exports.compareYearlyRevenue = catchAsync(
  async (req, res, next) => {
    const year = req.params.year
      ? req.params.year
      : new Date().getFullYear();
    const stats = await Order.comparingRevenue(
      year
    );
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  }
);

exports.getCheckoutSession = catchAsync(
  async (req, res, next) => {
    req.body.user = req.user._id;

    var order = await Order.create({
      user: req.user._id,
      status: 'accepted',
    });
    var cart = await Cart.findOne({
      user: req.user._id,
    });

    var { cartItems } = cart;
    const createOrderItemPromises = cartItems.map(
      (cartItem) =>
        OrderItem.create({
          order: order._id,
          product: cartItem.product,
          quantity: cartItem.quantity,
        })
    );

    const orderItems = await Promise.all(
      createOrderItemPromises
    );

    const lineItems = orderItems.map(
      (orderItem) => ({
        name: orderItem.product.name,
        quantity: orderItem.quantity,
        amount: orderItem.price * 100,
        currency: 'USD',
        images: [
          `${
            orderItem.product.imageCover.startsWith(
              'https'
            )
              ? orderItem.product.imageCover
              : `${req.protocol}://${req.get(
                  'host'
                )}/${
                  orderItem.product.imageCover
                }`
          }`,
        ],
        description:
          orderItem.product.description,
      })
    );

    const currentOrder = await Order.findById(
      order._id
    );

    const session = await stripe.checkout.sessions.create(
      {
        success_url: `${req.protocol}://${req.get(
          'host'
        )}/?alert=order`,
        cancel_url: `${req.protocol}://${req.get(
          'host'
        )}/`,
        payment_method_types: ['card'],
        customer_email:
          req.user.email ||
          currentOrder.customerEmail,
        client_reference_id: currentOrder._id.toString(),
        line_items: lineItems,
        mode: 'payment',
      }
    );
    res.status(201).json({
      status: 'success',
      session,
    });
  }
);

const completeOrderCheckout = async (session) => {
  const orderId = session.client_reference_id;
  await Order.findByIdAndUpdate(orderId, {
    status: 'completed',
    paymentStatus: 'paid',
    shipmentStatus: 'shipped',
    acceptedAt: new Date(),
  });

  const userId = (
    await User.findOne({
      email: session.customer_email,
    })
  )._id;

  await Cart.findOneAndDelete({ user: userId });
};

exports.webhookCheckout = async (
  req,
  res,
  next
) => {
  const signature =
    req.headers['stripe-signature'];

  try {
    var event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res
      .status(400)
      .send(`Webhook error: ${error.message}`);
  }

  if (
    event.type === 'checkout.session.completed'
  ) {
    await completeOrderCheckout(
      event.data.object
    );
  }

  res.status(200).json({ received: true });
};
