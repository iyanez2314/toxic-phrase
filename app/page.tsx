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
  const gameTitle = "Toxic Coworker Phrase Counter"
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

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
    if (savedGameState) setGameState(savedGameState as GameState)
    if (savedAnswer) setCorrectAnswer(Number(savedAnswer))
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
        return "bg-blue-900 text-blue-200"
      case "guessing":
        return "bg-yellow-900 text-yellow-200"
      case "revealing":
        return "bg-orange-900 text-orange-200"
      case "finished":
        return "bg-green-900 text-green-200"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {gameTitle}
            </h1>
          </div>

          <Badge className={cn("text-lg px-4 py-2 mb-4", getStateColor())}>
            <Target className="w-4 h-4 mr-2" />
            {getStateText()}
          </Badge>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-gray-200">
              <Users className="w-4 h-4 mr-2" />
              Participants: {players.length}
            </Badge>
            {gameState === "guessing" && (
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-gray-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bets: {players.filter((p) => p.guess !== null).length}/{players.length}
              </Badge>
            )}
            {winner && (
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
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
                  <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">Join the Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter your name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && joinGame()}
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                    <Button onClick={joinGame} className="w-full bg-purple-600 hover:bg-purple-700">
                      Join Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={startGuessing}
                disabled={players.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Betting
              </Button>
            </>
          )}

          {gameState === "guessing" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Trophy className="w-4 h-4 mr-2" />
                  Reveal Actual Count
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Enter the Actual Count</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="How many times did they actually say it?"
                    value={tempAnswer}
                    onChange={(e) => setTempAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && revealAnswer()}
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  />
                  <Button onClick={revealAnswer} className="w-full bg-orange-600 hover:bg-orange-700">
                    Reveal Closest Bet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            onClick={resetGame}
            variant="destructive"
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Correct Answer Display */}
        {correctAnswer !== null && (
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-green-800 to-blue-800 border-green-600">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-200 mb-2">Actual Count</div>
              <div className="text-4xl font-bold text-green-100">{correctAnswer}</div>
            </CardContent>
          </Card>
        )}

        {/* Players Grid */}
        {players.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8 bg-gray-800 border-gray-700">
            <CardContent>
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">No Meeting Participants Yet!</h3>
              <p className="text-gray-400 mb-4">Be the first to join this delightfully toxic meeting tracker!</p>
              <Button
                onClick={() => setIsJoinDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                    "relative overflow-hidden transition-all duration-300 hover:scale-105 bg-gray-800 border-gray-700",
                    isWinner && "ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-900 to-orange-900",
                    !isWinner && rank === 1 && "bg-gradient-to-br from-yellow-800 to-yellow-900",
                    !isWinner && rank === 2 && "bg-gradient-to-br from-gray-700 to-gray-800",
                    !isWinner && rank === 3 && "bg-gradient-to-br from-orange-800 to-orange-900",
                    !isWinner && (rank === null || rank > 3) && "bg-gradient-to-br from-blue-800 to-purple-800",
                  )}
                >
                  {isWinner && <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-100">
                        {rank && <span className="text-xl">{getRankEmoji(rank)}</span>}
                        {player.name}
                        {isWinner && <Crown className="w-5 h-5 text-yellow-400" />}
                      </CardTitle>
                      {gameState === "waiting" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-red-400 hover:text-red-300"
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
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        />
                        {player.guess !== null && (
                          <Badge variant="secondary" className="w-full justify-center bg-gray-700 text-gray-200">
                            Guess Submitted: {player.guess}
                          </Badge>
                        )}
                      </div>
                    )}

                    {gameState === "finished" && (
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-gray-100">{player.guess !== null ? player.guess : "No Guess"}</div>
                        {player.difference !== null && (
                          <div className="text-sm text-gray-400">Difference: {player.difference}</div>
                        )}
                        {rank && <Badge variant="secondary" className="bg-gray-700 text-gray-200">Rank #{rank}</Badge>}
                      </div>
                    )}

                    {(gameState === "waiting" || (gameState === "guessing" && player.guess === null)) && (
                      <div className="text-center text-gray-400">
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
        <Card className="mt-8 bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 text-gray-100">How to Play:</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>1. Share the meeting link with other participants</p>
              <p>2. Participants join by entering their names</p>
              <p>3. Host starts the betting phase</p>
              <p>4. Each participant submits their phrase count bet</p>
              <p>5. Host reveals the actual count</p>
              <p>6. The participant with the closest bet wins! 🏆</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Controls */}
      <div className="w-full mt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Meeting Controls
          </h1>
          <p className="text-lg text-gray-400">Create or join a toxic phrase tracking session!</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Room */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <Plus className="w-5 h-5" />
                  Create New Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">Start a new meeting room and invite others to join</p>
                <Button
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                >
                  Create Meeting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Join Existing Room */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <Users className="w-5 h-5" />
                  Join Existing Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">Enter a meeting ID to join an existing session</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter meeting ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  />
                  <Button variant="outline" onClick={generateRandomRoomId} className="shrink-0 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                    🎲
                  </Button>
                </div>
                <Button
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Join Meeting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
