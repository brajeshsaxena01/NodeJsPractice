const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLenght: 3 },
    role: { type: [String], default: ["user"] }
}, {
    versionKey: false,
    timestamps: true
})

userSchema.pre("save", function () {
    const hash = bcrypt.hashSync(this.password, 8)
    this.password = hash
    // return next()
})
// userSchema.methods.checkPassword = function (password) {
//     return bcrypt.compareSync(password, this.password)
// }

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}
const User = mongoose.model("user", userSchema)
module.exports = { User }