"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Trophy,
  Users,
  Target,
  Crown,
  Zap,
  RotateCcw,
  Plus,
  CheckCircle,
  Wifi,
  WifiOff,
  Copy,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRealTimeRoom } from "../../../hooks/useRealTimeRoom"
import { useParams } from "next/navigation"

interface Player {
  id: string
  name: string
  guess: number | null
  difference: number | null
  joinedAt: number
}

export default function GameRoom() {
  const params = useParams()
  const roomId = params.roomId as string
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [tempAnswer, setTempAnswer] = useState("")
  const [tempTitle, setTempTitle] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
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
  } = useRealTimeRoom(roomId)

  // Check if current player has already joined
  useEffect(() => {
    if (room && room.players.find((p) => p.id === playerId)) {
      setHasJoined(true)
    }
  }, [room, playerId])

  const handleJoinGame = async () => {
    if (newPlayerName.trim()) {
      setIsLoading(true)
      const success = await joinGame(newPlayerName.trim())
      if (success) {
        setNewPlayerName("")
        setIsJoinDialogOpen(false)
        setHasJoined(true)
      }
      setIsLoading(false)
    }
  }

  const handleRevealAnswer = async () => {
    const answer = Number(tempAnswer)
    if (!isNaN(answer)) {
      setIsLoading(true)
      const success = await revealAnswer(answer)
      if (success) {
        setTempAnswer("")
      }
      setIsLoading(false)
    }
  }

  const handleUpdateTitle = async () => {
    if (tempTitle.trim()) {
      setIsLoading(true)
      const success = await updateTitle(tempTitle.trim())
      if (success) {
        setTempTitle("")
      }
      setIsLoading(false)
    }
  }

  const handleStartGuessing = async () => {
    setIsLoading(true)
    await startGuessing()
    setIsLoading(false)
  }

  const handleResetGame = async () => {
    if (confirm("Are you sure you want to start a new meeting? This will clear all participants and bets.")) {
      setIsLoading(true)
      const success = await resetGame()
      if (success) {
        setHasJoined(false)
      }
      setIsLoading(false)
    }
  }

  const copyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    })
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold mb-2">Loading Game Room...</h2>
            <p className="text-gray-600 mb-4">Room ID: {roomId}</p>
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-500">Connecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.difference === null && b.difference === null) return 0
    if (a.difference === null) return 1
    if (b.difference === null) return -1
    return a.difference - b.difference
  })

  const getPlayerRank = (player: Player) => {
    if (room.state !== "finished" || player.difference === null) return null
    return sortedPlayers.findIndex((p) => p.id === player.id) + 1
  }

  const getRankEmoji = (rank: number | null) => {
    switch (rank) {
      case 1:
        return "🏆"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "🎯"
    }
  }

  const getStateColor = () => {
    switch (room.state) {
      case "waiting":
        return "bg-blue-100 text-blue-800"
      case "guessing":
        return "bg-yellow-100 text-yellow-800"
      case "finished":
        return "bg-green-100 text-green-800"
    }
  }

  const getStateText = () => {
    switch (room.state) {
      case "waiting":
        return "Waiting for Meeting Participants"
      case "guessing":
        return "Betting in Progress"
      case "finished":
        return "Meeting Complete"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {room.title}
            </h1>
            {isHost && room.state === "waiting" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500" disabled={isLoading}>
                    ✏️
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Game Title</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter new game title"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                    />
                    <Button onClick={handleUpdateTitle} className="w-full" disabled={isLoading}>
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update Title
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Connection Status & Room Info */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-3 py-1">
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? "Connected" : "Reconnecting..."}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Room: {roomId}
            </Badge>
            {isHost && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                👑 Host
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomLink}
              className={cn("text-xs px-2 py-1 h-auto transition-colors", showCopySuccess && "text-green-600")}
            >
              <Copy className="w-3 h-3 mr-1" />
              {showCopySuccess ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <Badge className={cn("text-lg px-4 py-2 mb-4", getStateColor())}>
            <Target className="w-4 h-4 mr-2" />
            {getStateText()}
          </Badge>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Participants: {room.players.length}
            </Badge>
            {room.state === "guessing" && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bets: {room.players.filter((p) => p.guess !== null).length}/{room.players.length}
              </Badge>
            )}
            {room.winner && (
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="w-4 h-4 mr-2" />
                Closest Bet: {room.winner.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {room.state === "waiting" && (
            <>
              {!hasJoined && (
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join the Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter your name"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                        disabled={isLoading}
                      />
                      <Button onClick={handleJoinGame} className="w-full" disabled={isLoading}>
                        {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Join Meeting
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isHost && (
                <Button
                  onClick={handleStartGuessing}
                  disabled={room.players.length === 0 || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Start Betting
                </Button>
              )}
            </>
          )}

          {room.state === "guessing" && isHost && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isLoading}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Reveal Actual Count
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter the Actual Count</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="How many times did they actually say it?"
                    value={tempAnswer}
                    onChange={(e) => setTempAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRevealAnswer()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleRevealAnswer} className="w-full" disabled={isLoading}>
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Reveal Closest Bet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {isHost && (
            <Button
              onClick={handleResetGame}
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              New Meeting
            </Button>
          )}
        </div>

        {/* Correct Answer Display */}
        {room.correctAnswer !== null && (
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-800 mb-2">Actual Count</div>
              <div className="text-4xl font-bold text-green-900">{room.correctAnswer}</div>
            </CardContent>
          </Card>
        )}

        {/* Players Grid */}
        {room.players.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent>
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2">No Meeting Participants Yet!</h3>
              <p className="text-gray-600 mb-4">Share the meeting link with others to start tracking those phrases!</p>
              <div className="text-sm text-gray-500 mb-4">
                Meeting ID: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
              </div>
              {!hasJoined && (
                <Button
                  onClick={() => setIsJoinDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(room.state === "finished" ? sortedPlayers : room.players).map((player) => {
              const rank = getPlayerRank(player)
              const isWinner = room.winner?.id === player.id
              const isCurrentPlayer = player.id === playerId

              return (
                <Card
                  key={player.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:scale-105",
                    isWinner && "ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50",
                    !isWinner && rank === 1 && "bg-gradient-to-br from-yellow-100 to-yellow-200",
                    !isWinner && rank === 2 && "bg-gradient-to-br from-gray-100 to-gray-200",
                    !isWinner && rank === 3 && "bg-gradient-to-br from-orange-100 to-orange-200",
                    !isWinner && (rank === null || rank > 3) && "bg-gradient-to-br from-blue-50 to-purple-50",
                    isCurrentPlayer && "ring-2 ring-blue-400",
                  )}
                >
                  {isWinner && <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>}
                  {isCurrentPlayer && (
                    <div className="absolute top-2 left-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">You</div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {rank && <span className="text-xl">{getRankEmoji(rank)}</span>}
                        {player.name}
                        {isWinner && <Crown className="w-5 h-5 text-yellow-600" />}
                      </CardTitle>
                      {isHost && room.state === "waiting" && !isCurrentPlayer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isLoading}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {room.state === "guessing" && isCurrentPlayer && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Enter your guess"
                          value={player.guess || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === "" || !isNaN(Number(value))) {
                              submitGuess(value === "" ? 0 : Number(value))
                            }
                          }}
                          disabled={isLoading}
                        />
                        {player.guess !== null && (
                          <Badge variant="secondary" className="w-full justify-center">
                            Guess Submitted: {player.guess}
                          </Badge>
                        )}
                      </div>
                    )}

                    {room.state === "guessing" && !isCurrentPlayer && (
                      <div className="text-center">
                        {player.guess !== null ? (
                          <Badge variant="secondary">Guess Submitted ✓</Badge>
                        ) : (
                          <Badge variant="outline">Waiting for guess...</Badge>
                        )}
                      </div>
                    )}

                    {room.state === "finished" && (
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">{player.guess !== null ? player.guess : "No Guess"}</div>
                        {player.difference !== null && (
                          <div className="text-sm text-gray-600">Difference: {player.difference}</div>
                        )}
                        {rank && <Badge variant="secondary">Rank #{rank}</Badge>}
                      </div>
                    )}

                    {room.state === "waiting" && <div className="text-center text-gray-500">Waiting to start...</div>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Share the room link with other players</p>
              <p>2. Players join by entering their names</p>
              <p>3. Host starts the guessing phase</p>
              <p>4. Each player submits their number guess</p>
              <p>5. Host reveals the correct answer</p>
              <p>6. The player with the closest guess wins! 🏆</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
