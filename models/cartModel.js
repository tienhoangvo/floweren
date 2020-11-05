const { Schema, model } = require('mongoose');

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [
        true,
        'A cart must belong to a customer',
      ],
      unique: true,
    },
    numberOfProducts: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

cartSchema.virtual('cartItems', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart',
});

cartSchema.pre('findOneAndUpdate', function (
  next
) {
  const additionalUpdates = {
    updatedAt: Date.now(),
  };

  this.set(additionalUpdates);
  next();
});

cartSchema.pre(/^find/, function (next) {
  this.populate('cartItems');
  next();
});

const Cart = model('Cart', cartSchema);

module.exports = Cart;
