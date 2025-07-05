const { createServer } = require('http')
const { Server } = require('socket.io')

const port = parseInt(process.env.PORT || '4000', 10)

// In-memory storage for game rooms
const gameRooms = new Map()

const server = createServer()

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('joinRoom', ({ roomId, playerId }) => {
    console.log(`Player ${playerId} joining room ${roomId}`)
    
    socket.join(roomId)
    
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, {
        id: roomId,
        title: "Toxic Coworker Phrase Counter",
        phrase: null,
        state: "waiting",
        players: [],
        correctAnswer: null,
        winner: null,
        host: null,
        lastUpdated: Date.now()
      })
    }

    const room = gameRooms.get(roomId)
    
    // Set first joiner as host
    if (!room.host) {
      room.host = playerId
    }

    socket.emit('roomJoined', {
      room: room,
      isHost: room.host === playerId
    })
  })

  socket.on('joinGame', ({ roomId, playerId, playerName }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.state !== "waiting") return

    // Check if player already exists
    const existingPlayer = room.players.find(p => p.id === playerId)
    if (existingPlayer) return

    const newPlayer = {
      id: playerId,
      name: playerName,
      guess: null,
      difference: null,
      joinedAt: Date.now()
    }

    room.players.push(newPlayer)
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('removePlayer', ({ roomId, hostId, playerId }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    room.players = room.players.filter(p => p.id !== playerId)
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('startGuessing', ({ roomId, hostId }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId || room.players.length === 0) return

    room.state = "guessing"
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('submitGuess', ({ roomId, playerId, guess }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.state !== "guessing") return

    const player = room.players.find(p => p.id === playerId)
    if (player) {
      player.guess = guess
      room.lastUpdated = Date.now()
    }

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('revealAnswer', ({ roomId, hostId, answer }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    room.correctAnswer = answer
    room.state = "finished"

    // Calculate differences and find winner
    room.players.forEach(player => {
      if (player.guess !== null) {
        player.difference = Math.abs(player.guess - answer)
      }
    })

    const playersWithGuesses = room.players.filter(p => p.guess !== null)
    if (playersWithGuesses.length > 0) {
      room.winner = playersWithGuesses.reduce((closest, current) =>
        current.difference !== null && (closest.difference === null || current.difference < closest.difference)
          ? current
          : closest
      )
    }

    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('resetGame', ({ roomId, hostId }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    room.state = "waiting"
    room.players = []
    room.correctAnswer = null
    room.winner = null
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('updateTitle', ({ roomId, hostId, title }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    room.title = title
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('updatePhrase', ({ roomId, hostId, phrase }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    room.phrase = phrase
    room.lastUpdated = Date.now()

    io.to(roomId).emit('gameUpdate', { room })
  })

  socket.on('closeRoom', ({ roomId, hostId }) => {
    const room = gameRooms.get(roomId)
    if (!room || room.host !== hostId) return

    console.log(`Host ${hostId} closing room ${roomId}`)
    
    // Notify all clients in the room that it's being closed
    io.to(roomId).emit('roomClosed', { roomId })
    
    // Remove the room from memory
    gameRooms.delete(roomId)
    
    // Disconnect all sockets from this room
    const sockets = io.sockets.adapter.rooms.get(roomId)
    if (sockets) {
      sockets.forEach(socketId => {
        io.sockets.sockets.get(socketId)?.leave(roomId)
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

server.listen(port, (err) => {
  if (err) throw err
  console.log(`> Socket.IO server ready on port ${port}`)
}) 