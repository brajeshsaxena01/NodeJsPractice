const https = require('https')

const fetchData = () => {
    return new Promise((resolve, reject) => {
        https.get('https://coderbyte.com/api/challenges/logs/web-logs-raw', (res) => {
            let data = ""

            res.on("data", (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                resolve(data)
            })
            res.on("error", (err) => {
                reject(data)
            })
        })

    })
}

const getData = async () => {
    const data = await fetchData()
    console.log(data)
}
getData()

