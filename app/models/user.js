const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  }, 
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('user', UserSchema);
