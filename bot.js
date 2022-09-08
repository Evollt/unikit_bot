// импорт библиотек и модулей
const { VK } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const fs = require('fs')
const { mails } = require('./files/mails')
const { builder } = require('./controllers/KeyboardController')
const axios = require('axios')
const cheerio = require('cheerio')

// инициализация бота
const vk = new VK({
    // получаем токен из heroku
    token: process.env.TOKEN
});

// начальные переменные для будущего использования
let isFollowing = true
let parsLinks = []
let parsText = []
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
        // парсинг сайта
        axios.get('https://www.mgkit.ru/studentu/raspisanie-zanatij').then(html => {
            const $ = cheerio.load(html.data)
            $('a').each((i, elem) => {
                let href = $(elem).attr('href')
                // знак вопроса после переменной стоит из-за includes
                if(href?.includes('https://drive.google.com/file/d/')) {
                    parsLinks.push(href)
                    parsText.push($(elem).text())
                }
            })
            // логируем все данные, чтобы если что легко дебажить)
            console.log(parsLinks)
            console.log(parsText)

            msg.send(`${parsText[2]}: ${parsLinks[2]}`)
            msg.send(`${parsText[6]}${parsText[7]}${parsText[8]}: ${parsLinks[7]}`)
        })
        // msg.send(`${text[4]}${text[5]}${text[6]}: ${links[5]}`)
        // msg.send(`${text[10]}${text[11]}${text[12]}: ${links[11]}`)
        console.log('Сообщение отправлено')
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
        // парсинг сайта
        axios.get('https://www.mgkit.ru/studentu/raspisanie-zanatij').then(html => {
            const $ = cheerio.load(html.data)
            $('a').each((i, elem) => {
                let href = $(elem).attr('href')
                // знак вопроса после переменной стоит из-за includes
                if(href?.includes('https://drive.google.com/file/d/')) {
                    parsLinks.push(href)
                    parsText.push($(elem).text())
                }
            })
            // логируем все данные, чтобы если что легко дебажить)
            console.log(parsLinks)
            console.log(parsText)

            msg.send(`${parsText[1]}: ${parsLinks[1]}`)
            msg.send(`${parsText[3]}${parsText[4]}${parsText[5]}: ${parsLinks[4]}`)
        })
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/unikit_dairy')
    }
})


console.log('Бот запущен')
// включает работу бота и реакцию, также логирует ошибки
vk.updates.start().catch(console.error)