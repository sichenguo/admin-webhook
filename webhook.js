let http = require('http')
let crypto = require('crypto')
let spawn = require('child_process')
// let sentMail = require('./sendMail')
const SECRET = '123456'
function sign(data) {
  return (
    'sha1=' +
    crypto
      .createHmac('sha1', SECRET)
      .update(data)
      .digest('hex')
  )
}

let server = http.createServer((req, res) => {
  console.log(req.headers, req.method, req.url)
  if (req.url == '/webhook' && req.method === 'POST') {
    let buffers = []
    req.on('data', data => {
      buffers.push(data)
    })
    req.on('end', () => {
      let body = Buffer.concat(buffers)
      let sig = req.headers['x-hub-signature']
      let event = req.headers['x-github-event']
      let id = req.headers['x-github-delivery']
      if (sig !== sign(body)) {
        return res.end('Not Allowed')
      }
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
      // =========================================
      if (event === 'push') {
        let payload = JSON.parse(body)
        let child = spawn('sh', [`./${payload.repository.name}.sh`])
        let buffers = []
        child.stdout.on('data', data => {
          buffers.push(data)
        })
        child.stdout.on('end', () => {
          let logs = Buffer.concat(buffers)
          console.log(logs)
        })
      }
    })
  }
})

server.listen(4000, () => {
  console.log('webhook 服务已经在400端口启动')
})
