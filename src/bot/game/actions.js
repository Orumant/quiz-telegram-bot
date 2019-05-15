const {isTestAvailableByTime} = require("./dateutils");
const R = require("ramda");
const {makeGamerAnswer, alreadyAnswered} = require("../user/answers");
const {getQuestion} = require("../questionnaires");
const {WITH_QUESTIONS_STATUS, NEW_STATUS, WAIT_STACK, WITH_STACK, WAIT_NAME, WITH_NAME, FINISH_STATUS} = require("../user");
const logger = require("../logger");
const IOS = 'iOS';
const ANDROID = 'android';

const STACK = [IOS, ANDROID];

const {
  updateUser,
  updateUserAnswer,
  createUser,
  getUserById,
  deleteUser,
  getAllUsers,
  getAllQuestionnaires,
  getAllCategories
} = require("../../database");

const Question = require("../../database/models/question");

const {
  generateUser,
  filterWaitingUsers,
  setNextStatus,
  clearUser
} = require("../user");
const compareAnswer = require("../compare-answer");

const {parseMsg} = require("../messages/parsers");
const {generateOpts, generateMessage} = require("../messages");

const {
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  processUserEndStatus,
  processUserNewStatus,
  generatePayload
} = require("./pipes");

const {countCorrectAnswers} = require("./helpers");
const config = require("config");
const SIMPLE_PRIZE_SCORE = config.get("bot.simple_prize_score");
const IS_MOBIUS = config.get("isMobius");

module.exports = {
  destroyUserProfile,
  startQuiz,
  handleUserAnswer,
  checkForExistingUser,
  processWaitingUsers: getQuestinnairesForWaitingGamers,
  processUserEndStatus,
  processUserNewStatus,
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  clearUserProfile,
  stopEmptyMessage,
  processUserData,
  handleStartForAlreadyExistsGamer,
  processUsersWithNoInfo,
  queryData,
  processUserBadgeName,
};

function destroyUserProfile(msg) {
  const {userId, telegramId, name} = parseMsg(msg);

  return new Promise(resolve =>
    deleteUser(userId)
      .then(_ => {
        logger.info("User was deleted, id=", telegramId);
        resolve({
          id: telegramId,
          msg: `Профиль игрока ${name} уничтожен`
        });
      })
      .catch(err => {
        logger.error(err);
        resolve({
          id: telegramId,
          msg: `Произошла ошибка. ${name} попробуйте еще раз.`
        });
      })
  );
}

function clearUserProfile(msg) {
  const {telegramId} = parseMsg(msg);

  return new Promise((resolve, reject) =>
    getUserById(telegramId)
      .then(user => {
        if (!user || !user.length) {
          reject();
        }
        if (user[0].tryCount === 3) {
          return reject({
            id: telegramId,
            msg: 'Увы, вы исчерпали все попытки.'
          })
        } else {
          const clearedUser = clearUser(user[0]);
          return updateUser(clearedUser)
            .then(
              resolve({
                id: telegramId,
                msg:
                  "Тестирование начнется сначала. Обновление придет автоматически"
              })
            )
            .catch(reject);
        }
      })
      .catch(err => {
        logger.error(err);
        return reject({
          id: telegramId,
          msg: `Произошла ошибка при поиске вашего профиля.\nПожалуйста, обратитесь на стойку Сбербанка.`
        });
      })
  );
}

function checkForExistingUser(msg) {
  const {userId, telegramId} = parseMsg(msg);
  return new Promise((resolve, reject) =>
    getUserById(userId)
      .then(user => {
        if (!user || !user.length) {
          reject({
            id: telegramId,
            msg:
              "Вы не найдены в базе анкетирования. Отравьте /start, чтобы попасть в список участников"
          });
        }
        return resolve(user[0]);
      })
      .catch(err => {
        logger.error(err);
        return reject({
          id: telegramId,
          msg: "Произошла ошибка при поиске пользователя"
        });
      })
  );
}

function handleUserAnswer(user, msg) {
  const {telegramId} = parseMsg(msg);
  return new Promise((resolve, reject) => {
    const answer = msg.text;
    const questionId = answer.match(/(\w+)--/)[1];
    const answerIndex = answer.match(/--(\d+)/)[1];

    if (alreadyAnswered(user, questionId)) {
      return resolve();
    }

    if (user.status === "with-question") {
      logger.info("Gamer %s, answer: %s", telegramId, msg);
      setNextStatus(user);
      const checkedQuestionId = R.compose(
        R.find(R.equals(questionId)),
        R.map(R.toString),
        R.pluck("questionnaireId")
      )(user.answers);

      Question.findById(checkedQuestionId)
        .then(questionnaire => {
          const isCorrect = compareAnswer(questionnaire, answerIndex);
          const newAnswer = makeGamerAnswer(
            questionnaire,
            answerIndex,
            isCorrect
          );
          logger.info(
            "Gamer %s, isCorrect=%s, newAnswer=%s",
            telegramId,
            isCorrect,
            newAnswer
          );
          // Так как не обновляется значение объекта в массиве, приходится делать это отдельно
          // Далее пользователь обновляется для изменения статуса
          updateUserAnswer(user._id, newAnswer)
            .then(_ => {
              updateUser(user)
                .then(updatedUser => {
                  logger.info(
                    "Gamer %s updated to %s",
                    telegramId,
                    updatedUser
                  );
                  const {answers = [], stack = ''} = user;

                  getAllCategories()
                    .then(categories => {
                      const questionsNumber = categories.reduce((sum, category) => {
                        if (IS_MOBIUS){
                          let regExp = new RegExp(`^${stack}`);
                          return regExp.test(category.title) ? sum + category.numberOfRequiredAnswers : sum;
                        } else {
                          return sum + category.numberOfRequiredAnswers;
                        }
                      }, 0);
                      if (isTestAvailableByTime()) {
                        resolve({
                          id: telegramId,
                          msg: `<b>Прогресс: ${answers.length}/${questionsNumber}</b>\nОтвет принят, спасибо! Следующее обновление придет автоматически.`,
                          opts: {
                            parse_mode: "html"
                          }
                        });
                      } else {
                        resolve({
                          id: telegramId,
                          msg: `Ответ принят, спасибо!.\nК сожалению, бот активен только во время конференции, сейчас он недоступен.`
                        });
                      }

                    })
                    .catch(err => {

                    });
                })
                .catch(err => {
                  logger.info(err);
                  reject({
                    id: telegramId,
                    msg:
                      "Произошла ошибка. Обратитесь на стойку к сотрудникам Сбербанка."
                  });
                });
            })
            .catch(err => {
              logger.error(err);
              reject({
                id: telegramId,
                msg:
                  "Произошла ошибка. Обратитесь на стойку к соткрудникам Сбербанка."
              });
            });
        })
        .catch(err => {
          logger.error(err);
          reject({
            id: telegramId,
            msg: "Произошла ошибка. Обратитесь на стойку к соткрудникам Сбербанк."
          });
        });
    }
  });
}

function startQuiz(msg) {
  const {telegramId, userId, username, name, fio} = parseMsg(msg);
  return new Promise((resolve, reject) => {
    const newUser = generateUser({
      telegramId: telegramId,
      id: userId,
      username,
      fio,
      name
    });

    return createUser(newUser)
      .then(_ => {
        resolve({
          id: telegramId,
          msg: `Приветствую, ${name}! Вы добавлены в список участников.`
        });
      })
      .catch(err => {
        logger.error("msg %s \nerror %s", msg, err);
        reject({
          id: telegramId,
          msg:
            "Произошла непредвиденная ошибка при начале теста с вами. Попробуйте еще раз."
        });
      });
  });
}

function queryData() {
  return Promise.all([
    getAllUsers(),
    getAllQuestionnaires(),
    getAllCategories()
  ])
    .then(R.zipObj(["gamers", "questionnaires", "categories"]))
}

function processUsersWithNoInfo(data) {
  const {gamers} = data;
  const {renderStackQuestion} = require('../messages');
  return new Promise((resolve, reject) => {
    let unknownGamers = gamers.filter(gamer =>
      [NEW_STATUS, WAIT_NAME, WITH_NAME, WITH_STACK, WAIT_STACK].includes(gamer.status));
    let messages = unknownGamers.map(async gamer => {
      let {id, badgeName, status, stack} = gamer;
      let message = null;
      if (!badgeName && status === NEW_STATUS) {
        setNextStatus(gamer);
        message = {
          id,
          msg: 'Пожалуйста, сфотографируйте свой бейдж и отправьте фото сюда.'
        };
      } else {
        if (IS_MOBIUS && stack === "" && status === WITH_NAME) {
          setNextStatus(gamer);
          message = renderStackQuestion(id);
        } else {
          if (status === WITH_STACK || (!IS_MOBIUS && ([WITH_NAME, WAIT_STACK].includes(status)))) {
            setNextStatus(gamer);
            if (status === WITH_STACK) {
              message = {
                id,
                msg: 'В скором времени вам будет отправлен первый вопрос.'
              }
            }
          }
        }
      }
      return updateUser(gamer)
        .then(() => message)
        .catch(err => {
          logger.error(err);
          return {
            id,
            msg: 'Возникла ошибка. Пожалуйста, обратитесь на стойку Сбербанка.'
          }
        })
    });
    Promise.all(messages)
      .then(resolvedMessages => removeEmptyMessages(resolvedMessages))
      .then(msg => resolve(msg))
  })
}

function getQuestinnairesForWaitingGamers(data) {
  return Promise.resolve(data)
    .then(result => {
      return Object.assign(result, {
        gamers: filterWaitingUsers(result.gamers)
      });
    })
    .then(({gamers = [], questionnaires = [], categories = []}) => {
      return Promise.all(
        gamers.map(gamer =>
          getQuestionnaireForGamer(gamer, questionnaires, categories)
        )
      );
    })
    .then(removeEmptyMessages)
    .then(decorateMessagesOpts);
}

function getQuestionnaireForGamer(gamer, questionnaires, categories) {
  const questionnaire = getQuestion(questionnaires, categories, gamer);
  const processGamer = R.compose(
    processHasQuestionnaireForGamer(questionnaire),
    processNoQuestionnaireForGamer(questionnaire),
    generatePayload
  );
  const payload = processGamer(gamer);
  return updateUser(payload.gamer)
    .then(_ => Promise.resolve(payload.message))
    .catch(err => Promise.reject(err));
}

function removeEmptyMessages(messages) {
  let a = messages.filter(m => !!m);
  return Promise.resolve(a);
}

function decorateMessagesOpts(messages = []) {
  return Promise.resolve(messages.map(generateMessage));
}

function handleStartForAlreadyExistsGamer(gamer) {
  if (gamer.status === WITH_QUESTIONS_STATUS) {
    logger.info("handleStartForAlreadyExistsGamer: %s", gamer);
    const notAnswered = gamer.answers.filter(a => !a.answered);
    const lastAnswer = notAnswered[notAnswered.length - 1];
    const questionnaireId = lastAnswer.questionnaireId;
    logger.info(
      "with answer: %s and questionnaireId: %s",
      lastAnswer,
      questionnaireId
    );
    return Question.findById(questionnaireId)
      .then(questionnaire => {
        const processGamer = R.compose(
          processHasQuestionnaireForGamer(questionnaire),
          generatePayload
        );
        return Promise.resolve(generateMessage(processGamer(gamer).message));
      })
      .catch(logger.error);
  }

  if (gamer.status === FINISH_STATUS) {
    const processGamer = R.compose(
      processNoQuestionnaireForGamer(null),
      generatePayload
    );
    return Promise.resolve(generateMessage(processGamer(gamer).message));
  }
}

function stopEmptyMessage(message = {}) {
  if (message.id && message.msg) {
    return message;
  }
  logger.info("Gamer twice answer on questionnaire");
  throw new Error("Gamer twice answer on questionnaire");
}

function processUserBadgeName(user, msg) {
  const {telegramId} = parseMsg(msg);
  const photoId = msg.photo[3].file_id;
  return new Promise((resolve, reject) => {
    if (user.badgeName == null && user.status === WAIT_NAME) {
      user.badgeName = photoId;
      updateUser(setNextStatus(user))
        .then(_ => {
          resolve({
            id: telegramId,
            msg: `Спасибо!`
          })
        })
        .catch(err => {
          logger.error(err);
          reject({
            id: telegramId,
            msg: `Произошла ошибка! Обратитесь на стойку Сбербанка.`
          })
        })
    }
  })
}

function processUserData(user, msg) {
  const {telegramId} = parseMsg(msg);
  return new Promise((resolve, reject) => {
    const answer = msg.text;

    if (IS_MOBIUS && R.equals(user.stack, "") && user.status === WAIT_STACK) {
      const answerIndex = answer.match(/--(\d+)/)[1];
      user.stack = STACK[answerIndex - 1];
      setNextStatus(user);
      let message = {};
      return updateUser(user)
        .then(_ => {
          message = {
            id: telegramId,
            msg: `Спасибо! Вопросы по выбранному вами стеку будут присланы через некоторое время автоматически.`
          };
          resolve(message);
        })
        .catch(err => {
          message = {
            id: telegramId,
            msg: `Возникла ошибка. Пожалуйста, обратитесь на стойку Сбербанка.`
          };
          reject(message);
        })
    } else {
      resolve(handleUserAnswer(user, msg));
    }
  });
}
