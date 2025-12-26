
const errorHander = async (err, req, res, next) => {

    if (err) {
        return res.status(err.status || 500).send({ message: err.message, statusCode: err.status || 500 })
    }
}

module.exports = {errorHander}