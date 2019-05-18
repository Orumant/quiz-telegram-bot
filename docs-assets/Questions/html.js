module.exports = [
  {
    q: `
Как сделать ссылку, чтобы при клике на нее открывалось новое окно браузера(не вкладка, а окно)?
    `,
    a: [
      "<a href='' target='_blank' />",
      "<a href='' new />",
      "a href='' target='new' />",
      "Невозможно в современном браузере, только через javascript"
    ],
    v: 4,
    c: "html"
  },
  {
    q: `
Фрагмент кода представлен 3мя radiobutton. 
<form>
<input type="radio" value="email" for="contacts"/>
<input type="radio" value="phone" for="contacts"/>
<input type="radio" value="push" for="type">
</form>

Сколько максимум радиобатонов можно выбрать?
    `,
    a: [
      "Один из трех",
      "Два из трех",
      "Три из трех",
      "Ни одного, ошибка в html"
    ],
    v: 3,
    c: "html"
  },
  {
    q: `
Перед нами страница с видеоплеером, вопросом и вариантами ответа. Видеоплеер реализован через тэг video в html5. Чтобы пользователю ответить, ему нужно обязательно просмотреть видео и узнать текст задачи и подсказки к решению. Фрагмент кода плеера представлен ниже
<video controls>
    <source src="/video.mp4" type="video/mp4">
    <source src="/video.webm" type="video/webm">
    <source src="/video.ogv" type="video/ogg">
    Ваш браузер не подходит.
</video>

Что еще можно сделать с этим кодом, чтобы улучшить восприятие пользователем?
    `,
    a: [
      "итак все отлично",
      "добавить атрибут preload='auto'",
      "добавить buffered атрибут",
      "код нужно переписать"
    ],
    v: 2,
    c: "html"
  },
  {
    q: `
В браузере загружен html документ со следующим содержимым в body
<input tabindex="1"/>
<input type="checkbox" tabindex="-1">
<div tabindex="3" autofocus>div</div>
<select>
        <option>opt1</option>
        <option>opt2</option>
        <option>opt3</option>
</select>

Страница загрузилась успешно. И вы нажимаете 4 раза tab, 
то в какой последовательности будут фокусироваться элементы?
    `,
    a: [
      "input → checkbox → div → select",
      "div → select → input → div",
      "input → div → select → input",
      "checkbox → select → input → checkbox"
    ],
    v: 3,
    c: "html"
  }
];
