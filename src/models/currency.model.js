const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currencySchema = new Schema({
  name: {
    type: String,
    require: true
  },
  iso4217: {
    type: String,
    require: true
  }
});

mongoose.model("currencies", currencySchema);
