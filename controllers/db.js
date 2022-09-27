const mysql = require('mysql')

// создание подключения
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'bot_db',
    password: 'root'
})

connection.connect(err => {
    if(err) {
        console.log(err)
        return err
    } else {
        console.log('Database is connected')
    }
})


// экспорт подключения для будущего использования команд mysql
module.exports = {
    connection
}
