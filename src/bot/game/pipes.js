const R = require("ramda");

const {WITH_QUESTIONS_STATUS, FINISH_STATUS} = require("../user");
const {makeGamerAnswer} = require("../user/answers");

const {countCorrectAnswers, getGamerStatisticsMessage} = require("./helpers");
const config = require("config");
const LOTTERY_SCORE = config.get("bot.lottery_score");
const SF_LINK = config.get("bot.sf_link");
const MAX_TRY = config.get("bot.max_try");

module.exports = {
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  processUserEndStatus,
  processUserNewStatus,
  generatePayload: processNewPayload
};

const {sendMessageToChannel} = require('../index');

function processNoQuestionnaireForGamer(questionnaire = {}) {
  // payload = {gamer, message}
  return payload => {
    const {gamer = {}} = payload;
    if (!questionnaire) {
      const {answers = [], tryCount} = gamer;
      const score = countCorrectAnswers(answers);
      let scoreMsg = `Твой результат ${score}/${answers.length}. `;
      if (score >= LOTTERY_SCORE) {
        scoreMsg += `
Поздравляю! Ты можешь получить ачивку за задание «Skill-control», для этого пройди на стенд Сбербанка и передай моим коллегам, что испытание пройдено! Они наклеят на твою карточку соответствующий стикер.

Еще одну «ачивку» за задание «Личное дело» ты можешь получить заполнив небольшую анкету по ссылке ${SF_LINK} , если не сделал этого ранее.

Третья ачивка ждет тебя при проявлении достаточной стойкости в «Игре - просто Бомба!», которую мои коллеги проводят в перерывах между докладами на стенде Сбербанка.
Спасибо за участие!`;
        let sendResultMessage = R.compose(
          sendMessageToChannel,
          getGamerStatisticsMessage
        );
        if (gamer.oldAnswers.length > 0) {
          let results = gamer.oldAnswers.reduce((acc, result) => {
            let oldScore = countCorrectAnswers(result);
            acc.push(`${oldScore}/${result.length}`);
            return acc;
          }, []);
          results.push(`${score}/${answers.length}`);
          sendResultMessage({username: gamer.username.length > 0 ? gamer.username : gamer.fio, badgeName: gamer.badgeName, results});
        } else {
          sendResultMessage({username: gamer.username, badgeName: gamer.badgeName, results: [`${score}/${answers.length}`]});
        }
      } else {
        if (MAX_TRY > tryCount) {
          scoreMsg += `Сожалею, но этого не достаточно для получения «ачивки». У тебя есть еще ${MAX_TRY - tryCount} попытки. Для этого выполни команду /clear. Желаю удачи!`;
        } else {
          scoreMsg += `Сожалею, но этого не достаточно для получения «ачивки». У тебя больше нет попыток, НО!
Ты все еще можешь получить футболку, если проявишь выдающуюся стойкость в «Игре - просто Бомба!», которую мои коллеги проводят в перерывах между докладами на стенде Сбербанка.
Желаю удачи!`
        }
      }
      return Object.assign(payload, {
        message: {
          id: gamer.telegramId,
          msg: `${scoreMsg}`
        },
        gamer: Object.assign(gamer, {
          status: FINISH_STATUS
        })
      });
    }
    return payload;
  };
}

function processHasQuestionnaireForGamer(questionnaire = {options: []}) {
  //payload = {gamer, massage}
  return payload => {
    const {gamer = {answers: []}, message = {}} = payload;
    if (questionnaire) {
      return Object.assign({}, payload, {
        gamer: Object.assign(gamer, {
          status: WITH_QUESTIONS_STATUS,
          answers: gamer.answers.concat(makeGamerAnswer(questionnaire))
        }),
        message: {
          id: gamer.telegramId,
          msg: questionnaire.title,
          replies: questionnaire.options.map(v => ({
            id: questionnaire._id,
            value: v
          }))
        }
      });
    }
    return payload;
  };
}

function processUserEndStatus({user = {}, payload = {}}) {
  if (user.status === "end") {
    return Object.assign({
      user: Object.assign({}, user, {status: "end"}),
      payload: Object.assign({}, payload, {
        id: user.telegramId,
        msg:
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
      })
    });
  }
  return {
    user,
    payload
  };
}

function processUserNewStatus({user = {}, payload = {}}) {
  if (user.status === "new") {
    return Object.assign({
      user,
      payload: Object.assign({}, payload, {
        id: user.telegramId,
        msg: "Нужен вопрос"
      })
    });
  }
  return {
    user,
    payload
  };
}

function processNewPayload(gamer) {
  return {
    gamer,
    message: {}
  };
}
