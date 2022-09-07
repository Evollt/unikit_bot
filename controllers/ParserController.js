const axios = require('axios')
const cheerio = require('cheerio')

// в этих массивах будут храниться ссылки и текста
let parsLinks = []
let parsText = []

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
})


module.exports = {
    parsLinks,
    parsText
}