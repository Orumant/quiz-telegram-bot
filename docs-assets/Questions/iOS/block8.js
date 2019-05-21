module.exports = [
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\n__block int x = 41;\u2028\r\n__auto_type block = ^{\r\n\tNSLog(@\"%@\", @(++x)); \r\n\u2028};\r\n\u2028x++;\u2028\r\nblock();",
    "a": [
      "42",
      "43",
      "44",
      "Возникнет ошибка компиляции"
    ],
    "v": "2",
    "c": "iOS-8"
  },
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\n__block int x = 41;\r\n__auto_type block = ^{\r\n\tNSLog(@\"%@\", @(++x)); \r\n};\u2028\r\nx++;\r\nblock();",
    "a": [
      "NSStackBlock",
      "NSMallocBlock",
      "NSGlobalBlock",
      "null"
    ],
    "v": "1",
    "c": "iOS-8"
  },
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\nint x = 1;\r\n__auto_type block = ^{\r\n\tNSLog(@\"%@\", @(x));\r\n};\r\n\u2028x += 2;\r\n[block invoke];",
    "a": [
      "1",
      "2",
      "3",
      "Ничего"
    ],
    "v": "1",
    "c": "iOS-8"
  }
]
