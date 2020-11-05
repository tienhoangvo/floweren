const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAll = (Model, parents = undefined) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (parents)
      parents.forEach((parent) => {
        if (req.params[parent])
          filter[parent] = req.params[parent];
      });

    const features = new APIFeatures(
      Model.find(filter),
      req.query
    )
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      page: features.page,
      limit: features.limit,
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.createOne = (
  Model,
  parents = undefined
) =>
  catchAsync(async (req, res, next) => {
    let parentIds = {};
    if (parents)
      parents.forEach((parent) => {
        if (req.params[parent])
          parentIds[parent] = req.params[parent];
      });
    const docObj = { ...req.body, ...parentIds };
    const newDoc = await Model.create(docObj);

    res.status(201).json({
      status: 'success',
      data: { data: newDoc },
    });
  });

exports.getOne = (
  Model,
  popOptions,
  parents = undefined
) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (parents)
      [...parents].forEach((parent) => {
        if (req.params[parent])
          filter[parent] = req.params[parent];
      });
    const doc = await Model.findOne(
      filter
    ).populate(popOptions);

    if (!doc) {
      return next(
        new AppError(
          'No document found with that Id',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateOne = (
  Model,
  parents = undefined
) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (parents)
      parents.forEach((parent) => {
        if (req.params[parent])
          filter[parent] = req.params[parent];
      });

    const doc = await Model.findOneAndUpdate(
      filter,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError(
          'No document found with that Id',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (
  Model,
  parents = undefined
) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (parents)
      parents.forEach((parent) => {
        if (req.params[parent])
          filter[parent] = req.params[parent];
      });

    const doc = await Model.findOneAndDelete(
      filter
    );

    if (!doc) {
      return next(
        new AppError(
          'No document found with that Id',
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
