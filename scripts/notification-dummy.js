const createServer = require('http').createServer
const Server = require('socket.io').Server

const httpServer = createServer()
const io = new Server(httpServer, {})

io.on('connection', (_socket) => {
  console.log('Notification socket connected.')
  io.on('message', (data) => {
    console.log('Notification socket received message: ', data)
  })
})

httpServer.listen(3001)
