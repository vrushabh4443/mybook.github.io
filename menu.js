const mongoose = require('mongoose')
const Schema = mongoose.Schema

const menuSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    size: String,
})

module.exports = mongoose.model('menu', menuSchema)