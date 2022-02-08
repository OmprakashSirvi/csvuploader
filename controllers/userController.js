const fast_csv = require('fast-csv');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signTokenAndSend } = require('./authController');

exports.addUsers = (req, res, next) => {
  const file = fast_csv.parseFile(req.file.path, { headers: true });

  file.on('error', (err) => next(new AppError(err.message, 400)));

  file.on('data', async (doc) => {
    doc = { name: doc.name, email: doc.email, password: doc.password };
    try {
      if (!Object.values(doc).includes('')) {
        const newUser = await User.create(doc);

        signTokenAndSend(newUser._id, res, 200);
      } else res.status(500).json({ status: 'fail', message: 'something went wrong' });
    } catch (err) {
      next(new AppError(err.message, 404));
    }
  });
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users) return next(new AppError('No users found!!', 400));

  res.status(200).json({
    status: 'success',
    length: users.length,
    requestedAt: req.requestTime,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'Found your user!!',
    data: { user },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const me = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'You found yourself!!',
    data: { me },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated!',
    data: { user },
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true, runValidators: true });

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated!',
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {});
