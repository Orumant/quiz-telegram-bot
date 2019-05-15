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
    let regExp = new RegExp(`^${gamer.stack}`);
    themedQuestionnaires = questionnaires.filter(question => regExp.test(question.category));
  }
  const allowableQuestionnaires = allowableQuestionnairesByAnswers(
    themedQuestionnaires,
    answers
  );
  //Вопросы, на которые пользователь ответил
  const answered = questionnairesByAnswered(themedQuestionnaires, answers);

  //количество вопросов в категории
  const countFromAnsweredMap = countOfAnswersByCategoryMap(answered);
  //количество вопросов на которые нужно ответить в категории
  const countOfNeedsMap = countOfNeedsAnswersByCategoryMap(categories);

  let sumAnswersFromMap = R.compose(R.sum, Array.from);
  //количество вопросов, на которые нужно ответить чтобы пройти тестирование
  let sumOfNeedsAnswers = sumAnswersFromMap(countOfNeedsMap.values());
  //количество вопросов
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
