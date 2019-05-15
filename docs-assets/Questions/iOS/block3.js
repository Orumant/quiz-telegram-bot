module.exports = [
  {
    "q": "Какая верная иерархия наследования для UIButton?",
    "a": [
      "NSObject —> UIView —> UIControl —> UIButton",
      "NSObject —> UIControl —> UIView —> UIButton",
      "NSObject —> UIResponder —> UIView —> UIControl —> UIButton",
      "NSObject —> UIResponder —> UIControl —> UIView —> UIButton"
    ],
    "v": "3",
    "c": "iOS-3"
  },
  {
    "q": "Какая верная иерархия наследования для UINavigationController?",
    "a": [
      "NSObject —> UIResponder —> UIView —> UIViewController —> UINavigationController",
      "NSObject —> UIResponder —> UIViewController —> UINavigationController",
      "NSObject —> UIResponder —> UINavigationController",
      "NSObject —> UIView —> UIViewController —> UINavigationController"
    ],
    "v": "2",
    "c": "iOS-3"
  },
  {
    "q": "Какая верная иерархия наследования для UITableViewController?",
    "a": [
      "NSObject —> UIResponder —> UIViewController —> UITableViewController",
      "NSObject —> UIResponder —> UITableViewController",
      "NSObject —> UIView —> UIViewController —> UITableViewController",
      "UIView —> UIResponder —> UIViewController —> UITableViewController"
    ],
    "v": "1",
    "c": "iOS-3"
  },
  {
    "q": "Какая верная иерархия наследования для UIView?",
    "a": [
      "NSObject —> UIResponder —> UIView",
      "NSObject —> UIControl —> UIView",
      "NSObject —> UIView",
      "NSObject —> UIResponder —> UIControl —> UIView"
    ],
    "v": "1",
    "c": "iOS-3"
  }
];
