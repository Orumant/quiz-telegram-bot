const config = require("config");
const LOTTERY_SCORE = config.get("bot.lottery_score");
const MAX_TRY = config.get("bot.max_try");
const IS_MOBIUS = config.get("isMobius");
const MAX_BUTTON_TEXT_SIZE = 33;
module.exports = {
  renderQuestion,
  generateOpts,
  renderHelp,
  generateMessage,
  renderStackQuestion,
  MAX_BUTTON_TEXT_SIZE
};

function renderQuestion(question) {
  const result = question.replace(/</gm, "&lt;").replace(/>/, "&gt;");
  return `<code>${result}</code>`;
}

function renderMessage(question) {
  return question;
}

function renderQuestionWithAnswers(question, answers) {
  const renderedAnswers = answers
    .map(item => item.replace(/</gm, "&lt;").replace(/>/, "&gt;"))
    .map((item, i) => `<b>(${i + 1})</b>   ${item}`)
    .join("\n");
  return `${renderQuestion(question)}  
${renderedAnswers}
  `;
}

function generateOpts({ replies }) {
  if (replies && replies.length) {
    return optsWithReplyKeyboard(replies);
  }
  return simpleOpts();
}

function simpleOpts() {
  return {
    parse_mode: "html"
  };
}

function optsWithReplyKeyboard(replies) {
  const keyboard = replies.map((reply, i) => [
    { text: reply.value, callback_data: `${reply.id}--${i + 1}` }
  ]);
  return {
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

function generateMessage({ id, msg, replies = [] }) {
  let question;
  let repliesForKeyboard;

  const needsAnswerInQuestion = !replies.reduce(
    (result, item) => result && item.value.length <= MAX_BUTTON_TEXT_SIZE,
    true
  );

  if (!replies || !replies.length) {
    return {
      id,
      msg: renderMessage(msg)
    };
  }

  if (needsAnswerInQuestion) {
    repliesForKeyboard = replies.map((item, i) => ({
      id: item.id,
      value: `(${(i + 1).toString()})`
    }));
    question = renderQuestionWithAnswers(
      msg,
      replies.map(i => i.value.toString())
    );
  } else {
    repliesForKeyboard = replies;
    question = renderQuestion(msg);
  }

  return {
    id,
    msg: question,
    opts: generateOpts({ replies: repliesForKeyboard })
  };
}

function renderStackQuestion(id) {
  return generateMessage({
    id,
    msg: "Разработчиком для какой платформы вы являетесь",
    replies: [
      {id: 1, value: "Я разработчик iOS"},
      {id: 2, value: "Я разработчик Android"}
      ]
  });
}

function renderHelp() {
  let a = `
<b>Featurenator</b>

Привет! Во время проведения конференции Mobius 2019 в Санкт-Петербурге, я помогу тебе заработать одну из «ачивок» для прохождения квеста.
Для этого тебе нужно показать свои знания мобильной разработки в испытании Skill-control. 
Я буду присылать тебе вопросы по одному. Твоя задача - ответить правильно не менее чем на 6 из них. Всего будет 10 вопросов.
У тебя есть 3 попытки.
Если остались вопросы по испытанию, задай их моим коллегам  на стенде Сбербанка. 

<b>Правила:</b>
- У каждого вопроса есть только один правильный ответ
- Я игнорирую простые текстовые послания
- Вопрос я присылаю автоматически только после осмысления ответа на предыдущий вопрос


<b>Особые слова, которые я понимаю:</b>
/start - Начать испытание/Прислать повторно последний неотвеченный вопрос. 
/help - Прислать справку обо мне
`
  return a;
}
