// This file is executed once when the server is started
console.log('Setting up socket.io server ...')

// Setup a socket.io server on port 3001 that has CORS disabled (do not set this to port 3000 as port 3000 is where the nuxt dev server serves your nuxt application)
const io = require('socket.io')(3001, {
  cors: {
    // No CORS at all
    origin: '*',
  },
})

// var i = 0;
// setInterval(() => {
//     i++;
//     io.emit("tick", i);
// }, 1000);


io.on('connection', (socket) => {
  socket.on('join', function (room) {
    socket.join(room)
    socket.to(room).emit('playerConnected')
    io.to(socket.id).emit('waitingPlayer', io.sockets.adapter.rooms.get(room).size)
  })

  socket.on('tableChoose', function(table, room, wordToFindString){
   
    socket.to(room).emit('createTable', table, wordToFindString)
  })
  socket.on('wordProposition', function(room, propositionOpponent, tryNumber){

    socket.to(room).emit('propOpponent', propositionOpponent, tryNumber)
  })

  socket.on('newWord', function(room, wordToFindString){
    io.to(room).emit('newRound', wordToFindString)
  })

  socket.on('looseOpponentToPlay', function(room, userNumber, wordToFindString){
    socket.to(room).emit('opponentLooseTurnToPlay', userNumber)
  })


})



// Since we are a serverMiddleware, we have to return a handler, even if this it does nothing
export default function (req, res, next) {
  next()
}
