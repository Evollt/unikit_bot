// импорт библиотек и модулей
const { VK } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const fs = require('fs')
const { parsLinks, parsText } = require('./controllers/ParserController.js')
const { mails } = require('./files/mails')
const { builder } = require('./controllers/KeyboardController')

// инициализация бота
const vk = new VK({
    // получаем токен из heroku
    token: "vk1.a._bW2ukPPPHkL_UNOAIya6Ujcb48_-cWSSO1H7elSshT6UZ9oonPOIZ3V21KqNpM-u04vvU3gn1_7SXOt2OZPRaHYGYkMm3Eve9dtl5UfYzu_QsjHBUxUpimO1OD-_nKN3iK6DebyQ9GZ7peYinZJJaMaq9JAnDqGTHf4KI4Y8PKynVDXQXIDPwCIC_a3g2VV"
});

// начальные переменные для будущего использования
let isFollowing = true
let text = []
let links = []

// подключение слушателя событий
const bot = new HearManager()

// проверка подписки на канал бота
function checkFollowing(msg) {
    vk.api.groups.isMember({
        group_id: 211782829,
        user_id: msg.senderId
    }).then((response) => {
        if(response == 0) {
            isFollowing = false
        }
        if(response == 1) {
            isFollowing = true
        }
    });
}

function parsInfo() {
    text = parsText
    links = parsLinks
    console.log('Обновлено')
}

// парсит в самом начале работы сервера через 5 секунд
setTimeout(parsInfo, 5000)


// каждые 15 минут обновляет вывод информации парсером
setInterval(function () {
    text = parsText
    links = parsLinks
    console.log('Обновлено')
    vk.api.messages.send({
        random_id: 0,
        user_id: 329056111,
        peer_id: 329056111,
        message: 'Прошло 15 минут, расписание должно было обновиться'
    })
}, 15*60*1000)

// слушает событие по новым сообщениям
vk.updates.on('message_new', bot.middleware)

bot.hear(/^начать$/i, msg => {
    // проверка на подписку
    vk.api.groups.isMember({
        group_id: 211782829,
        user_id: msg.senderId
    }).then(async (response) => {
        if(response == 0) {
            msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy.\n p. s. Также прошу обратить ваше внимание, что пока вы не подпишетесь ни одна команда бота работать не будет :(');
            isFollowing = false
        }
        if(response== 1) {
            // выводит на экран клавиатуру и отправляет приветственное сообщение
            await vk.api.messages.send({
                // ...
                random_id: 0,
                user_id: msg.senderId,
                peer_id: msg.senderId,
                message: 'Привет. Я бот, который будет скидывать тебе расписание, ссылки на дистанционное обучение, книги, ответы, почты и конечно обеденные перерывы. Если хотите знать какие команды я знаю, то просто напишите в поле ввода слово "команды" \n Ссылка на вк моего создателя: @evollt',
                keyboard: builder
            });
            isFollowing = true
        }
    });
})

bot.hear(/^ссылки$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send('Постоянные ссылки преподавателей для дистанционного обучения: https://docs.google.com/spreadsheets/d/1F7nprxnJRvl7cA-33-L9UmojJunsP7niDfwEep3_K0s/edit?usp=sharing')
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^почты$/i, msg => {
    checkFollowing(msg)
    // берет массив mails и массив в нем соединяет, потом отпрвляет сразу весь список
    if(isFollowing == true) {
        msg.send(mails.join(''))
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^команды$/i, msg => {
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

bot.hear(/^обед$/i, (msg) => {
    checkFollowing(msg)
    if(isFollowing == true) {
        // отправляет фотографию с обедом
        msg.sendPhotos({ value: './files/dinner.png' })
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^книги$/i, async msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        // берет названия всех файлов из этой папки и отправляет пользователю
        let files = fs.readdirSync('./books')

        for(file in files) {
            await msg.sendDocuments({ value: `./books/${files[file]}`, filename: files[file] })
        }
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^ответы$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send('Ответы Голицинский: https://otvetkin.info/reshebniki/5-klass/angliyskiy-yazyk/golicynskij-7')
        msg.send('Решебник Абрамяна: https://uteacher.ru/reshebnik-abramyan/')
        msg.sendDocuments({ value: './answers/Ответы(Аракин).pdf', filename: 'Ответы(Аракин).pdf' })
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^расписание$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        // msg.send(`${text[4]}${text[5]}${text[6]}: ${links[5]}`)
        // msg.send(`${text[10]}${text[11]}${text[12]}: ${links[11]}`)
        msg.send(`${text[2]}: ${links[2]}`)
        msg.send(`${text[6]}${text[7]}${text[8]}: ${links[7]}`)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^мой id$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        let senderId = msg.senderId;
        msg.send(senderId)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^расписание препод$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send(`${text[1]}: ${links[1]}`)
        msg.send(`${text[3]}${text[4]}${text[5]}: ${links[4]}`)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})


console.log('Бот запущен')
// включает работу бота и реакцию, также логирует ошибки
vk.updates.start().catch(console.error)