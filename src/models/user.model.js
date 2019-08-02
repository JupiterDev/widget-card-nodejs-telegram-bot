const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  telegramId: {
    type: Number,
    require: true
  },
  cityId: {
    type: String,
    default: ""
  },
  cityName: {
    type: String,
    default: ""
  }
});

mongoose.model("users", userSchema);
