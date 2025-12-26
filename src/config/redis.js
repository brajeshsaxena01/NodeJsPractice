const { createClient } = require('redis')

const client = createClient({
    url: "rediss://default:AX5lAAIncDIxZmI1Zjg2YzQ0YjU0MWJhOTY0M2Y2M2Q0YTdhYTdlYXAyMzIzNTc@finer-bear-32357.upstash.io:6379"
});

client.on("error", function (err) {
    throw err;
});
// await client.connect()
// await client.set('foo','bar');

// // Disconnect after usage
// await client.disconnect();

module.exports = { client }