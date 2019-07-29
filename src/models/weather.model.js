const mongoose = require("mongoose");
const schema = mongoose.Schema;

const weatcherSchema = new Schema({
  city: {
    type: String,
    required: true
  },
  degrees: {},
  description: {}, //облачно, солнечно, ...
  precip: {}, // осадки в процентах 0 10 20
  wind: {}, //ветер
  humidity: {} //влажность в процентах
});

mongoose.model("weather", weatcherSchema);
