const { createClient } = require('redis')

// const client = createClient({
//     // url: "rediss://default:AX5lAAIncDIxZmI1Zjg2YzQ0YjU0MWJhOTY0M2Y2M2Q0YTdhYTdlYXAyMzIzNTc@finer-bear-32357.upstash.io:6379"
//     url: "redis-19377.c212.ap-south-1-1.ec2.cloud.redislabs.com:19377"
// });

const client = createClient({
    username: 'default',
    password: 'RYrw1aKtqnXdY4GJTyvEKxyL6D1BXg26',
    socket: {
        host: 'redis-14043.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 14043
    }
});

client.on('error', err => console.log('Redis Client Error', err));
// await client.connect()
// await client.set('foo','bar');

// // Disconnect after usage
// await client.disconnect();

module.exports = { client }