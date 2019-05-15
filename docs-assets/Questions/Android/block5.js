module.exports = [
  {
    "q": "Какое из нижеперечисленных утверждений не верно по отношению к Intent Service?",
    "a": [
      "Запускается в отдельном потоке",
      "Может обрабатывать несколько задач параллельно",
      "Останавливается самостоятельно после выполнения задач",
      "Все вышеперечисленное"
    ],
    "v": "2",
    "c": "android-5"
  },
  {
    "q": "Какой вариант соответствует жизненному циклу bound (НЕ started) сервиса?",
    "a": [
      "onCreate(), onStartCommand(), onDestroy()",
      "onCreate(), onStartCommand(), onBind(), onUnbind(), onDestroy()",
      "onStartCommand(), onBind(), onUnbind(), onDestroy()",
      "onCreate(), onBind(), onUnbind(), onDestroy()"
    ],
    "v": "4",
    "c": "android-5"
  },
  {
    "q": "Какой вариант соответствует жизненному циклу started (НЕ bound) сервиса?",
    "a": [
      "onCreate(), onStartCommand(), onDestroy()",
      "onCreate(), onStartCommand(), onBind(), onUnbind(), onDestroy()",
      "onStartCommand(), onBind(), onUnbind(), onDestroy()",
      "onCreate(), onBind(), onUnbind(), onDestroy()"
    ],
    "v": "1",
    "c": "android-5"
  }
];
