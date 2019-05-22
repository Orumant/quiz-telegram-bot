const mongoose = require("mongoose");
const config = require("config");
const fs = require('fs');
const R = require('ramda');
const {countCorrectAnswers} = require("../bot/game/helpers");
const {FINISH_STATUS} = require("../bot/user");
const {getAllUsers, getAllCategories} = require("../database/index");
const MAX_TRY = config.get('bot.max_try');
const LOTTERY_SCORE = config.get("bot.lottery_score");
const GLOBAL_STAT_HEADER = `Всего;% завершивших;% успеха\n`;
const CATEGORIES_STAT_HEADER = 'Категория;% успеха\n';
const USERS_STAT_HEADER = 'login;username;Статус;Рейтинг;Количество попыток;CSS;HTML;Javascript\n';

mongoose.connect(`mongodb://185.185.40.107:27016/quiz_db`).then(() => {
  Promise.all([
    getAllUsers(),
    getAllCategories(),
  ])
    .then(R.zipObj(['users', 'categories']))
    .then(({users, categories}) => {
      function getBestAnswer({answers, oldAnswers}) {
        if (oldAnswers.length === 0) {
          return answers;
        } else {
          return R.concat([answers], oldAnswers).reduce((prev, cur) => {
            let prevScore = countCorrectAnswers(prev);
            let curScore = countCorrectAnswers(cur);
            return prevScore >= curScore ? prev : cur
          });
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

      function getSucessPercentString(users) {
        let sucess = [];
        users.forEach(user => {
          const {result} = countScore(user);
          if (result === 'SUCCESS') sucess.push(user);
        });
        return `${Math.floor((sucess.length * 100) / users.length).toString()}%`;
      }

      function fillData(users) {
        let fileBody = '';
        users.forEach(user => {
          const {username, fio} = user;
          let result = countScore(user);
          fileBody += `${username};${fio};${result.result};${result.score};${result.attemptsQuantity};`;
          let bestAnswer = getBestAnswer(user);
          fileBody += `${countResultsByCategory(bestAnswer, 'css')};`;
          fileBody += `${countResultsByCategory(bestAnswer, 'html')};`;
          fileBody += `${countResultsByCategory(bestAnswer, 'js')}\n`;
        });
        return fileBody;
      }

      function countResultsByCategory(answers, category) {
        return answers.reduce((result, answer) => {
          if (answer.category === category && answer.isCorrect)
            return result + 1;
          else return result;
        }, 0)
      }
      let finishedUsers = users.filter(user => user.status === FINISH_STATUS);
      let usersStatBody = fillData(finishedUsers);
      fs.writeFile('./users.csv', USERS_STAT_HEADER + usersStatBody, 'utf8', () => {
        console.log('Результаты по пользователям выгружены');
      });
      let globalStat = `${users.length.toString()};`;
      globalStat += `${Math.floor((finishedUsers.length*100)/users.length).toString()};`;
      globalStat += `${getSucessPercentString(finishedUsers)}\n`;
      fs.writeFile('./global.csv', GLOBAL_STAT_HEADER + globalStat, 'utf8', () => {
        console.log('Глобальная статистика выгружена');
      });
      let categorySuccessResults = {};
      let categoryFailedResults = {};
      categories.forEach(category => {
        categorySuccessResults[category.title] = 0;
        categoryFailedResults[category.title] = 0;
      });
      users.map(user => {
        let usersAnswers = R.concat([user.answers], user.oldAnswers);
        usersAnswers.forEach(attempt => {
          if (attempt.length > 0)
            attempt.forEach(answer => {
              if (answer.isCorrect) {
                categorySuccessResults[answer.category] += 1;
              } else {
                categoryFailedResults[answer.category] += 1;
              }
            });
        })
      });
      let catStatFileBody = '';
      categories.map(cat => cat.title)
        .forEach(key => {
          let num = Math.floor(
            (categorySuccessResults[key] * 100) / (categorySuccessResults[key] + categoryFailedResults[key])
          ).toString();
          let a = `${key};${num}%\n`;
          catStatFileBody +=a;
        });
      fs.writeFile('./categories.csv', CATEGORIES_STAT_HEADER + catStatFileBody, 'utf8', () => {
        console.log('Результаты по категориям вопросов выгружены');
      });
    })
    .then(_ => mongoose.disconnect())
});

