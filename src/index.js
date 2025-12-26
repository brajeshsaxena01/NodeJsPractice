const express = require('express')
const { connect } = require('./config/db.js')
const { userController } = require('./controllers/users.controller.js')
const { client } = require('./config/redis.js')
const { upload } = require('./controllers/upload.controller.js')
const { errorHander } = require('./middlewares/errorHandler.js')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT
app.use(express.json())

app.get("/", (req, res) => {
    return res.status(200).send("Hello World!")
})

app.use("/users", userController)
app.use("/upload", upload.single("file"), async (req, res) => {
    console.log(req.file.originalname)
    // You can connect s3 bucket and upload it there and then delete file if no need
    return res.status(200).send("File uploaded successfully!")
})
function cal() {
    let a = 2
    let b = 3
    return a + b
}
app.get("/total", async (req, res) => {
    const total = cal()
    res.send(total)
})

app.use(errorHander)
app.listen(PORT, async () => {
    console.log(process.env.MONGO_URI, PORT)
    await connect()
    await client.connect()
    console.log(`Listening on port ${PORT}.`)
})
