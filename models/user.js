const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, maxLength: 30, required: true },
  name: { type: String, maxLength: 30, required: true },
  surname: { type: String, maxLength: 30, required: true },
  password: { type: String, required: true },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
