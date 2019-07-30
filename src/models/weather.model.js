const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weatcherSchema = new Schema({
  city: {
    type: String,
    required: true
  },
  degrees: {
    type: Number,
    required: true
  },
  description: {
    //облачно, солнечно, ...
    type: String,
    required: true
  },
  precip: {
    // осадки в процентах 0 10 20
    type: Number,
    required: true
  },
  wind: {
    //ветер
    type: Number,
    required: true
  },
  humidity: {
    //влажность в процентах
    type: Number,
    required: true
  }
});

mongoose.model("weather", weatcherSchema);
