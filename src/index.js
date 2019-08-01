// process.env["NTBA_FIX_319"] = 1;
const telegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const Agent = require("socks5-https-client/lib/Agent");
const config = require("./config");
const helper = require("./helpers");
const keyboard = require("./keyboard");
const buttons = require("./keyboard-buttons");
const database = require("../database.json");

helper.logStart();

mongoose
  .connect(config.DB_URL, {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

require("./models/weather.model");
require("./models/city.model");
require("./models/user.model");

const Weather = mongoose.model("weather");
const City = mongoose.model("cities");
const User = mongoose.model("users");

// database.weather.forEach(w => new Weather(w).save());

// database.city.forEach(c => new City(c).save());

// ===========================================

const bot = new telegramBot(config.TOKEN, {
  polling: true,
  request: {
    agentClass: Agent,
    agentOptions: {
      socksHost: config.proxyIp,
      socksPort: parseInt(config.proxyPort)
      // socksUsername: <username>,
      // socksPassword: <password>
    }
  }
});

bot.on("message", msg => {
  console.log("Working");

  const chatId = helper.getChatId(msg);

  switch (msg.text) {
    case buttons.home.weather:
      bot.sendMessage(chatId, "Выберите период", {
        reply_markup: { keyboard: keyboard.weather }
      });
      break;
    case buttons.weather.today:
      sendWeatherByQuery(chatId, { city: "Москва" });
      break;
    case buttons.weather.week:
      sendWeatherByQuery(chatId, { city: "Казань" });
      break;
    case buttons.home.news:
      break;
    case buttons.home.settings:
      bot.sendMessage(chatId, "Настройки", {
        reply_markup: { keyboard: keyboard.settings }
      });
      break;
    case buttons.settings.city:
      // bot.sendMessage(chatId, "Выберите город", {
      //   reply_markup: { keyboard: keyboard.settings }
      // });
      sendSettingsCities(chatId);
      break;
    case buttons.back:
      bot.sendMessage(chatId, "Что хотите посмотреть?", {
        reply_markup: { keyboard: keyboard.home }
      });
      break;

    //   default:
    //     break;
  }
});

bot.onText(/\/start/, msg => {
  const text = `Здравствуйте, ${msg.from.first_name} ${
    msg.from.last_name
  }\nВыберите команду для начала работы`;

  bot.sendMessage(helper.getChatId(msg), text, {
    reply_markup: {
      keyboard: keyboard.home
    }
  });
});

bot.onText(/\/city_(.+)/, msg => {
  const chatId = helper.getChatId(msg);
  const city = chooseSettingsCity(chatId, msg);
  const text = `Установлен город ${city}`;

  bot.sendMessage(helper.getChatId(msg), text, {
    reply_markup: {
      keyboard: keyboard.home
    }
  });
});

// =================================

function sendHTML(chatId, html, kbName = null) {
  const options = {
    parse_mode: "HTML"
  };

  if (kbName) {
    options["reply_markup"] = {
      keyboard: keyboard[kbName]
    };
  }

  bot.sendMessage(chatId, html, options);
}

function sendWeatherByQuery(chatId, query) {
  Weather.find(query)
    .then(weathers => {
      const html = weathers
        .map((w, i) => {
          return `<b>${i + 1}</b> ${w.city} - /f${w.metcast.degrees}`;
        })
        .join("\n");

      sendHTML(chatId, html, "weathers");
    })
    .catch(err => {
      console.log(`ОШИБКА: ${err}`);
    });
}

function sendSettingsCities(chatId) {
  City.find({})
    .then(cities => {
      const html = cities
        .map((c, i) => {
          return `${i + 1}. ${c.name} /city_${c.linkId}`;
        })
        .join("\n");
      sendHTML(chatId, `<b>Выберите город:</b> \n\n${html}`, "weathers");
    })
    .catch(e => console.log(e));
}

function chooseSettingsCity(chatId, msg) {
  return City.findOne({ linkId: msg.text.replace(/\/city_/, "") })
    .then(ct => {
      // sendHTML(chatId, `Установлен город: ${city.name}`, "weathers");
      // return ct.name;
      setSettingsCity(chatId, ct, msg.from.id);
    })
    .catch(e => console.log(e));
}

function setSettingsCity(chatId, city_info, userId) {
  return User.findOne({ telegramId: userId })
    .then(user => {
      if (user === null) {
        User.create({ telegramId: userId, city: city_info.linkId });
      } else {
        User.update(
          { telegramId: userId },
          { $set: { city: city_info.linkId } }
        );
      }
      console.log(`Ok ${user.city}`);
    })
    .catch(e => console.log(e));
}
