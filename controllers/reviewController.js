const Review = require('./../models/reviewModel');

const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require('./../controllers/handlerFactory');

exports.getAllReviews = getAll(Review, [
  'user',
  'product',
]);

exports.createReview = createOne(Review, [
  'user',
  'product',
]);

exports.getReview = getOne(Review, [
  'user',
  'product',
]);

exports.updateReview = updateOne(Review, [
  'user',
  'product',
]);

exports.deleteReview = deleteOne(Review, [
  'user',
  'product',
]);
