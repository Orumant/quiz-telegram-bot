module.exports = [
  {
    "q": "RxJava, Kotlin. Что выведет на экран следующий участок кода?\r\n\r\nObservable.concat(\u2028\r\n\tObservable.interval(2, TimeUnit.SECONDS).take(5).map { it * 2 },\u2028\r\n\tObservable.interval(1, 2, TimeUnit.SECONDS).take(5).map { it * 2 + 1 })\u2028\r\n\t.take(5)\u2028\r\n\t.subscribe { print(it) }",
    "a": [
      "02468",
      "13579",
      "01234",
      "56789"
    ],
    "v": "1",
    "c": "android-10"
  },
  {
    "q": "RxJava, Kotlin. Что выведет на экран следующий участок кода?\r\n\r\nObservable.merge(\u2028\r\n\tObservable.interval(2, TimeUnit.SECONDS).take(5).map { it * 2 },\u2028\r\n\tObservable.interval(1, 2, TimeUnit.SECONDS).take(5).map { it * 2 + 1 })\u2028\r\n\t.take(5)\u2028\r\n\t.subscribe { print(it) }",
    "a": [
      "01234",
      "02468",
      "10325",
      "56789"
    ],
    "v": "3",
    "c": "android-10"
  },
  {
    "q": "RxJava, Kotlin. Что выведет на экран следующий участок кода?\r\n\r\nObservable.concat(\r\n\u2028\tObservable.interval(2, TimeUnit.SECONDS).take(5).map { it * 2 },\u2028\r\n\tObservable.interval(1, 2, TimeUnit.SECONDS).take(5).map { it * 2 + 1 })\r\n\u2028\t.skip(5)\r\n\u2028\t.take(5)\u2028\r\n\t.filter { it < 5 }\u2028\r\n\t.subscribe { print(it) }",
    "a": [
      "579",
      "02",
      "13",
      "468"
    ],
    "v": "3",
    "c": "android-10"
  }
];
