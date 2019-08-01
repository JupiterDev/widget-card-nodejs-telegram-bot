const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new Schema({
  name: {
    type: String,
    require: true
  },
  linkId: {
    type: String,
    require: true
  }
});

mongoose.model("cities", citySchema);
