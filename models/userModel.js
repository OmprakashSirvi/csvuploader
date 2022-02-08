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
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

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

module.exports = mongoose.model('User', userSchema);
