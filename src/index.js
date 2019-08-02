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
require("./models/exchange.model");
require("./models/currency.model");

const Weather = mongoose.model("weather");
const City = mongoose.model("cities");
const User = mongoose.model("users");
const Exchange = mongoose.model("exchanges");
const Currency = mongoose.model("currencies");

// database.weather.forEach(w => new Weather(w).save());
// database.city.forEach(c => new City(c).save());
// database.exchange.forEach(e => new Exchange(e).save());
// database.currency.forEach(с => new Currency(с).save());

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
    case buttons.home.news:
      break;
    case buttons.home.currency:
      bot.sendMessage(chatId, "Настройки", {
        reply_markup: { keyboard: keyboard.currency }
      });
      break;
    case buttons.home.traffic:
      break;
    case buttons.home.settings:
      bot.sendMessage(chatId, "Настройки", {
        reply_markup: { keyboard: keyboard.settings }
      });
      break;

    case buttons.weather.today:
      sendWeatherByQuery(chatId, "today", msg.from.id);
      break;
    case buttons.weather.week:
      sendWeatherByQuery(chatId, "week", msg.from.id);
      break;

    case buttons.currency.today:
      sendExchangeRatesByPeriod(chatId, "today");
      break;
    case buttons.currency.week:
      sendExchangeRatesByPeriod(chatId, "week");
      break;
    case buttons.currency.month:
      sendExchangeRatesByPeriod(chatId, "month");
      break;

    case buttons.settings.city:
      sendSettingsCities(chatId);
      break;
    case buttons.settings.currency:
      sendSettingsCurrencies(chatId);
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
    msg.from.last_name ? msg.from.last_name : null
  }\nВыберите команду для начала работы`;

  bot.sendMessage(helper.getChatId(msg), text, {
    reply_markup: {
      keyboard: keyboard.home
    }
  });
});

bot.onText(/\/city_(.+)/, msg => {
  const chatId = helper.getChatId(msg);
  chooseSettingsCity(chatId, msg);
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

function sendWeatherByQuery(chatId, query, userId) {
  User.findOne({ telegramId: userId })
    .then(user => {
      if (user) {
        if (query === "today") {
          Weather.findOne({ city: user.cityName })
            .then(weather => {
              const html = `Погода в городе ${
                user.cityName
              } на сегодня: \nТемпература: ${weather.metcast.degrees}`;
              sendHTML(chatId, html);
            })
            .catch(err => {
              console.log(`ОШИБКА: ${err}`);
            });
        } else if (query === "week") {
          sendHTML(chatId, "Погоды на неделю нет");
        }
      } else {
        const text = "Укажите город в настройках";
        bot.sendMessage(chatId, text, {
          reply_markup: {
            keyboard: keyboard.settings
          }
        });
      }
    })
    .catch(e => console.log(e));
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
      setSettingsCity(chatId, ct, msg.from.id);
    })
    .catch(e => console.log(e));
}

function setSettingsCity(chatId, city_info, userId) {
  return User.findOne({ telegramId: userId })
    .then(user => {
      if (user === null) {
        User.create({
          telegramId: userId,
          cityId: city_info.linkId,
          cityName: city_info.name
        });
      } else {
        User.updateOne(
          { telegramId: userId },
          { $set: { cityId: city_info.linkId, cityName: city_info.name } },
          function(err) {
            if (err) console.log(handleError(err));
          }
        );
      }
      sendHTML(chatId, `Установлен город: <b>${city_info.name}</b>`);
    })
    .catch(e => console.log(e));
}

function sendExchangeRatesByPeriod(chatId, period) {
  switch (period) {
    case "today":
      Exchange.findOne({ base: "usd" })
        .then(exch => {
          sendHTML(
            chatId,
            `<b>Курсы валют на сегодня:</b>\nUSD:  ${exch.data.rub.toFixed(
              2
            )}‎₽\nEUR:  ${(exch.data.rub / exch.data.eur).toFixed(
              2
            )}‎₽\nCHF:  ${(exch.data.rub / exch.data.chf).toFixed(
              2
            )}‎₽\nJPY:  ${(exch.data.rub / exch.data.jpy).toFixed(2)}‎₽`
          );
        })
        .catch(e => console.log(e));
      break;
    case "week":
      break;
    case "month":
      break;
  }
}

// function sendSettingsCurrencies(chatId) {}
