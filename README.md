redis-cover - a wrpper for node_redis client
===========================

Install with:

    npm install --save redis
    npm install --save redis-cover
    
## Usage Example

```js
const redis = require("redis")
const redis_client = redis.createClient()

const rediscover = require('../index')
const cover = new rediscover(redis_client)

// use node-cover
cover
.mycover.test1.key1.set('value1')
.then(res => {
  return cover.mycover.test1.key2.set('value2')
})
.catch(err => {
  console.log('Test1', err)
})
```
===
```js
// Only use node_redis
redis_client.set('mycover:test1:key1', 'value1', (err, res) => {
  if(err) {
    console.log('Test1', err)
    return
  }
  redis_client.set('mycover:test2:key2', 'value2', (err, res) => {
    console.log('Test1', err)
  })
})
```

### Basic

* Generate key
```js
cover.mycover.test1.key1...
```

* Excute command
```js
cover.mycover.test1.key1.set('value1', cb)
```
===
```js
// as same as in node_redis
redis_client.set('mycover:test1:key1', 'value1', cb)
```

* Promise
```js
cover.aaa.bbb.ccc.set('value').then(cb).catch(err => {})
```

### Serial
It will break when error happened, just like ```Promise()```
```js
cover
.serial()
.mycover.test2.key1.set('value1')
.mycover.test2.key2.set('value2')
.exec((err, res) => {
})
.catch(err => {
  console.log('Test2', err)
})
```

### Pipeline
It will excute all commands no matter whether there is a error, just like ```Promise.all```
```js
cover
.pipeline()
.mycover.test3.key1.set('value1')
.mycover.test3.key2.set('value2')
.exec((err, res) => {
  console.log(err, res)
})
.catch(err => {
  console.log('Test3', err)
})
```

### Multi
If any command fails to queue, all commands are rolled back and none is going to be executed.
```js
cover
.multi()
.mycover.test4.key1.set('value1')
.mycover.test4.key2.set('value2')
.exec()
.catch(err => {
  console.log('Test4', err)
})
```

### Lowercase/Uppercase command in Serial/pipeline/multi

* Lowercase command will return root node
```js
cover
.multi()
.mycover.test5.key1.sadd('value1')
.mycover.test5.key2.set('value2')
.exec()
.catch(err => {
  console.log('Test4', err)
})
```
===
```js
// as same as in node_redis
redis_client
.multi()
.sadd('mycover:test5:key1', 'value1')
.set('mycover:test5:key2', 'value2')
.exec()
```

* Uppercase Command will return current target
```js
cover
.multi()
.mycover.test5.key1.SADD('value1').SADD('value2').subkey1.set('value3')
.mycover.test5.key2.set('value2')
.exec()
.catch(err => {
  console.log('Test4', err)
})
```
===
```js
// as same as in node_redis
redis_client
.multi()
.sadd('mycover:test5:key1', 'value1')
.sadd('mycover:test5:key1', 'value2')
.set('mycover:test5:key1:subkey1', 'value3')
.set('mycover:test5:key2', 'value2')
.exec()
```

### Separator
Default is `:`
```
const rediscover = require('../index')
const cover = new rediscover(redis_client)
cover.SEPARATOR = '.'
```
