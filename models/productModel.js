const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const productSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [
        true,
        'A product must have a name.',
      ],
      trim: true,
      minlength: [
        1,
        'A product must have more or equal than 1 character',
      ],
      maxlength: [
        150,
        'A product must have less or equal than 50 characters',
      ],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [
        true,
        'A product must belong to a category',
      ],
    },
    price: {
      type: Number,
      default: 0,
      min: [
        0,
        'Price must be greater or equal to 0',
      ],
      required: [
        true,
        'A product must have a price',
      ],
    },
    discount: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      min: 0,
      required: [true, 'A product'],
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    avgRatings: {
      type: Number,
      default: 5.0,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      default: '/img/products/default.jpg',
    },
    images: {
      type: [String],
      default: [
        '/img/products/default-gallery-1.jpg',
        '/img/products/default-gallery-2.jpg',
        '/img/products/default-gallery-3.jpg',
        '/img/products/default-gallery-4.jpg',
      ],
    },
    description: {
      type: String,
      default: 'Description has not defined yet',
    },
    slug: String,
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

// DOCUMENT MIDDLEWARES
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// VIRTUAL POPULATIONS
productSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'product',
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.statics.calcStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSoldQuantity: {
          $sum: '$soldQuantity',
        },
      },
    },
  ]);

  return stats;
};

// QUERY MIDDLEWARES
productSchema.pre(/^find/, function (next) {
  this.populate('category', 'name');
  next();
});

productSchema.pre('findOneAndUpdate', function (
  next
) {
  const newName = this._update.name;
  const additionalUpdates = newName
    ? {
        updatedAt: Date.now(),
        slug: slugify(newName, {
          lower: true,
        }),
      }
    : { updatedAt: Date.now() };

  this.set(additionalUpdates);

  next();
});

productSchema.index({ name: 'text' });

const Product = model('Product', productSchema);
module.exports = Product;
