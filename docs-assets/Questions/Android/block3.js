module.exports = [
  {
    "q": "При использование какого launchMode Activity будет гарантировано единственным элементом Task-и, содержащей ее?",
    "a": [
      "standard",
      "singleTop",
      "singleTask",
      "singleInstance"
    ],
    "v": "4",
    "c": "android-3"
  },
  {
    "q": "Task содержит 4 Actvitity: A, B, C, D. Activity D находится на вершине. Известно, что у Activity С установлен launchMode=singleTop. Какой вид примет Task при запуске Activity C без каких либо дополнительных флагов Intent?",
    "a": [
      "A, B, C, D, C",
      "A, B, D, C",
      "A, B, C",
      "C"
    ],
    "v": "1",
    "c": "android-3"
  },
  {
    "q": "Task содержит 4 Activity: A, B, C, D. Все Activity имеют launchMode=standard. Что произойдет при запуске Activity C с флагом FLAG_ACTIVITY_CLEAR_TOP?",
    "a": [
      "Activity D уничтожается. У Activity C вызывается метод onCreate()",
      "Activity C и D уничтожаются. В стэк добавляется новый экземпляр Activity C, у которого вызывается метод onNewIntent()",
      "Activity C и D уничтожаются. В стэк добавляется новый экземпляр Activity C, у которого вызывается метод onCreate()",
      "Activity D уничтожается. У Activity C вызывается метод onNewIntent()"
    ],
    "v": "3",
    "c": "android-3"
  },
  {
    "q": "Task содержит 4 Activity: A, B, C, D. Все Activity имеют launchMode=standard. Что произойдет при запуске Activity C с флагами FLAG_ACTIVITY_CLEAR_TOP и FLAG_ACTIVITY_SINGLE_TOP?",
    "a": [
      "Activity D уничтожается. У Activity C вызывается метод onCreate()",
      "Activity C и D уничтожаются. В стэк добавляется новый экземпляр Activity C, у которого вызывается метод onNewIntent()",
      "Activity C и D уничтожаются. В стэк добавляется новый экземпляр Activity C, у которого вызывается метод onCreate()",
      "Activity D уничтожается. У Activity C вызывается метод onNewIntent()"
    ],
    "v": "4",
    "c": "android-3"
  }
];
