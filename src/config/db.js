const mongoose = require('mongoose')
require('dotenv').config()
console.log(process.env.MONGO_URI)
const connect = () => {
    return mongoose.connect(process.env.MONGO_URI)
}

module.exports = { connect }