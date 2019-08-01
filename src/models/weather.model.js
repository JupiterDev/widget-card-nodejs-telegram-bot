const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weatcherSchema = new Schema({
  city: {
    type: String
  },
  metcast: {
    current_time: {
      type: Number
    },
    degrees: {
      type: Number
    },
    description: {
      //облачно, солнечно, ...
      type: String
    },
    precip: {
      // осадки в процентах 0 10 20
      type: Number
    },
    wind: {
      //ветер
      type: Number
    },
    humidity: {
      //влажность в процентах
      type: Number
    }
  },
  history: []
});

mongoose.model("weather", weatcherSchema);
