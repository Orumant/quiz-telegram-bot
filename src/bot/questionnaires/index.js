const R = require("ramda");
const {
  getRandomQuestionnaire,
  getQuestionnairesByCategory,
  questionnairesByAnswered,
  countOfAnswersByCategoryMap,
  countOfNeedsAnswersByCategoryMap,
  allowableQuestionnairesByAnswers
} = require("./helpers");
const config = require('config');
const IS_MOBIUS = config.get("isMobius");

module.exports = {
  getQuestion
};

function getQuestion(questionnaires = [], categories = [], gamer = {}) {
  const answers = gamer.answers;
  //вопросы, на которые пользователь еще не отвечал
  let themedQuestionnaires = questionnaires;
  if (IS_MOBIUS) {
    themedQuestionnaires = questionnaires.filter(question => question.category === gamer.stack)
  }
  const allowableQuestionnaires = allowableQuestionnairesByAnswers(
    themedQuestionnaires,
    answers
  );
  //Вопросы, на которые пользователь ответил
  const answered = questionnairesByAnswered(questionnaires, answers);

  //количество ответов по категориям
  const countFromAnsweredMap = countOfAnswersByCategoryMap(answered);

  const countOfNeedsMap = countOfNeedsAnswersByCategoryMap(categories);

  let sumAnswersFromMap = R.compose(R.sum, Array.from);

  let sumOfNeedsAnswers = sumAnswersFromMap(countOfNeedsMap.values());

  let sumOfAnswered = sumAnswersFromMap(countFromAnsweredMap.values());

  if (sumOfAnswered >= sumOfNeedsAnswers) {
    return null;
  }

  for (let categoryInfo of countOfNeedsMap) {
    const numOfAnsweredByCategory = countFromAnsweredMap.get(categoryInfo[0]);
    if (!numOfAnsweredByCategory || numOfAnsweredByCategory < categoryInfo[1]) {
      const question = getRandomQuestionnaire(
        getQuestionnairesByCategory(allowableQuestionnaires, categoryInfo[0])
      );

      if (question) {
        return question;
      }
    }
  }

  return null;
}
