const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Please tell us your name!',
      ],
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

    email: {
      type: String,
      required: [
        true,
        'Please provide your email!',
      ],
      trim: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        'Please provide a valid email',
      ],
      unique: true,
    },
    phone: {
      type: String,
      required: [
        true,
        'Please provide your phone number',
      ],
      validate: [
        validator.isNumeric,
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
      unique: true,
    },
    address: {
      type: String,
      required: [
        true,
        'Please provide your address',
      ],
    },
    city: {
      type: String,
      maxlength: [
        20,
        'A city name must have less or equal to 20 characters long',
      ],
      required: [
        true,
        'Please provide your city name',
      ],
    },
    role: {
      type: String,
      enum: {
        values: [
          'admin',
          'customer',
          'employee',
          'shipper',
        ],
      },
      default: 'customer',
    },
    password: {
      type: String,
      minlength: 8,
      required: [
        true,
        'Please provide a password',
      ],
      trim: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        true,
        'Please provide a passwordConfirm',
      ],
      trim: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: `Passwords are not the same!`,
      },
    },
    photo: {
      type: String,
      default: '/img/users/default.jpeg',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('carts', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
});

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(
    this.password,
    12
  );

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre(/^findOne/, function (next) {
  this.populate('carts orders reviews');
  next();
});

userSchema.pre('findOneAndUpdate', function (
  next
) {
  const additionalUpdates = {
    updatedAt: Date.now(),
  };

  this.set(additionalUpdates);
  next();
});

userSchema.statics.calcMonthlyCustomers = async function (
  year
) {
  const stats = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`01-01-${year}`),
          $lte: new Date(`12-31-${year}`),
        },
        active: true,
        role: 'customer',
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        users: {
          $push: {
            _id: '$_id',
            name: '$name',
            email: '$email',
            phone: '$phone',
            photo: '$photo',
          },
        },
        numberOfUsers: { $sum: 1 },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
  ]);

  return stats;
};

userSchema.statics.compareYearlyCustomers = async function (
  currentYear
) {
  const year = currentYear
    ? currentYear * 1
    : new Date().getFullYear() * 1;
  console.log(year);

  const stats = await this.aggregate([
    { $match: { role: 'customer' } },
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
          count: { $sum: 1 },
          orders: {
            $push: {
              name: '$name',
              email: '$email',
              createdAt: '$createdAt',
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

  console.log(stats);
  growingPercentage =
    stats[0].count !== 0
      ? (stats[1].count - stats[0].count) /
        (stats[0].count * 1.0)
      : 1.0;

  const newStats = { stats, growingPercentage };

  console.log('FROM COMPARING USERS STATS');
  return newStats;
};

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) =>
  await bcrypt.compare(
    candidatePassword,
    userPassword
  );

userSchema.methods.changedPasswordAfter = function (
  initialJWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedPasswordTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return (
      changedPasswordTimestamp >
      initialJWTTimestamp
    );
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto
    .randomBytes(32)
    .toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(
    { resetToken },
    { hashedResetToken: this.passwordResetToken }
  );
  this.passwordResetTokenExpires =
    Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.index({
  name: 'text',
  phone: 'text',
  address: 'text',
  email: 'text',
  role: 'text',
});

const User = model('User', userSchema);

module.exports = User;
