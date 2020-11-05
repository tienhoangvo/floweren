const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = require('express').Router({
  mergeParams: true,
});

router
  .route('/')
  .get(getAllReviews)
  .post(createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
