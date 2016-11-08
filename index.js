const commands = require('redis-commands')

const Cover = new Proxy(
  class {
  }
  , {
    construct: (target, args) => {
      let client = args[0]
      let dirs = args[1]
      let mode = args[2]

      let cmds = []

      let root = proxy(dirs)
      return root

      function proxy (dirs = []) {
        return new Proxy(() => {
        }, {
          get: (target, prop) => {
            if (Reflect.ownKeys(target).includes(prop)) {
              return target[prop]
            }else {
              return proxy([...dirs, {
                name: prop
              }])
            }
          },
          apply(target, ctx, args) {
            let cb = () => {
            }
            if (args[args.length - 1] instanceof Function) {
              cb = args.pop()
            }

            let dir = dirs[dirs.length - 1]
            dir.cmd = true
            let cmd = dir.name

            if (cmd === 'serial') {
              dirs.pop()
              return new Cover(client, dirs, 'serial')
            }
            else if (cmd === 'pipeline') {
              dirs.pop()
              return new Cover(client, dirs, 'pipeline')
            }
            else if (cmd === 'multi') {
              dirs.pop()
              return new Cover(client.multi(), dirs, 'multi')
            }
            else if (cmd === 'exec') {
              dirs.pop()
              if (mode === 'serial') {
                return new Promise((resolve, reject) => {
                  let results = []
                  perform(0)
                  function perform (index) {
                    let item = cmds[index]
                    if (!item) {
                      cb(null, results)
                      return resolve(results)
                    }
                    item.client[item.cmd](item.key, ...item.args, (err, ...res) => {
                      item.cb(err, ...res)

                      results.push([err, ...res])
                      if (err) {
                        cb(err, results)
                        reject(err)
                      }else {
                        perform(++index)
                      }
                    })
                  }
                })
              }
              else if (mode === 'pipeline') {
                let error = null
                let results = []
                return Promise.all(cmds.map(item => {
                  return new Promise((resolve, reject) => {
                    item.client[item.cmd](item.key, ...item.args, (err, ...res) => {
                      item.cb(err, ...res)

                      error = error || err
                      results.push([err, ...res])
                      if (results.length === cmds.length) {
                        cb(error, results)
                      }
                    })
                  })
                }))
                  .then()
              }
              else if (mode === 'multi') {
                return new Promise((resolve, reject) => {
                  client.exec((err, ...res) => {
                    cb(err, ...res)
                    err ? reject(err) : resolve(...res)
                  })
                })
              }
            }
            else if (commands.list.includes(cmd.toLowerCase())) {
              let start = 0
              let end = dirs.length - 1
              for (let index = end; index >= 0; index--) {
                if (!dirs[index].cmd) {
                  end = index
                  break
                }
              }
              for (let index = end; index >= 0; index--) {
                if (dirs[index].cmd) {
                  start = index + 1
                  break
                }
              }
              let key = dirs.slice(start, end + 1).map(dir => {
                return dir.name
              }).join(Cover.SEPARATOR)

              if (mode === 'serial' || mode === 'pipeline') {
                cmds.push({
                  client,
                  cmd,
                  key,
                  args,
                cb})
                return cmd.toLowerCase() === cmd ? root : ctx
              }
              else if (mode === 'multi') {
                client[cmd](key, ...args, cb)
                return cmd.toLowerCase() === cmd ? root : ctx
              }else {
                return new Promise((resolve, reject) => {
                  client[cmd](key, ...args, (err, ...res) => {
                    cb(err, ...res)
                    err ? reject(err) : resolve(...res)
                  })
                })
              }
            }else {
              return dirs
            }
          }
        })
      }
    }
  })

Cover.SEPARATOR = ':'

module.exports = Cover
