const { model, Schema } = require('mongoose');
const validator = require('validator');
const Product = require('./productModel');

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: [
        true,
        'A review must belong to a user',
      ],
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      require: [
        true,
        'A review must belong to a product',
      ],
    },

    review: {
      type: String,
      require: [
        true,
        'Please prodvide your review about the product!',
      ],
      maxlength: [
        400,
        'Your review must be lesser or equal to 400 characters long',
      ],
    },
    rating: {
      type: Number,
      max: [
        5,
        'The review rating must be lesser or equal to 5',
      ],
      min: [
        0,
        'The review rating must greater or equal to 0',
      ],
      require: [
        true,
        'Please provide your rating!',
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
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

reviewSchema.index(
  { user: 1, product: 1 },
  { unique: true }
);

reviewSchema.statics.calcAverageRatings = async function (
  productId
) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        avgRatings: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      avgRatings:
        Math.ceil(stats[0].avgRatings * 100) /
        100,
      numberOfRatings: stats[0].numberOfRatings,
    }
  );

  return stats;
};

reviewSchema.pre(/^find/, function (next) {
  this.populate('user', 'name photo');
  next();
});

reviewSchema.pre(/^findOne/, function (next) {
  console.log(this);
  next();
});

reviewSchema.pre(
  'findOneAndUpdate',
  async function (next) {
    this.set({ updatedAt: Date.now() });
    next();
  }
);

reviewSchema.post('save', async function (doc) {
  const avgRatings = await this.constructor.calcAverageRatings(
    this.product
  );
});

reviewSchema.post(/^findOneAnd/, async function (
  doc
) {
  if (doc) {
    const avgRatings = await doc.constructor.calcAverageRatings(
      doc.product
    );
  }
});

const Review = model('Review', reviewSchema);

module.exports = Review;
