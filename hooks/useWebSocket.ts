"use client"

import { useEffect, useRef, useState } from "react"
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
}

export function useWebSocket(roomId: string) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      
      // Join room immediately on connection
      socket.emit('joinRoom', { roomId, playerId })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socket.on('roomJoined', (data) => {
      setRoom(data.room)
      setIsHost(data.isHost)
    })

    socket.on('gameUpdate', (data) => {
      setRoom(data.room)
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId, playerId])

  const joinGame = (playerName: string) => {
    if (!socketRef.current || !isConnected) return false

    socketRef.current.emit('joinGame', {
      roomId,
      playerId,
      playerName
    })
    return true
  }

  const removePlayer = (playerIdToRemove: string) => {
    if (!socketRef.current || !isConnected || !isHost) return false

    socketRef.current.emit('removePlayer', {
      roomId,
      hostId: playerId,
      playerId: playerIdToRemove
    })
    return true
  }

  const startGuessing = () => {
    if (!socketRef.current || !isConnected || !isHost) return false

    socketRef.current.emit('startGuessing', {
      roomId,
      hostId: playerId
    })
    return true
  }

  const submitGuess = (guess: number) => {
    if (!socketRef.current || !isConnected) return false

    socketRef.current.emit('submitGuess', {
      roomId,
      playerId,
      guess
    })
    return true
  }

  const revealAnswer = (answer: number) => {
    if (!socketRef.current || !isConnected || !isHost) return false

    socketRef.current.emit('revealAnswer', {
      roomId,
      hostId: playerId,
      answer
    })
    return true
  }

  const resetGame = () => {
    if (!socketRef.current || !isConnected || !isHost) return false

    socketRef.current.emit('resetGame', {
      roomId,
      hostId: playerId
    })
    return true
  }

  const updateTitle = (title: string) => {
    if (!socketRef.current || !isConnected || !isHost) return false

    socketRef.current.emit('updateTitle', {
      roomId,
      hostId: playerId,
      title
    })
    return true
  }

  return {
    room,
    isHost,
    isConnected,
    playerId,
    joinGame,
    removePlayer,
    startGuessing,
    submitGuess,
    revealAnswer,
    resetGame,
    updateTitle,
  }
}
