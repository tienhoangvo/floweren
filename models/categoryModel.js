const { Schema, model } = require('mongoose');

const slugify = require('slugify');

const categorySchema = new Schema(
  {
    name: {
      required: [
        true,
        'A category class must have a name',
      ],
      type: String,
      unique: true,
      trim: true,
      minlength: [
        1,
        'A category name must have more or equal than 1 characters',
      ],
      maxlength: [
        150,
        'A category name must have less or equal than 150 characters',
      ],
    },
    slug: String,
    imageCover: {
      type: String,
      default: '/img/categories/default.jpg',
    },
    description: {
      required: [
        true,
        'A category must have a description',
      ],
      type: String,
      trim: true,
      minlength: [
        1,
        'A category description must have more or equal than 1 characters',
      ],
      maxlength: [
        300,
        'A category description must have less or equal than 300 characters',
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

// DOCUMENT MIDDLEWARES
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  console.log(this.slug);
  next();
});

categorySchema.pre('findOne', function (next) {
  console.log('FROM PRE FINDONE', this);
  this.populate('products');
  next();
});

// QUERY MIDDLEWARES
categorySchema.pre('findOneAndUpdate', function (
  next
) {
  const name = this._update.name;
  const additionalUpdates = name
    ? {
        slug: slugify(name, {
          lower: true,
        }),
        updatedAt: Date.now(),
      }
    : { updatedAt: Date.now() };

  this.set(additionalUpdates);

  next();
});

const Category = model(
  'Category',
  categorySchema
);

module.exports = Category;
