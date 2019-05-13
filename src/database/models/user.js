const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  id: String,
  username: String,
  fio: String,
  badgeName: String,
  answers: [
    {
      questionnaireId: mongoose.Schema.Types.ObjectId,
      isCorrect: Boolean,
      value: String,
      answeredAt: Date,
      answered: Boolean,
      category: String
    }
  ],
  oldAnswers: [
    [
      {
        questionnaireId: mongoose.Schema.Types.ObjectId,
        isCorrect: Boolean,
        value: String,
        answeredAt: Date,
        answered: Boolean,
        category: String
      }
    ]
  ],
  tryCount: Number,
  stack: String,
  status: String
});

let User = mongoose.model("User", userSchema);

module.exports = User;
