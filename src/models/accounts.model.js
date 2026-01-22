// src/models/Account.js
const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    name: String,
    balance: {
        type: Number,
        required: true,
        min: 0
    }
})

const Account = mongoose.model("Account", accountSchema)
module.exports = { Account }
