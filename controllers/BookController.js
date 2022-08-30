const fs = require('fs')

class BookController {
    sendFilesFromFolder(msg, path) {
        let files = fs.readdirSync(path)

        for(file in files) {
            msg.sendDocuments({ value: `./${path}/${files[file]}`, filename: files[file] })
        }
    }
}


module.exports = {
    BookController
}