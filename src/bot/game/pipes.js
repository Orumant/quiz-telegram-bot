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
      let scoreMsg = `Ваш итоговый балл ${score}/${answers.length}. `;
      if (score >= LOTTERY_SCORE) {
        scoreMsg +=
          `Поздравляю! Вы набрали достаточный балл для получения достижения! Ура!\nПожалуйста, заполните анкету по ссылке ${SF_LINK}, затем, получите наклейку на стойке Сбербанка\nСпасибо за участие! `;
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
          scoreMsg += `К сожалению, вы набрали не достаточно баллов для получения достижения
Вы можете попробовать пройти тестирование еще раз! 
Количество оставшихся попыток: ${MAX_TRY - tryCount}.
Для этого отправьте команду /clear`
        } else {
          scoreMsg += `Спасибо за участие!`
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
