# Вектор

### Предпосылки

Должен быть установлен [Node.js](https://nodejs.org/en/)
Использовалась версия ноды 12.18.2

### Установка
Для начала нужно установить все зависимости:

```
npm i
```

### Сборка проекта

```
npm run build
```

### Поднятие проекта на локальном сервере

```
npm start
```

#### Вся разработка ведется в директории `src`. Итоговый код попадает в директорию `build`.

### Зависимости
Все зависимости прописаны в файле __package.json__ в поле `dependencies`.

* [aos](https://michalsnik.github.io/aos/) - animation on scroll
* [swiper](https://swiperjs.com/) - slider

### Запуск тестов

В проекте использовался линтер, который поможет вам избежать ошибок и обеспечить соблюдение правил в ваших стилях. Запустите тесты этой командой:

```
npm test
```

Так же вы можете установить плагин __stylelint__ для своего редактора, чтобы видеть ошибки прямо в нем, на запуская тесты.

### Авторы

* [Роман Кушнир](https://t.me/raccoonroman)

### Остальное

##### HTML
В папке `src/html/pages` находятся все html-файлы страниц.
В папке `src/html/components` находятся компоненты которые можно поключать к станицам или другим компонентам с помощью тега [include](https://www.npmjs.com/package/posthtml-include).
Разметка написана по БЭМ-методологии.
Хедер и футер лежат в директории `src/html/layout`.

HTML-компоненты, которые разделяются двойным дефисом имеют один общий файл стилей. Например для компонентов `main-header.html`, `main-header--advertising.html`, `main-header--design.html` используется один файл стилей `main-header.scss`.

##### CSS
Используется препроцесор `sass`.
Все общие/глобальные стили находятся в файле `src/sass/common.scss`.
В директории `src/sass/components` находятся файлы соответствующих бэм-блоков из разметки.

##### JS
Скрипты писались на ES6 c использованием webpack, настройки которого есть в файле `gulpfile.js`.

Каждый модуль скриптов лежит в отдельном файле, который импортируется в главный файл `app.js`, который подключен ко всем html-файлам. Все подключенные зависимости находятся в этом файле.
