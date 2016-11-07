const redis = require("redis")
const client = redis.createClient()

const rediscover = require('../index')
const cover = new rediscover(client)

// // TEST 1. Promise
cover
.mycover.test1.key1.hset(['key12', 'value12'])
.then(res => {
  return cover.mycover.test1.key2.set('value2')
})
.catch(err => {
  console.log('Test1', err)
})

// Test2. serial
cover
.serial()
.mycover.test2.key1.set('value1')
.mycover.test2.key2.set('value2')
.exec((err, res) => {
})
.catch(err => {
  console.log('Test2', err)
})

// Test3. pipeline
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


// Test4. multi
cover
.multi()
.mycover.test4.key1.SET('value1').key11.set('value11')
.mycover.test4.key2.set('value2')
.exec()
.catch(err => {
  console.log('Test4', err)
})