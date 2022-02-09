const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'Username already exists'],
  },
  email: {
    type: String,
    unique: [true, 'This mail id is already registered'],
    required: [true, 'A user should provide his/her mail id'],
    lowercase: true,
    validate: [validator.isEmail, 'Give me a valid mail id'],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  password: {
    type: String,
    required: [true, 'Gimme a password'],
    select: false,
  },
  passwordChangedAt : Date
});

/**
 * Here if the req is for saving the user in the database then it will encrypt the password
 * and then save it to the database (used bcrypt module)
 * And if the user is updating the password then it will call next() right away
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

/**
 * 
 * @param {checkPassword} candidatePassword 
 * @param {*} userPassword 
 * @returns boolean 
 * If the password matched it returns true or else false
 */
userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * 
 * @param {changePasswordAfter} JWTTimestamp 
 * @returns boolean
 * If passwordChangedAt not exits then return false
 * else check if the time the token was issued is less than (passwordChangedAt)
 * used in authController.protect
 */
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  // Here if the passwordChangeTime is less than JWTTimestamp, then the token
  //will be invalid
  return false;
  // This means the password is not changed after the creation of token
};

// export the model
module.exports = mongoose.model('User', userSchema);
