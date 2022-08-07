const mongoose = require('mongoose');
const mongooseUserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, 'username is missing'],
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, 'password is missing'],
    },
    refreshToken: {
        type: String,
    },
  });
  
  const UserValidationSchema = {
    username: {
      type: 'string',
      required: true,
      validation: {
        validator: (title) => title.length >= 4 && title.length <= 20,
        msg: 'title must have more than 4 and less than 20 characters.',
      },
    },
    password: {
      type: 'string',
      required: true,
      validation: {
        validator: (details) => details.length >= 7,
        msg: 'details must have more 7 characters.',
      },
    }
  };
  
  const User = mongoose.model('User', mongooseUserSchema);
  
  module.exports.User = User;
  module.exports.UserValidationSchema = UserValidationSchema;
  