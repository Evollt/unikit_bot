// импорт библиотек и модулей
const { VK } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const config = require('./config.json')
const fs = require('fs')
const { links, text } = require('./parser.js')
const { mails } = require('./files/mails')

// инициализация бота
const vk = new VK({
	token: config.token
});

// подключение слушателя событий
const bot = new HearManager()

// слушает событие по новым сообщениям
vk.updates.on('message_new', bot.middleware)

bot.hear(/начать/i, msg => {
    msg.send('Привет. Я бот, который будет скидывать тебе расписание, ссылки на дистанционное обучение, книги, ответы, почты и конечно обеденные перерывы. Если хотите знать какие команды я знаю, то просто напишите в поле ввода слово "команды"')
})

bot.hear(/ссылки/i, msg => {
    msg.send('Постоянные ссылки преподавателей для дистанционного обучения: https://docs.google.com/spreadsheets/d/1F7nprxnJRvl7cA-33-L9UmojJunsP7niDfwEep3_K0s/edit?usp=sharing')
})

bot.hear(/почты/i, (msg) => {

    msg.send(mails.join(''))
})

bot.hear(/команды/i, msg => {
    msg.send(`
        Мои команды:\n
            \t 1. Расписание
            \t 2. Ссылки
            \t 3. Книги
            \t 4. Ответы
            \t 5. Почты
            \t 6. Обед
    `)
})

bot.hear(/обед/i, (msg) => {
    msg.sendPhotos({ value: './files/dinner.png' })
})

bot.hear(/книги/i, msg => {
    let files = fs.readdirSync('./books')

    for(file in files) {
        msg.sendDocuments({ value: `./books/${files[file]}`, filename: files[file] })
    }
})

bot.hear(/ответы/i, msg => {
    msg.send('Ответы Голицинский: https://otvetkin.info/reshebniki/5-klass/angliyskiy-yazyk/golicynskij-7')
    msg.send('Решебник Абрамяна: https://uteacher.ru/reshebnik-abramyan/')
    msg.sendDocuments({ value: './answers/Ответы(Аракин).pdf', filename: 'Ответы(Аракин).pdf' })
})

bot.hear(/расписание/i, msg => {
    msg.send(`${text[4]}${text[5]}${text[6]}: ${links[5]}`)
    msg.send(`${text[10]}${text[11]}${text[12]}: ${links[11]}`)
})

console.log('Бот запущен')
// включает работу бота и реакцию, также логирует ошибки
vk.updates.start().catch(console.error)