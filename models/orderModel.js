const { Schema, model } = require('mongoose');
const {
  isEmail,
  isNumeric,
} = require('validator');

const Product = require('./productModel');
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: function (value) {
          return (
            value ||
            (this.customerAddress &&
              this.customerEmail &&
              this.customerName &&
              this.customerEmail &&
              this.customerPhone)
          );
        },
        message:
          'Order must belong to a customer',
      },
    },

    customerName: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Your name must have less or equal than 150 characters',
      ],
      minlength: [
        1,
        'Your name must have more or equal than 1 characters',
      ],
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [
        isEmail,
        'Please provide a valid email',
      ],
    },
    customerPhone: {
      type: String,
      validate: [
        isNumeric,
        'Phone number contains only number',
      ],
      minlength: [
        9,
        'Phone number must have at least 9 characters long',
      ],
      maxlength: [
        12,
        'Phone number must have less or equal to 15 characters long',
      ],
    },
    customerAddress: {
      type: String,
    },
    city: {
      type: String,
      maxlength: [
        20,
        'A city name must have less or equal to 20 characters long',
      ],
    },
    status: {
      type: String,
      enum: {
        values: [
          'no-action',
          'accepted',
          'rejected',
          'completed',
        ],
        message:
          'order status is either no-action/accepted/rejected/completed',
      },
      default: 'no-action',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['paid', 'unpaid'],
        message:
          'payment status is either paid/unpaid',
      },

      default: 'unpaid',
    },
    shipmentStatus: {
      type: String,
      enum: {
        values: [
          'no-action',
          'shipping',
          'shipped',
        ],
        messages:
          'shipment status is either no-action/shipping/shipped',
      },
      default: 'no-action',
    },
    amount: { type: Number, default: 0 },
    acceptedAt: Date,
    rejectedAt: Date,
    updatedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({
  name: 'text',
});

orderSchema.index({ user: 1 });

// VIRTUAL POPULATIONS
orderSchema.virtual('orderItems', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order',
});

orderSchema.statics.calcStats = async function () {
  const stats = await this.aggregate([
    {
      $match: {
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$amount' },
      },
    },
  ]);

  return stats;
};

orderSchema.statics.comparingRevenue = async function (
  currentYear
) {
  const year = currentYear
    ? currentYear * 1
    : new Date().getFullYear() * 1;

  const stats = await this.aggregate([
    { $match: { status: 'completed' } },
    {
      $addFields: {
        year: { $year: '$createdAt' },
      },
    },
    {
      $bucket: {
        groupBy: '$year',
        boundaries: [year - 1, year, year + 1],
        default: 'Other',
        output: {
          totalAmount: { $sum: '$amount' },
          orders: {
            $push: {
              order: '$_id',
              createdAt: '$createdAt',
              acceptedAt: '$acceptedAt',
            },
          },
        },
      },
    },
    {
      $addFields: {
        year: '$_id',
      },
    },
  ]);

  growingPercentage =
    stats[0].totalAmount !== 0
      ? (stats[1].totalAmount -
          stats[0].totalAmount) /
        (stats[0].totalAmount * 1.0)
      : 1.0;

  const newStats = { stats, growingPercentage };

  return newStats;
};

// QUERY MIDDLEWARES
orderSchema.pre(/^findOne/, function (next) {
  this.populate('orderItems');
  next();
});

orderSchema.pre('findOneAndUpdate', function (
  next
) {
  const additionalUpdates = {
    updatedAt: Date.now(),
  };

  this.set(additionalUpdates);
  next();
});

orderSchema.post(
  'findOneAndUpdate',
  async function (doc) {
    if (doc) {
      const { orderItems } = doc;

      if (
        doc.status === 'acepted' &&
        !doc.acceptedAt
      ) {
        doc.acceptedAt = Date.now;
        await doc.save();
      }
      if (
        doc.status === 'rejected' &&
        !doc.rejectedAt
      ) {
        for (const orderItem of orderItems) {
          const product = await Product.findById(
            orderItem.product
          );

          product.quantity += orderItem.quantity;
          await product.save();
        }

        doc.rejectedAt = Date.now();

        await doc.save();
      }
    }
  }
);

const Order = model('Order', orderSchema);

module.exports = Order;
