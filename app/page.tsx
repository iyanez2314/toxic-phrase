"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trophy, Users, Target, Crown, Zap, RotateCcw, Plus, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Player {
  id: string
  name: string
  guess: number | null
  difference: number | null
  joinedAt: number
}

type GameState = "waiting" | "guessing" | "revealing" | "finished"

export default function NumberGuessingGame() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const [tempAnswer, setTempAnswer] = useState("")
  const [gameTitle, setGameTitle] = useState("Toxic Coworker Phrase Counter")
  const [tempTitle, setTempTitle] = useState("")
  const [winner, setWinner] = useState<Player | null>(null)
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  const createRoom = () => {
    const newRoomId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    router.push(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`)
    }
  }

  const generateRandomRoomId = () => {
    const randomId = `meeting_${Math.random().toString(36).substr(2, 8)}`
    setRoomId(randomId)
  }

  // Load data from localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem("guessingGamePlayers")
    const savedGameState = localStorage.getItem("guessingGameState")
    const savedAnswer = localStorage.getItem("guessingGameAnswer")
    const savedTitle = localStorage.getItem("guessingGameTitle")

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
    if (savedGameState) setGameState(savedGameState as GameState)
    if (savedAnswer) setCorrectAnswer(Number(savedAnswer))
    if (savedTitle) setGameTitle(savedTitle)
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("guessingGamePlayers", JSON.stringify(players))
  }, [players])

  useEffect(() => {
    localStorage.setItem("guessingGameState", gameState)
  }, [gameState])

  useEffect(() => {
    if (correctAnswer !== null) {
      localStorage.setItem("guessingGameAnswer", correctAnswer.toString())
    }
  }, [correctAnswer])

  useEffect(() => {
    localStorage.setItem("guessingGameTitle", gameTitle)
  }, [gameTitle])

  const joinGame = () => {
    if (newPlayerName.trim() && gameState === "waiting") {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        guess: null,
        difference: null,
        joinedAt: Date.now(),
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName("")
      setIsJoinDialogOpen(false)
    }
  }

  const removePlayer = (id: string) => {
    if (gameState === "waiting") {
      setPlayers(players.filter((p) => p.id !== id))
    }
  }

  const submitGuess = (playerId: string, guess: number) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, guess } : p)))
  }

  const startGuessing = () => {
    if (players.length > 0) {
      setGameState("guessing")
    }
  }

  const revealAnswer = () => {
    const answer = Number(tempAnswer)
    if (!isNaN(answer)) {
      setCorrectAnswer(answer)

      // Calculate differences and find winner
      const updatedPlayers = players.map((p) => ({
        ...p,
        difference: p.guess !== null ? Math.abs(p.guess - answer) : null,
      }))

      setPlayers(updatedPlayers)

      // Find winner (closest guess)
      const playersWithGuesses = updatedPlayers.filter((p) => p.guess !== null)
      if (playersWithGuesses.length > 0) {
        const winnerPlayer = playersWithGuesses.reduce((closest, current) =>
          current.difference !== null && (closest.difference === null || current.difference < closest.difference)
            ? current
            : closest,
        )
        setWinner(winnerPlayer)
      }

      setGameState("finished")
      setTempAnswer("")
    }
  }

  const resetGame = () => {
    if (confirm("Are you sure you want to start a new meeting? This will clear all participants and bets.")) {
      setPlayers([])
      setGameState("waiting")
      setCorrectAnswer(null)
      setWinner(null)
      setTempAnswer("")
    }
  }

  const updateTitle = () => {
    if (tempTitle.trim()) {
      setGameTitle(tempTitle.trim())
      setTempTitle("")
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.difference === null && b.difference === null) return 0
    if (a.difference === null) return 1
    if (b.difference === null) return -1
    return a.difference - b.difference
  })

  const getPlayerRank = (player: Player) => {
    if (gameState !== "finished" || player.difference === null) return null
    const rank = sortedPlayers.findIndex((p) => p.id === player.id) + 1
    return rank
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
    switch (gameState) {
      case "waiting":
        return "bg-blue-100 text-blue-800"
      case "guessing":
        return "bg-yellow-100 text-yellow-800"
      case "revealing":
        return "bg-orange-100 text-orange-800"
      case "finished":
        return "bg-green-100 text-green-800"
    }
  }

  const getStateText = () => {
    switch (gameState) {
      case "waiting":
        return "Waiting for Meeting Participants"
      case "guessing":
        return "Betting in Progress"
      case "revealing":
        return "Ready to Reveal Count"
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
              {gameTitle}
            </h1>
            {gameState === "waiting" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500">
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
                      onKeyDown={(e) => e.key === "Enter" && updateTitle()}
                    />
                    <Button onClick={updateTitle} className="w-full">
                      Update Title
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Badge className={cn("text-lg px-4 py-2 mb-4", getStateColor())}>
            <Target className="w-4 h-4 mr-2" />
            {getStateText()}
          </Badge>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Participants: {players.length}
            </Badge>
            {gameState === "guessing" && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bets: {players.filter((p) => p.guess !== null).length}/{players.length}
              </Badge>
            )}
            {winner && (
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="w-4 h-4 mr-2" />
                Closest Bet: {winner.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {gameState === "waiting" && (
            <>
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
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
                      onKeyDown={(e) => e.key === "Enter" && joinGame()}
                    />
                    <Button onClick={joinGame} className="w-full">
                      Join Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={startGuessing}
                disabled={players.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Betting
              </Button>
            </>
          )}

          {gameState === "guessing" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
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
                    onKeyDown={(e) => e.key === "Enter" && revealAnswer()}
                  />
                  <Button onClick={revealAnswer} className="w-full">
                    Reveal Closest Bet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            onClick={resetGame}
            variant="destructive"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Correct Answer Display */}
        {correctAnswer !== null && (
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-800 mb-2">Actual Count</div>
              <div className="text-4xl font-bold text-green-900">{correctAnswer}</div>
            </CardContent>
          </Card>
        )}

        {/* Players Grid */}
        {players.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent>
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2">No Meeting Participants Yet!</h3>
              <p className="text-gray-600 mb-4">Be the first to join this delightfully toxic meeting tracker!</p>
              <Button
                onClick={() => setIsJoinDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(gameState === "finished" ? sortedPlayers : players).map((player) => {
              const rank = getPlayerRank(player)
              const isWinner = winner?.id === player.id

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
                  )}
                >
                  {isWinner && <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {rank && <span className="text-xl">{getRankEmoji(rank)}</span>}
                        {player.name}
                        {isWinner && <Crown className="w-5 h-5 text-yellow-600" />}
                      </CardTitle>
                      {gameState === "waiting" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {gameState === "guessing" && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Enter your guess"
                          value={player.guess || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === "" || !isNaN(Number(value))) {
                              submitGuess(player.id, value === "" ? 0 : Number(value))
                            }
                          }}
                        />
                        {player.guess !== null && (
                          <Badge variant="secondary" className="w-full justify-center">
                            Guess Submitted: {player.guess}
                          </Badge>
                        )}
                      </div>
                    )}

                    {gameState === "finished" && (
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">{player.guess !== null ? player.guess : "No Guess"}</div>
                        {player.difference !== null && (
                          <div className="text-sm text-gray-600">Difference: {player.difference}</div>
                        )}
                        {rank && <Badge variant="secondary">Rank #{rank}</Badge>}
                      </div>
                    )}

                    {(gameState === "waiting" || (gameState === "guessing" && player.guess === null)) && (
                      <div className="text-center text-gray-500">
                        {gameState === "waiting" ? "Waiting to start..." : "Enter your guess above"}
                      </div>
                    )}
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
              <p>1. Players join the game by entering their names</p>
              <p>2. Host starts the guessing phase</p>
              <p>3. Each player submits their number guess</p>
              <p>4. Host reveals the correct answer</p>
              <p>5. The player with the closest guess wins! 🏆</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Controls */}
      <div className="max-w-md w-full mt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Room Controls
          </h1>
          <p className="text-lg text-gray-600">Create or join a multiplayer guessing challenge!</p>
        </div>

        <div className="space-y-6">
          {/* Create New Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Start a new game room and invite others to join</p>
              <Button
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Create Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Join Existing Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Existing Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Enter a room ID to join an existing game</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                />
                <Button variant="outline" onClick={generateRandomRoomId} className="shrink-0 bg-transparent">
                  🎲
                </Button>
              </div>
              <Button
                onClick={joinRoom}
                disabled={!roomId.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Join Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
