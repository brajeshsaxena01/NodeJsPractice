const multer = require('multer')

const storage = multer.diskStorage({destination: "uploads"})

const upload = multer({ storage: storage })

module.exports = {upload}