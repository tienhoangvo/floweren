const {
  Schema,
  model,
  Types,
} = require('mongoose');

const AppError = require('./../utils/appError');
const Product = require('./productModel');
const Order = require('./orderModel');

const orderItemSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [
      true,
      'An orderItem must belong to an order',
    ],
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [
      true,
      'An orderItem must belong a product',
    ],
  },
  quantity: {
    type: Number,
    min: [
      0,
      'Quantity must be an unsigned integer!',
    ],
    validate: {
      validator: function (value) {
        return Number.isInteger(value);
      },
      message:
        'Quantity must be an unsigned integer!',
    },
  },
  productQuantity: {
    type: Number,
    validate: {
      validator: function (value) {
        return value >= this.quantity;
      },
      message:
        'The order item quantity must be lesser or equal to the product quantity',
    },
  },
  price: {
    type: Number,
    min: [0, 'Product price must be unsigned!'],
  },
  discount: {
    type: Number,
    min: [
      0,
      'Product discount must be unsigned!',
    ],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderItemSchema.index(
  { order: 1, product: 1 },
  { unique: true }
);

orderItemSchema.statics.calcQuantityOfSoldProducts = async function (
  productId
) {
  console.log(this);
  const soldProductsQuantity = await this.aggregate(
    [
      {
        $match: {
          product: Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: null,
          quantity: { $sum: '$quantity' },
        },
      },
    ]
  );

  await Product.findByIdAndUpdate(
    productId,
    {
      soldQuantity:
        soldProductsQuantity[0].quantity,
    },
    { runValidators: true }
  );
};

orderItemSchema.statics.calcOrderAmount = async function (
  orderId
) {
  const totalAmount = await this.aggregate([
    { $match: { order: orderId } },
    {
      $project: {
        order: '$order',
        total: {
          $multiply: ['$price', '$quantity'],
        },
      },
    },
    {
      $group: {
        _id: '$order',
        amount: { $sum: '$total' },
      },
    },
  ]);

  await Order.findByIdAndUpdate(
    orderId,
    {
      amount: totalAmount[0].amount,
    },
    { runValidators: true }
  );
};

orderItemSchema.pre('validate', async function (
  next
) {
  try {
    var product = await Product.findById(
      this.product
    );
  } catch (err) {
    return next(err);
  }
  if (!product)
    return next(
      new AppError(
        'The product no longer exists!',
        404
      )
    );

  this.price = product.price;
  this.discount = product.discount;
  this.productQuantity = product.quantity;
  next();
});

orderItemSchema.pre('save', async function (
  next
) {
  quantity = this.productQuantity - this.quantity;
  try {
    await Product.findByIdAndUpdate(
      this.product,
      { quantity },
      { runValidators: true }
    );
  } catch (err) {
    return next(
      new AppError(
        'The order quantity cannot be greater than the product quantity!',
        400
      )
    );
  }

  this.productQuantity = undefined;
  next();
});

orderItemSchema.pre(/^findOne/, function (next) {
  this.populate('product');
  next();
});

orderItemSchema.post('save', async function (
  doc
) {
  await this.constructor.calcOrderAmount(
    doc.order
  );

  await this.constructor.calcQuantityOfSoldProducts(
    doc.product._id
  );
});

orderItemSchema.post(
  /^findOneAnd/,
  async function (doc) {
    if (doc) {
      await this.model.calcOrderAmount(doc.order);
      await this.model.calcQuantityOfSoldProducts(
        doc.product
      );
    }
  }
);

const OrderItem = model(
  'OrderItem',
  orderItemSchema
);

module.exports = OrderItem;
