const NEW_STATUS = "new";
const WAIT_NAME = 'wait-name';
const WITH_NAME = 'with-name';
const WAIT_STACK = 'wait-stack';
const WITH_STACK = "with-stack";
const WITH_QUESTIONS_STATUS = "with-question";
const WAIT_QUESTION_STATUS = "wait-question";
const FINISH_STATUS = "end";
const DEFAULT_GAMER_NAME = "js-ниндзя";
const MAX_TRY = require('config').get('bot.max_try');

module.exports = {
  generateUser,
  setNextStatus,
  getNextStatus,
  filterWaitingUsers,
  clearUser,
  NEW_STATUS,
  WITH_QUESTIONS_STATUS,
  WAIT_QUESTION_STATUS,
  FINISH_STATUS,
  DEFAULT_GAMER_NAME,
  WAIT_NAME,
  WAIT_STACK,
  WITH_NAME,
  WITH_STACK,
};

const statuses = [
  NEW_STATUS,
  WAIT_NAME,
  WITH_NAME,
  WAIT_STACK,
  WITH_STACK,
  WITH_QUESTIONS_STATUS,
  WAIT_QUESTION_STATUS,
  FINISH_STATUS
];

function generateUser(options = {}) {
  return Object.assign(
    {
      stack: '',
      answers: [],
      oldAnswers: [],
      tryCount: 1,
      status: statuses[0],
      badgeName: null,
    },
    options
  );
}

function clearUser(user = {}) {
  if (user.oldAnswers)
    user.oldAnswers.push(user.answers);
  if (user.tryCount < MAX_TRY) {
    user.tryCount += 1;
  }
  return Object.assign(user, {
    answers: [],
    status: WAIT_QUESTION_STATUS,
  });
}

function setNextStatus(gamer = {}) {
  return Object.assign(gamer, {
    status: getNextStatus(gamer)
  });
}

function getNextStatus(gamer = {}) {
  switch (gamer.status) {
    case NEW_STATUS:
      return WAIT_NAME;
    case WAIT_NAME:
      return WITH_NAME;
    case WITH_NAME:
      return WAIT_STACK;
    case WAIT_STACK:
      return WITH_STACK;
    case WITH_STACK:
      return WAIT_QUESTION_STATUS;
    case WAIT_QUESTION_STATUS:
      return WITH_QUESTIONS_STATUS;
    case WITH_QUESTIONS_STATUS:
      return WAIT_QUESTION_STATUS;
    case FINISH_STATUS:
      return FINISH_STATUS;
    default:
      return WAIT_QUESTION_STATUS;
  }
}

function filterWaitingUsers(users = []) {
  return users.filter(user =>
    [WAIT_QUESTION_STATUS].includes(user.status)
  );
}
