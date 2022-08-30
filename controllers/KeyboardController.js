const { Keyboard } = require("vk-io");

const builder = Keyboard.builder()
	.textButton({
		label: 'Расписание',
		payload: {
			command: 'dairy'
		}
	})
	.row()
	.textButton({
		label: 'Ссылки',
		payload: {
			command: 'links',
		},
		color: Keyboard.POSITIVE_COLOR
	})
	.textButton({
		label: 'Команды',
		payload: {
			command: 'commands',
		},
		color: Keyboard.POSITIVE_COLOR
	})
	.row()
	.textButton({
		label: 'Почты',
		payload: {
			command: 'mails'
		},
		color: Keyboard.NEGATIVE_COLOR
    })
	.row()
	.textButton({
		label: 'Книги',
		payload: {
			command: 'books'
		}
	})
	.textButton({
		label: 'Ответы',
		payload: {
			command: 'answers'
		}
	})

module.exports = {
    builder
}