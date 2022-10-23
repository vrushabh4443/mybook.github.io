const Menu = require('../../models/menu')
function homecontroller() {
    return {
        async index(req, res) {
            const books = await Menu.find()
            return res.render('home', { books: books })
        }
    }
}

module.exports = homecontroller