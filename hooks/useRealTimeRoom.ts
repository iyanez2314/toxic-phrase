"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"

interface Player {
  id: string
  name: string
  guess: number | null
  difference: number | null
  joinedAt: number
}

interface GameRoom {
  id: string
  title: string
  state: "waiting" | "guessing" | "finished"
  players: Player[]
  correctAnswer: number | null
  winner: Player | null
  host: string | null
  lastUpdated: number
}

export function useRealTimeRoom(roomId: string) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [roomClosed, setRoomClosed] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io(process.env.NODE_ENV === 'production' ? '' : process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      
      // Join the room
      socket.emit('joinRoom', { roomId, playerId })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    // Room event handlers
    socket.on('roomJoined', (data: { room: GameRoom; isHost: boolean }) => {
      console.log('Room joined:', data)
      setRoom(data.room)
      setIsHost(data.isHost)
    })

    socket.on('gameUpdate', (data: { room: GameRoom }) => {
      console.log('Game update:', data)
      setRoom(data.room)
    })

    socket.on('roomClosed', (data: { roomId: string }) => {
      console.log('Room closed:', data)
      setRoomClosed(true)
      setRoom(null)
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setIsConnected(false)
    })

    // Cleanup function
    return () => {
      socket.disconnect()
    }
  }, [roomId, playerId])

  // Action functions
  const joinGame = useCallback(
    async (playerName: string) => {
      if (!socketRef.current) return false

      socketRef.current.emit('joinGame', {
        roomId,
        playerId,
        playerName
      })
      return true
    },
    [roomId, playerId]
  )

  const removePlayer = useCallback(
    async (playerIdToRemove: string) => {
      if (!socketRef.current) return false

      socketRef.current.emit('removePlayer', {
        roomId,
        hostId: playerId,
        playerId: playerIdToRemove
      })
      return true
    },
    [roomId, playerId]
  )

  const startGuessing = useCallback(async () => {
    if (!socketRef.current) return false

    socketRef.current.emit('startGuessing', {
      roomId,
      hostId: playerId
    })
    return true
  }, [roomId, playerId])

  const submitGuess = useCallback(
    async (guess: number) => {
      if (!socketRef.current) return false

      socketRef.current.emit('submitGuess', {
        roomId,
        playerId,
        guess
      })
      return true
    },
    [roomId, playerId]
  )

  const revealAnswer = useCallback(
    async (answer: number) => {
      if (!socketRef.current) return false

      socketRef.current.emit('revealAnswer', {
        roomId,
        hostId: playerId,
        answer
      })
      return true
    },
    [roomId, playerId]
  )

  const resetGame = useCallback(async () => {
    if (!socketRef.current) return false

    socketRef.current.emit('resetGame', {
      roomId,
      hostId: playerId
    })
    return true
  }, [roomId, playerId])

  const updateTitle = useCallback(
    async (title: string) => {
      if (!socketRef.current) return false

      socketRef.current.emit('updateTitle', {
        roomId,
        hostId: playerId,
        title
      })
      return true
    },
    [roomId, playerId]
  )

  const closeRoom = useCallback(async () => {
    if (!socketRef.current) return false

    socketRef.current.emit('closeRoom', {
      roomId,
      hostId: playerId
    })
    return true
  }, [roomId, playerId])

  return {
    room,
    isHost,
    isConnected,
    playerId,
    roomClosed,
    joinGame,
    removePlayer,
    startGuessing,
    submitGuess,
    revealAnswer,
    resetGame,
    updateTitle,
    closeRoom,
  }
}
