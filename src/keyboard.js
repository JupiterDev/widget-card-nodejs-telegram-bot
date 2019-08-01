let keyb = require("./keyboard-buttons");
module.exports = {
  home: [
    [keyb.home.weather, keyb.home.news],
    [keyb.home.currency, keyb.home.traffic],
    [keyb.home.automatic],
    [keyb.home.settings]
  ],
  weather: [[keyb.weather.today, keyb.weather.week], [keyb.back]],
  settings: [[keyb.settings.city], [keyb.back]]
};
