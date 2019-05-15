module.exports = [
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\nDispatchQueue.main.async {\r\n\tprint(1)\r\n\tDispatchQueue.global().sync {\r\n\t\tprint(2)\r\n\t}\r\n\tprint(3)\r\n}\r\nprint(4)",
    "a": [
      "4 1 2 3",
      "1 2 3 4",
      "1 4 2 3",
      "4 1 3 2"
    ],
    "v": "1",
    "c": "iOS-4"
  },
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\nDispatchQueue.main.async {\r\n\tprint(1)\r\n\tDispatchQueue.global().async {\r\n\t\tprint(2)\r\n\t}\r\n\tprint(3)\r\n}\r\nprint(4)",
    "a": [
      "4 1 2 3",
      "1 2 3 4",
      "4 1 3 2",
      "1 4 3 2"
    ],
    "v": "3",
    "c": "iOS-4"
  },
  {
    "q": "Что будет выведено в консоль в результате выполнения фрагмента кода?\r\n\r\nDispatchQueue.main.async {\r\n\tprint(1)\r\n\tDispatchQueue.global().async {\r\n\t\tprint(2)\r\n\t}\r\n\tprint(3)\r\n\tDispatchQueue.global().async {\r\n\t\tprint(4)\r\n\t}\r\n}",
    "a": [
      "1 2 3 4",
      "1 3 4 2",
      "1 2 4 3",
      "1 3 2 4"
    ],
    "v": "4",
    "c": "iOS-4"
  }
];