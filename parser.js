const axios = require('axios')
const cheerio = require('cheerio')

// в этих массивах будут храниться ссылки и текста
let links = []
let text = []

// парсинг сайта
axios.get('https://www.mgkit.ru/studentu/raspisanie-zanatij').then(html => {
    const $ = cheerio.load(html.data)
    $('a').each((i, elem) => {
        let href = $(elem).attr('href')
        // знак вопроса после переменной стоит из-за includes
        if(href?.includes('https://drive.google.com/file/d/')) {
            links.push(href)
            text.push($(elem).text())
        }
    })
})

module.exports = {
    links,
    text
}