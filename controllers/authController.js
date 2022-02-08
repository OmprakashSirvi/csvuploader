const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.signTokenAndSend = (id, res, statusCode) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // If node evirnoment is prod then set the secure to true (it uses https)
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = 'true';
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'You are logged in!',
    token,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Provide valid email or password', 401));

  if (user.active === 'false') user.active === 'true';

  this.signTokenAndSend(user._id, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get the token and check if it exists..
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    // console.log('Token : ', token);
  }

  if (!token) return next(new AppError('You are not permitted to access this', 401));
  // Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // If verification success : Check if user exists..
  const currUser = await User.findById(decoded.id);
  if (!currUser) {
    return next(new AppError('User no longer exists', 401));
  }

  // Check if user changed password after jwt was issued
  if (currUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('the password was changed, login again to cotinue..', 401));
  }

  // Finally granted access to the user..
  req.user = currUser;
  next();
});
