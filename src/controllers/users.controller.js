const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('../models/users.model')
const { authenticate, authorize } = require('./auth.controller')
const { client } = require('../config/redis')

const router = express.Router()

router.post("/signup", async (req, res) => {
    try {
        const user = await User.create(req.body)
        const token = generateToken(user)
        const users = await User.find().lean().exec()
        client.set("users", JSON.stringify(users))
        client.set(`user.${user._id}`, JSON.stringify(user))
        return res.status(201).send({ user, token })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})
router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        console.log('user', user)
        if (!user) {
            return res.status(400).send("Wrong eamil or password!")
        }
        const match = user.checkPassword(req.body.password)
        if (!match) {
            return res.status(400).send("Wrong eamil or password!")
        }

        const token = generateToken(user)
        const users = await User.find().lean().exec()
        client.set("users", JSON.stringify(users))
        client.set(`user.${user._id}`, JSON.stringify(user))
        return res.status(201).send({ user, token })
    } catch (error) {
        // return res.status(500).send({ message: error.message })
        next(error)
    }
})
router.get("/:id", async (req, res) => {
    try {
        let cachedUser = await client.get(`user.${req.params.id}`)
        if (cachedUser) {
            let user = JSON.parse(cachedUser)
            return res.status(200).send({ user, redis: true })
        }
        const user = await User.findById(req.params.id).lean().exec()
        client.set(`user.${user._id}`, JSON.stringify(user))
        return res.status(200).send({ user, redis: false })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})
router.get("/", authenticate, authorize(['user']), async (req, res) => {

    try {
        let page = req.query.page || 1
        let limit = req.query.limit || 50
        let skip = (page - 1) * limit
        const users = await User.find().skip(skip).limit(limit).lean().exec()
        return res.status(200).send(users)
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

// update

router.patch("/update/:id", async (req, res) => {

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean().exec()
        return res.status(200).send(user)
    } catch (error) {
        return res.status(200).send({ message: error.message })
    }
})
router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id, { new: true }).lean().exec()
        return res.status(200).send(user)
    } catch (error) {
        return res.status(200).send({ message: error.message })
    }
})

const generateToken = (user) => {
    const token = jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: 3600 })
    return token
}

module.exports = { userController: router }