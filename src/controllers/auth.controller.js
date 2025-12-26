const jwt = require('jsonwebtoken')


const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
            if (err) {
                return reject(err)
            }
            return resolve(decoded)
        })
    })
}
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization.trim().split(" ")[1]
        let decoded = await verifyToken(token)
        console.log(decoded.user)
        req.user = decoded.user
        next()
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const authorize = (permittedRoles) => {
    return async (req, res, next) => {
        const user = req.user
        let isPermitted = false
        permittedRoles.map((role) => {
            if (user.role.includes(role)) {
                isPermitted = true
            }
        })

        if (isPermitted) {
            return next()
        }
        return res.status(401).send("You are not authorize to perform this task!")
    }
}

module.exports = { authenticate, authorize }