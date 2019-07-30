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
  .connect(config.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

require("./models/weather.model");

const Weather = mongoose.model("weather");

// database.weather.forEach(w => new Weather(w).save());

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
    case buttons.home.favourite:
      break;
    case buttons.home.weather:
      bot.sendMessage(chatId, "Выберите период", {
        reply_markup: { keyboard: keyboard.weather }
      });
      break;
    case buttons.weather.today:
      break;
    case buttons.weather.week:
      break;
    case buttons.home.news:
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
