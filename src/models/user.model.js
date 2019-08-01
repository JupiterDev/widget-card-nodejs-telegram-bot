const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  telegramId: {
    type: Number,
    require: true
  },
  city: {
    type: String,
    default: ""
  }
});

mongoose.model("users", userSchema);
