const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exchangeSchema = new Schema({
  base: {
    type: String,
    require: true
  },
  data: {
    time: {
      type: Number,
      require: true
    },
    eur: {
      type: Number,
      require: true
    },
    rub: {
      type: Number,
      require: true
    },
    chf: {
      type: Number,
      require: true
    },
    jpy: {
      type: Number,
      require: true
    }
  },
  history: {
    type: Array
  }
});

mongoose.model("exchanges", exchangeSchema);
