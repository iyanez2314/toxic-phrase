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
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRealTimeRoom } from "../../../hooks/useRealTimeRoom"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface Player {
  id: string
  name: string
  guess: number | null
  difference: number | null
  joinedAt: number
}

export default function GameRoom() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [tempAnswer, setTempAnswer] = useState("")
  const [tempTitle, setTempTitle] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [customPhrase, setCustomPhrase] = useState("")
  const [isPhraseDialogOpen, setIsPhraseDialogOpen] = useState(false)

  const {
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
    updatePhrase,
  } = useRealTimeRoom(roomId)

  // Check if current player has already joined
  useEffect(() => {
    if (room && room.players.find((p) => p.id === playerId)) {
      setHasJoined(true)
    }
  }, [room, playerId])

  // Handle room closure - redirect all users to home page
  useEffect(() => {
    if (roomClosed) {
      toast.info("The meeting has been closed by the host.")
      router.push("/")
    }
  }, [roomClosed, router])

  const handleJoinGame = async () => {
    if (newPlayerName.trim()) {
      setIsLoading(true)
      const success = await joinGame(newPlayerName.trim())
      if (success) {
        setNewPlayerName("")
        setIsJoinDialogOpen(false)
        setHasJoined(true)
        toast.success("Successfully joined the meeting!")
      } else {
        toast.error("Failed to join the meeting. Please try again.")
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
        toast.success("Results revealed! Check out the winners!")
      } else {
        toast.error("Failed to reveal results. Please try again.")
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
    const success = await startGuessing()
    if (success) {
      toast.success("Betting phase started! Place your bets!")
    } else {
      toast.error("Failed to start betting phase. Please try again.")
    }
    setIsLoading(false)
  }

  const handleResetGame = async () => {
    setIsLoading(true)
    const success = await resetGame()
    if (success) {
      setHasJoined(false)
      toast.success("New meeting started successfully!")
    }
    setIsLoading(false)
    setIsResetDialogOpen(false)
  }

  const copyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    })
  }

  const handleUpdatePhrase = async (phrase: string) => {
    setIsLoading(true)
    const success = await updatePhrase(phrase)
    if (success) {
      setCustomPhrase("")
      setIsPhraseDialogOpen(false)
      toast.success("Phrase updated successfully!")
    } else {
      toast.error("Failed to update phrase. Please try again.")
    }
    setIsLoading(false)
  }

  const handleCustomPhrase = async () => {
    if (customPhrase.trim()) {
      await handleUpdatePhrase(customPhrase.trim())
    }
  }

  const predefinedPhrases = [
    "Synergy",
    "Circle Back", 
    "Low Hanging Fruit",
    "Think Outside the Box",
    "Touch Base",
    "Move the Needle",
    "Deep Dive",
    "Bandwidth",
    "Leverage",
    "Pivot",
    "Game Changer",
    "Best Practice",
    "Win-Win",
    "Scalable",
    "Disruptive",
    "Ideate"
  ]

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">Loading Meeting Room...</h2>
            <p className="text-gray-400 mb-4">Meeting ID: {roomId}</p>
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
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
        return "bg-blue-900 text-blue-200"
      case "guessing":
        return "bg-yellow-900 text-yellow-200"
      case "finished":
        return "bg-green-900 text-green-200"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {room.title}
            </h1>
            {isHost && room.state === "waiting" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300" disabled={isLoading}>
                    ✏️
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">Edit Meeting Title</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter new meeting title"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                    <Button onClick={handleUpdateTitle} className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
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
            <Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-3 py-1 bg-gray-700 text-gray-200">
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? "Connected" : "Reconnecting..."}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-700 border-gray-600 text-gray-200">
              Room: {roomId}
            </Badge>
            {isHost && (
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-700 text-purple-200">
                👑 Host
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomLink}
              className={cn("text-xs px-2 py-1 h-auto transition-colors", showCopySuccess ? "text-green-400" : "text-gray-400 hover:text-gray-300")}
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
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-gray-200">
              <Users className="w-4 h-4 mr-2" />
              Participants: {room.players.length}
            </Badge>
            {room.state === "guessing" && (
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-gray-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bets: {room.players.filter((p) => p.guess !== null).length}/{room.players.length}
              </Badge>
            )}
            {room.winner && (
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Closest Bet: {room.winner.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Current Phrase Display */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center justify-center gap-2">
                <Target className="w-6 h-6 text-purple-400" />
                Target Phrase
              </h2>
              {room.phrase ? (
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                    &quot;{room.phrase}&quot;
                  </div>
                  <p className="text-gray-400">
                    Count how many times this phrase is said during the meeting!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-2xl text-gray-400 mb-2">
                    No phrase selected yet
                  </div>
                  <p className="text-gray-500">
                    {isHost ? "Choose a phrase below to start tracking" : "Waiting for host to select a phrase"}
                  </p>
                </div>
              )}
              
              {isHost && room.state === "waiting" && (
                <div className="mt-6">
                  <Dialog open={isPhraseDialogOpen} onOpenChange={setIsPhraseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {room.phrase ? "Change Phrase" : "Select Phrase"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-gray-100">Choose Target Phrase</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Predefined Phrases */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-3">Popular Toxic Phrases</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {predefinedPhrases.map((phrase) => (
                              <Button
                                key={phrase}
                                variant="outline"
                                onClick={() => handleUpdatePhrase(phrase)}
                                disabled={isLoading}
                                className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 text-sm"
                              >
                                {phrase}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Custom Phrase */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-3">Custom Phrase</h3>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter your own phrase..."
                              value={customPhrase}
                              onChange={(e) => setCustomPhrase(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleCustomPhrase()}
                              disabled={isLoading}
                              className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                            />
                            <Button
                              onClick={handleCustomPhrase}
                              disabled={!customPhrase.trim() || isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Set"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {room.state === "waiting" && (
            <>
              {!hasJoined && (
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
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
                        onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                        disabled={isLoading}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                      <Button onClick={handleJoinGame} className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  disabled={isLoading}
                >
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
                    onKeyDown={(e) => e.key === "Enter" && handleRevealAnswer()}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  />
                  <Button onClick={handleRevealAnswer} className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Reveal Closest Bet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {room.state === "finished" && isHost && (
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Close Room
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Close Meeting Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Are you sure you want to close this meeting? All participants will be disconnected and the room will be permanently deleted.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsCloseDialogOpen(false)}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setIsLoading(true)
                        await closeRoom()
                        setIsLoading(false)
                        setIsCloseDialogOpen(false)
                      }}
                      className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700"
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                      Close Room
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {isHost && (
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Start New Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Are you sure you want to start a new meeting? This will clear all participants and bets.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsResetDialogOpen(false)}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResetGame}
                      variant="destructive"
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Start New Meeting
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Correct Answer Display */}
        {room.correctAnswer !== null && (
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-green-800 to-blue-800 border-green-600">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-200 mb-2">Actual Count</div>
              <div className="text-4xl font-bold text-green-100">{room.correctAnswer}</div>
            </CardContent>
          </Card>
        )}

        {/* Players Grid */}
        {room.players.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8 bg-gray-800 border-gray-700">
            <CardContent>
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">No Meeting Participants Yet!</h3>
              <p className="text-gray-400 mb-4">Share the meeting link with others to start tracking those phrases!</p>
              <div className="text-sm text-gray-500 mb-4">
                Meeting ID: <code className="bg-gray-700 px-2 py-1 rounded text-gray-300">{roomId}</code>
              </div>
              {!hasJoined && (
                <Button
                  onClick={() => setIsJoinDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                    "relative overflow-hidden transition-all duration-300 hover:scale-105 bg-gray-800 border-gray-700",
                    isWinner && "ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-900 to-orange-900",
                    !isWinner && rank === 1 && "bg-gradient-to-br from-yellow-800 to-yellow-900",
                    !isWinner && rank === 2 && "bg-gradient-to-br from-gray-700 to-gray-800",
                    !isWinner && rank === 3 && "bg-gradient-to-br from-orange-800 to-orange-900",
                    !isWinner && (rank === null || rank > 3) && "bg-gradient-to-br from-blue-800 to-purple-800",
                    isCurrentPlayer && "ring-2 ring-blue-400",
                  )}
                >
                  {isWinner && <div className="absolute top-2 right-2 text-2xl animate-bounce">👑</div>}
                  {isCurrentPlayer && (
                    <div className="absolute top-2 left-2 text-sm bg-blue-600 text-white px-2 py-1 rounded">You</div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-100">
                        {rank && <span className="text-xl">{getRankEmoji(rank)}</span>}
                        {player.name}
                        {isWinner && <Crown className="w-5 h-5 text-yellow-400" />}
                      </CardTitle>
                      {isHost && room.state === "waiting" && !isCurrentPlayer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-red-400 hover:text-red-300"
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
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        />
                        {player.guess !== null && (
                          <Badge variant="secondary" className="w-full justify-center bg-gray-700 text-gray-200">
                            Guess Submitted: {player.guess}
                          </Badge>
                        )}
                      </div>
                    )}

                    {room.state === "guessing" && !isCurrentPlayer && (
                      <div className="text-center">
                        {player.guess !== null ? (
                          <Badge variant="secondary" className="bg-gray-700 text-gray-200">Guess Submitted ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">Waiting for guess...</Badge>
                        )}
                      </div>
                    )}

                    {room.state === "finished" && (
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-gray-100">{player.guess !== null ? player.guess : "No Guess"}</div>
                        {player.difference !== null && (
                          <div className="text-sm text-gray-400">Difference: {player.difference}</div>
                        )}
                        {rank && <Badge variant="secondary" className="bg-gray-700 text-gray-200">Rank #{rank}</Badge>}
                      </div>
                    )}

                    {room.state === "waiting" && <div className="text-center text-gray-400">Waiting to start...</div>}
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
    </div>
  )
}
