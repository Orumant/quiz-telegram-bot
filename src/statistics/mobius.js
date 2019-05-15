const mongoose = require("mongoose");
const mathjs = require("mathjs");
const config = require("config");
const fs = require('fs');
const R = require('ramda');
const {countCorrectAnswers} = require("../bot/game/helpers");
const {FINISH_STATUS} = require("../bot/user");
const {connect, getAllUsers, getAllCategories, getAllQuestionnaires} = require("../database/index");
const MAX_TRY = config.get('bot.max_try');
const LOTTERY_SCORE = config.get("bot.lottery_score");
const ANDROID_FILE_HEADER =
  'login,username,Статус,Рейтинг,Количество попыток,android1,android2,android3,android4,android5,' +
  'java1,kotlin_java1,kotlin_java2,kotlin1,rxjava1\n';
const IOS_FILE_HEADER =
  'login,username,Статус,Рейтинг,Количество попыток,block1,block2,block3,block4,block5,' +
  'block6,block7,block8,block9,block10\n';

module.exports = {
  usersByTryes,
};

function isUserSucceed(user) {
  if (user.status !== FINISH_STATUS) return false;
  if (user.oldAnswers.length === 0) {
    let score = countCorrectAnswers(user.answers);
    return score >= LOTTERY_SCORE;
  } else {
    return user.oldAnswers.some(answers => {
      return countCorrectAnswers(answers) >= LOTTERY_SCORE
    })
  }
}

function countScore(user) {
  let allAnswers = R.concat([user.answers], user.oldAnswers);
  let scores = allAnswers.map(answers => countCorrectAnswers(answers));
  let topScore = Math.max(...scores);
  return {
    score: `${topScore}/10`,
    attemptsQuantity: `${allAnswers.length}/${MAX_TRY}`,
    result: topScore >= LOTTERY_SCORE ? 'SUCCESS' : 'FAILED',
  };
}

function аndroidUsersStats() {
  return new Promise((resolve, reject) => {
    connect().then(() => {
      Promise.all([
        getAllUsers(),
        getAllCategories,
        getAllQuestionnaires,
      ])
        .then(R.zipObj(['users', 'categories', 'questions']))
        .then(({users, categories, questions}) => {
          let androidDevs = users.filter(user => user.stack === 'android');
          let fileBody = '';
          androidDevs.forEach(user => {
            const {username, fio} = user;
            let result = countScore(user);
            fileBody += `${username},${fio},${result.result},${result.score},${result.attemptsQuantity}`;

          })
        })
        .then(_ => mongoose.disconnect())
    });
  })
}
