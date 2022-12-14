// импорт библиотек и модулей
const { VK } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const fs = require('fs')
const { mails } = require('./files/mails')
const { builder } = require('./controllers/KeyboardController')
const { connection } = require('./controllers/db.js')
const axios = require('axios')
const cheerio = require('cheerio')

// инициализация бота
const vk = new VK({
    // получаем токен из heroku
    token: ''
});



// начальные переменные для будущего использования
let isFollowing = true
let text = []
let links = []
let parsText = []
let parsLinks = []
let getUsers = "SELECT * from `users`"

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

// создание пользователя, если его уже нет в бд
function createUser(msg) {
    connection.query(`SELECT * FROM users WHERE user_id=${msg.senderId}`, (err, result) => {
        if(result.length == 0) {
            connection.query(`INSERT INTO users(user_id, role, sending_status) VALUES(${msg.senderId}, 'user', 1)`, (err, second_result) => {
                if(err) { console.log(err) }
                console.log(second_result)
            })
        } else {
            console.log('Этот пользователь уже есть в бд')
        }
    })
}

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
            // создание пользователя для рассылки расписания
            createUser(msg)
        }
    });
})

bot.hear(/^ссылки$/i, msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send('Постоянные ссылки преподавателей для дистанционного обучения: https://docs.google.com/spreadsheets/d/1F7nprxnJRvl7cA-33-L9UmojJunsP7niDfwEep3_K0s/edit?usp=sharing')
        createUser(msg)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^почты$/i, msg => {
    checkFollowing(msg)
    // берет массив mails и массив в нем соединяет, потом отпрвляет сразу весь список
    if(isFollowing == true) {
        msg.send(mails.join(''))
        createUser(msg)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^команды$/i, msg => {
    createUser(msg)
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
        createUser(msg)
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
        createUser(msg)
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
        createUser(msg)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})

bot.hear(/^расписание$/i, msg => {
checkFollowing(msg)
if(isFollowing == true) {
    msg.send('Вот ссылка на расписание: https://www.mgkit.ru/studentu/raspisanie-zanatij')
    createUser(msg)
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

bot.hear(/^кто тут педик$/i, msg => {
    // проверка на чат
    if(msg.isChat) {
        msg.reply('Да ты и есть педик, чтоб тебя черти драли нахуй во все щели. Иди нахуй вообще. На Русика быканул, хуйца соснул')
        // кикает пользователя
        vk.api.messages.removeChatUser({
            chat_id: msg.chatId,
            user_id: msg.senderId,
        })
    } else {
        msg.reply('Да ты и есть педик, чтоб тебя черти драли нахуй во все щели. Иди нахуй вообще. На Русика быканул, хуйца соснул')
    }
})

bot.hear(/^я гей$/i, msg => {
    createUser(msg)
    connection.query(`SELECT * FROM users WHERE user_id=${msg.senderId}`, (err, result) => {
        console.log(result)
        for(i = 0; i < result.length; i++) {
            if(result[i].role == 'admin') {
                msg.send('Нет, ты натурал')
            } else {
                msg.send('Все правильно, ты гей на ' + Math.ceil(Math.random() * 100) + '%')
            }
        }
    })
})

bot.hear(/^расписание препод$/i, msg => {
checkFollowing(msg)
if(isFollowing == true) {
        msg.send('Вот ссылка на преподавательское расписание: https://www.mgkit.ru/studentu/raspisanie-zanatij')
        createUser(msg)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})


console.log('Бот запущен')
// включает работу бота и реакцию, также логирует ошибки
vk.updates.start().catch(console.error)
