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
const GLOBAL_STAT_HEADER = `Всего;Android;iOS;% успеха Android;% успеха iOS\n`;
const CATEGORIES_STAT_HEADER = 'Категория;% успеха\n';

mongoose.connect(`mongodb://185.185.40.107:27017/quiz_db`).then(() => {
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

      function fillData(users, fileBody) {
        users.forEach(user => {
          const {username, fio} = user;
          let result = countScore(user);
          fileBody += `${username},${fio},${result.result},${result.score},${result.attemptsQuantity},`;
          let bestAnswer = getBestAnswer(user);
          let curAnswers = bestAnswer.map(answer => `${answer.isCorrect ? "+" : "-"}`);
          fileBody += curAnswers.join(',');
          fileBody += '\n';
        });
        return fileBody;
      }

      let androidFileBody = '';
      let androidDevs = users.filter(user => user.stack === 'android');
      androidFileBody += fillData(androidDevs, androidFileBody);
      fs.writeFile('./android.csv', ANDROID_FILE_HEADER + androidFileBody, 'utf8', () => {
        console.log('Результаты по платформе Android выгружены');
      });

      let iosFileBody = '';
      let iosDevs = users.filter(user => user.stack === 'iOS');
      iosFileBody += fillData(iosDevs, iosFileBody);
      fs.writeFile('./ios.csv', IOS_FILE_HEADER + iosFileBody, 'utf8', () => {
        console.log('Результаты по платформе iOS выгружены');
      });

      let globalStatFile = '';
      globalStatFile
        += `${users.length.toString()};${androidDevs.length.toString()};${iosDevs.length.toString()};${getSucessPercentString(androidDevs)};${getSucessPercentString(iosDevs)}`;

      fs.writeFile('./global.csv', GLOBAL_STAT_HEADER + globalStatFile, 'utf8', () => {
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

