const { Schema, model } = require('mongoose');
const Cart = require('./cartModel');
const cartItemSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: [
      true,
      'A cartItem must belong to a cart',
    ],
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [
      true,
      'A cartItem must belong to a product',
    ],
  },
  quantity: {
    type: Number,
    required: [
      true,
      'Please provide the number of items of the product!',
    ],
    min: [
      0,
      'Product quantity must be an unsigned integer number!',
    ],
    validate: [
      Number.isInteger,
      'Please provide an unsigned integer!',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartItemSchema.index(
  { cart: 1, product: 1 },
  { unique: true }
);

cartItemSchema.statics.calcNumberOfProducts = async function (
  cartId
) {
  console.log(this);
  const stats = await this.aggregate([
    { $match: { cart: cartId } },
    {
      $group: {
        _id: null,
        numberOfProducts: { $sum: '$quantity' },
      },
    },
  ]);

  console.log(stats);
  if (stats.length === 0) {
    stats.push({ numberOfProducts: 0 });
  }

  const cart = await Cart.findByIdAndUpdate(
    cartId,
    {
      numberOfProducts: stats[0].numberOfProducts,
    }
  );

  return stats;
};

// QUERY MIDDLEWARES
cartItemSchema.pre(/^find/, function (next) {
  this.populate(
    'product',
    '_id name imageCover price discount description'
  );
  next();
});

cartItemSchema.pre('findOneAndUpdate', function (
  next
) {
  const additionalUpdates = {
    updatedAt: Date.now(),
  };

  this.set(additionalUpdates);
  next();
});

cartItemSchema.post('save', async function (doc) {
  const numberOfProducts = await this.constructor.calcNumberOfProducts(
    this.cart
  );
});

cartItemSchema.post(
  /^findOneAnd/,
  async function (doc) {
    if (doc) {
      const numberOfProducts = await doc.constructor.calcNumberOfProducts(
        doc.cart
      );
    }
  }
);

const CartItem = model(
  'CartItem',
  cartItemSchema
);

module.exports = CartItem;
