const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'please provide your email address'],
      unique: true,
      isLowercase: true,
      validate: [validator.isEmail, 'please enter a valid email address'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'guide', 'lead-guide'],
      default: 'user',
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    password: {
      type: String,
      required: [true, 'a user must have a password'],
      minlength: [8, 'password must be at least 8 characters long'],
      select: false, // not exposed in the output
    },
    passwordConfirm: {
      type: String,
      required: [true, 'please confirm your password'],
      validate: {
        validator: function (value) {
          return this.password === value;
        }, // only works with create and save
        message: 'passwords do not match',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    PasswordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtual: true },
    toObject: { virtual: true },
  },
);
// hash password before save
userSchema.pre('save', async function (next) {
  // we only need to crypt the password if it's been updated
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // we used await coz it's a promise
  // hash is the asynchronous version

  this.passwordConfirm = undefined; // remove passwordConfirm field to save in db
  // still required to be input but not persisted in the database

  next();
});
// modifying changed at
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // we subtracted 1 sec coz of delay of saving a document;
  next();
});

// this is an instance method that we can use on document like User.correctPassword
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  if (!candidatePassword || !userPassword) {
    throw new Error('Password values cannot be undefined');
  }
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp; // if true then the password has been changed after jwt token was issued
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // creating a random toking
  const resetToken = crypto.randomBytes(32).toString('hex');

  // saving the hashed token into the database
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //console.log({ resetToken }, this.PasswordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};
// to not display the deactivated users
userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
