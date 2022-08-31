// импорт библиотек и модулей
const { VK } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const config = require('./config.json')
const fs = require('fs')
const { parsLinks, parsText } = require('./controllers/ParserController.js')
const { mails } = require('./files/mails')
const { builder } = require('./controllers/KeyboardController')

// инициализация бота
const vk = new VK({
	token: config.token
});

let isFollowing = true
let text = []
let links = []

// ! Надо доделать рассылку нового расписания
// vk.api.messages.send({
//     random_id: 0,
//     user_id: 329056111,
//     peer_id: 329056111,
//     message: 'Новое расписание'
// })


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
        if(response== 1) {
            isFollowing = true
        }
    });
}

setTimeout(function() {
    text = parsText
    links = parsLinks
    console.log('Обновлено первый раз')
}, 5000)

setInterval(function() {
    text = parsText
    links = parsLinks
    console.log('Обновлено')
}, 30*60*1000);

// слушает событие по новым сообщениям
vk.updates.on('message_new', bot.middleware)

bot.hear('начать'.toLowerCase(), msg => {
    // проверка на подписку
    vk.api.groups.isMember({
        group_id: 211782829,
        user_id: msg.senderId
    }).then(async (response) => {
        if(response == 0) {
            msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab.\n p. s. Также прошу обратить ваше внимание, что пока вы не подпишетесь ни одна команда бота работать не будет :(');
            isFollowing = false
        }
        if(response== 1) {
            // ! короче говоря, с клавой еще надо разобраться(
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

bot.hear('ссылки'.toLowerCase(), msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send('Постоянные ссылки преподавателей для дистанционного обучения: https://docs.google.com/spreadsheets/d/1F7nprxnJRvl7cA-33-L9UmojJunsP7niDfwEep3_K0s/edit?usp=sharing')
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('почты'.toLowerCase(), msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send(mails.join(''))
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('команды'.toLowerCase(), msg => {
    checkFollowing(msg)
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

bot.hear('обед'.toLowerCase(), (msg) => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.sendPhotos({ value: './files/dinner.png' })
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('книги'.toLowerCase(), async msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        let files = fs.readdirSync('./books')

        for(file in files) {
            // ! Доделать. Когдм отправляются книги, то vk со временем закрывает доступ из-за времени ответа бота
            // ? Вроде бы исправил баг, который описан выше, но как бы надо бы попозже потестить еще
            await msg.sendDocuments({ value: `./books/${files[file]}`, filename: files[file] })
        }
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('ответы'.toLowerCase(), msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        msg.send('Ответы Голицинский: https://otvetkin.info/reshebniki/5-klass/angliyskiy-yazyk/golicynskij-7')
        msg.send('Решебник Абрамяна: https://uteacher.ru/reshebnik-abramyan/')
        msg.sendDocuments({ value: './answers/Ответы(Аракин).pdf', filename: 'Ответы(Аракин).pdf' })
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('расписание'.toLowerCase(), msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        // msg.send(`${text[4]}${text[5]}${text[6]}: ${links[5]}`)
        // msg.send(`${text[10]}${text[11]}${text[12]}: ${links[11]}`)
        msg.send(`${text[2]}: ${links[2]}`)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})

bot.hear('мой id'.toLowerCase(), msg => {
    checkFollowing(msg)
    if(isFollowing == true) {
        let senderId = msg.senderId;
        msg.send(senderId)
    } else {
        msg.send('Подпишитесь, пожалуйста, на эту группу: https://vk.com/evolltdairyclab')
    }
})


console.log('Бот запущен')
// включает работу бота и реакцию, также логирует ошибки
vk.updates.start().catch(console.error)