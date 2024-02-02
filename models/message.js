const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 50 },
  text: { required: true, type: String },
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

MessageSchema.virtual("dateFormatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);
