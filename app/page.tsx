"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, Target, Zap, ArrowRight, Shuffle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function HomePage() {
  const [roomId, setRoomId] = useState("")
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const router = useRouter()

  const createRoom = () => {
    const newRoomId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    toast.success("Creating new meeting room...")
    router.push(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (roomId.trim()) {
      toast.success("Joining meeting room...")
      router.push(`/room/${roomId.trim()}`)
    } else {
      toast.error("Please enter a valid meeting ID")
    }
  }

  const generateRandomRoomId = () => {
    const randomId = `meeting_${Math.random().toString(36).substr(2, 8)}`
    setRoomId(randomId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Toxic Coworker Phrase Counter
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Track those buzzwords in real-time during your meetings
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
                         Create a room, share it with your team, and bet on how many times someone will say &quot;synergy,&quot; &quot;circle back,&quot; or &quot;low hanging fruit&quot;
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create Room */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Create New Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Start a new meeting room and invite your colleagues to join the fun
              </p>
              <Button 
                onClick={createRoom} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Join Existing Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Enter a meeting ID to join an existing room
              </p>
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">Join Meeting Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter meeting ID (e.g., meeting_abc123)"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                      <Button
                        onClick={generateRandomRoomId}
                        variant="outline"
                        size="icon"
                        className="bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                        title="Generate random ID"
                      >
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={joinRoom} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!roomId.trim()}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">1. Pick a Phrase</h3>
                <p className="text-gray-400 text-sm">
                                     Choose a toxic workplace phrase like &quot;synergy,&quot; &quot;circle back,&quot; or &quot;low hanging fruit&quot;
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">2. Place Your Bets</h3>
                <p className="text-gray-400 text-sm">
                  Everyone guesses how many times the phrase will be said during the meeting
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">3. Track & Win</h3>
                <p className="text-gray-400 text-sm">
                  Count the phrases during the meeting and see who had the closest guess!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Phrases */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Popular Toxic Phrases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
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
                "Best Practice"
              ].map((phrase) => (
                <div 
                  key={phrase}
                  className="bg-gray-700 px-3 py-2 rounded-lg text-center text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  {phrase}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
