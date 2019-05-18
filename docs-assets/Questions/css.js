module.exports = [
  {
    q: `
В css-стилях прописаны два класса
<p class=‘top’>some text</p>
<p class=‘bottom’>some text</p>

.top {
    margin-bottom: 20px;
}
.bottom { 
    margin-top: 20px;
}

Какое расстояние в px будет между двумя <p>?
`,
    a: [
      "0px, элементы <p> не блочные",
      "Дефолтное устанавливаемое браузером",
      "20px",
      "40px"
    ],
    v: 3,
    c: "css"
  },
  {
    q: `
<div class='foo'><h1>bar</h1></div>

.foo { color: blue!important }
h1 { color: red }
.foo * { color: yellow!imporant }

Какой цвет будет у слова bar?
    `,
    a: [
      "blue",
      "red",
      "yellow"
    ],
    v: 3,
    c: "css"
  },
  {
    q: `
<h1 id="id1">foo</h1><h1 id="id2">bar</h1>

h1 { display: inline; }
#id1 { width: 200px; visibility: hidden; }
#id2 { opacity: 1 }

Выберите подходящий вариант, описывающий результат рендеринга?
    `,
    a: [
      "Слепленные foobar",
      "Рисуется только bar на расстоянии 200px от левой границы",
      "Рисуются раздельно foo и bar, слово bar на расстоянии 200px от левой границы",
      "Рисуется только bar на расстоянии от левой границы равном длине слова foo"
    ],
    v: 4,
    c: "css"
  },
  {
    q: `
Существуют псевдоклассы :hover и :active.
.link:active {
    color: yellow;
}
.link:hover {
    color: blue;
}
Как нужно их расположить (выше или ниже), чтобы при наведении на ссылку его цвет становился синим, а при нажатии мыши желтым?
    `,
    a: [
      ".link:hover выше по коду, .link:active ниже",
      ".link:active выше по коду, .link:hover ниже",
      "Без разницы",
    ],
    v: 1,
    c: "css"
  }
]
