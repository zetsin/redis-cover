redis-cover - a wrpper for node_redis client
===========================

Install with:

    npm install --save redis
    npm install --save redis-cover
    
## Usage Example

```js
const redis = require("redis")
const client = redis.createClient()

const rediscover = require('../index')
const cover = new rediscover(client)

// use node-cover
cover
.mycover.test1.key1.set('value1')
.then(res => {
  return cover.mycover.test1.key2.set('value2')
})
.catch(err => {
  console.log('Test1', err)
})

// Only use node_redis
client.set('myredis:test1:key1', 'value1', (err, res) => {
  if(err) {
    console.log('Test1', err)
    return
  }
  client.set('myredis:test2:key2', 'value2', (err, res) => {
    console.log('Test1', err)
  })
})
```
