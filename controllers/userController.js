const fast_csv = require('fast-csv');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signTokenAndSend } = require('./authController');

/**
 * 
 * @param {addUser} req 
 * @param {*} res 
 * @param {*} next 
 * It takes uploaded csv (here : public/data)
 * and saves the users to the database
 */
exports.addUsers = (req, res, next) => {
  const file = fast_csv.parseFile(req.file.path, { headers: true });
  // If some error create new AppError
  file.on('error', (err) => next(new AppError(err.message, 400)));
  // If data : 
  file.on('data', async (doc) => {
    doc = { name: doc.name, email: doc.email, password: doc.password };
    try {
      if (!Object.values(doc).includes('')) {
        // Add user to database
        await User.create(doc);
        // send token and login the user
        // signTokenAndSend(newUser._id, res, 200);

      } else res.status(500).json({ status: 'fail', message: 'something went wrong' });
    } catch (err) {
      next(new AppError(err.message, 404));
    }
  });

  res.status(200).json({
    status : 'success',
    message :'All users added'
  })
  
};
/**
 * Get all the users
 */
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
/**
 * get user with the id provided
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'Found your user!!',
    data: { user },
  });
});
/**
 * get current logged in user
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const me = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'You found yourself!!',
    data: { me },
  });
});
/**
 * Update User
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated!',
    data: { user },
  });
});
/**
 * deactivate user
 */
exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true, runValidators: true });

  if (!user) return next(new AppError('No user found !!', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated!',
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) return next(new AppError('User does not exits!!', 404));

  res.status(204).json({
    status : 'success',
    message : 'deleted',
    data : null
  })
});
