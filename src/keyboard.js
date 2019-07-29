let keyb = require("./keyboard-buttons");
module.exports = {
  home: [[keyb.home.weather, keyb.home.news], [keyb.home.favourite]],
  weather: [[keyb.weather.today, keyb.weather.week], [keyb.back]]
};
