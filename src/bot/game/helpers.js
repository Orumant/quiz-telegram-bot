const config = require("config");
const IS_MOBIUS = config.get("isMobius");

function countCorrectAnswers(answers) {
  return answers.reduce((total, answer = {}) => {
    return answer.isCorrect ? ++total : total;
  }, 0);
}

function getGamerStatisticsMessage({username = '', stack = '', badgeName = '', results = []}) {
  let resultMessage = results.map((result, index) => {
    return `Попытытка ${index + 1}: ${result}`
  });
  let caption = `Username: ${username}
${IS_MOBIUS ? `Платформа: ${stack}`: null}
Результаты:
${resultMessage.join('\n')}`;
  return {photo_id: badgeName, message: caption}
}

module.exports = {
  countCorrectAnswers,
  getGamerStatisticsMessage,
};
