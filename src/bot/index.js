const {renderStackQuestion} = require("./messages");
const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const {isTestAvailableByTime} = require("./game/dateutils");
const TOKEN = config.get("telegramBotToken");
const IS_MOBIUS = config.get("isMobius");
const url = config.get("url");
const bot_server = config.get("bot_server");
const MASTER_CHANNEL_ID = config.get('bot.masterChannelId');
const {port, key, cert} = bot_server;
const R = require("ramda");
const options = {
  webHook: {
    port,
    key,
    cert
  }
};

const bot = new TelegramBot(TOKEN, {polling: true});
// const bot = new TelegramBot(TOKEN, options);
// bot.setWebHook(`${url}/bot${TOKEN}`, {
//   certificate: options.webHook.cert
// });

module.exports = {
  sendMessageToChannel,
};
const logger = require("./logger");

const Queue = require("./queue");
const queue = new Queue(20, 1000);

const {initQuestions} = require("../database");
const {renderHelp} = require("./messages");
const {parseMsg} = require("./messages/parsers");

const {
  handleUserAnswer,
  checkForExistingUser,
  startQuiz,
  processWaitingUsers,
  clearUserProfile,
  handleStartForAlreadyExistsGamer,
  stopEmptyMessage,
  processUserData,
  processUsersWithNoInfo,
  queryData,
  processUserBadgeName,
} = require("./game/actions");

initQuestions();

bot.on('photo', (message) => {
  logger.info("Callback %s", message);

  checkForExistingUser(message)
    .then(user => processUserBadgeName(user, message))
    .then(stopEmptyMessage)
    .catch(logger.error)
    .then(message => sendMessageFromQueue(message))
    .catch(({id, msg}) => sendMessage(id, msg));
});

bot.onText(/\/clear/, msg => {
  logger.info("command /clear %s", msg);
  clearUserProfile(msg)
    .then(({id, msg}) => sendMessage(id, msg))
    .catch(({id, msg}) => sendMessage(id, msg))
});

bot.onText(/\/help/, msg => {
  logger.info("command /help %s", msg);
  const {telegramId} = parseMsg(msg);
  sendMessage(telegramId, renderHelp(), {parse_mode: "HTML"});
});

bot.onText(/^\/start$/, incomeMsg => {
  if (isTestAvailableByTime()) {
    logger.info("command /start %s", incomeMsg);
    checkForExistingUser(incomeMsg)
      .then(handleStartForAlreadyExistsGamer)
      .catch(_ => startQuiz(incomeMsg))
      .then(({id, msg, opts}) => sendMessageFromQueue({id, msg, opts}))
      .catch(({id, msg}) => sendMessage(id, msg));
  } else {
    const {chat: {id}} = incomeMsg;
    sendMessage(
      id,
      "Извините, сейчас бот недоступен. Время работы бота совпадает со временем проведения конференции."
    );
  }
});

setInterval(() => {
  if (isTestAvailableByTime()) {
    queryData()
      .then(data => processUsersWithNoInfo(data))
      .then(messages => {
        messages.map(({id, msg, opts}) => {
          sendMessage(id, msg, opts);
        })
      })
      .catch(err => logger.error(err));
    queryData()
      .then(data => processWaitingUsers(data))
      .then(messages => {
        messages.map(({id, msg, opts}) => {
          sendMessage(id, msg, opts);
        })
      })
      .catch(err => logger.error(err))
  }
}, 2000);

bot.on("callback_query", callbackQuery => {
  // TODO: убрать этот ужас. И сделать чистую функцию, которая парсит msg и передает в другие функции
  const msg = callbackQuery.message;
  msg.text = callbackQuery.data;
  msg.from = callbackQuery.from;
  logger.info("Callback %s", msg);

  checkForExistingUser(msg)
    .then(user => processUserData(user, msg))
    .then(stopEmptyMessage)
    .catch(logger.error)
    .then(message => sendMessageFromQueue(message))
    .catch(({id, msg}) => sendMessage(id, msg));
});

// bot.onText(/^[^\/]/, (message) => {
//   logger.info("Callback %s", message);
//
//   checkForExistingUser(message)
//     .then(user => processUserBadgeName(user, message))
//     .then(stopEmptyMessage)
//     .catch(logger.error)
//     .then(message => sendMessageFromQueue(message))
//     .catch(({id, msg}) => sendMessage(id, msg));
// });

bot.on("polling_error", err => logger.error(err));
bot.on("webhook_error", error => {
  console.log(error.code); // => 'EPARSE'
});


queue.addCallback(sendMessageFromQueue);

function sendMessageFromQueue({id, msg, opts}) {
  return bot
    .sendMessage(id, msg, opts)
    .then(_ => {
      logger.info("Success send to gamer=%s, msg=%s", id, msg)
    })
    .catch(err => {
      logger.error("Error with send to gamer=%s, msg=%s. \n%s", id, msg, err);
    });
}

function sendMessage(id, msg, opts) {
  queue.addMessage({
    id,
    msg,
    opts
  });
}

require("./server").start(sendMessage);
queue.start();

function sendMessageToChannel({photo_id, message}) {
  bot.sendPhoto(MASTER_CHANNEL_ID, photo_id, {caption: message});
}
