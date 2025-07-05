# Toxic Coworker Phrase Counter

A delightfully toxic real-time multiplayer game for tracking how many times your coworkers say annoying phrases in meetings. Built with Next.js, Socket.IO, and TypeScript.

## Features

- 🏢 **Real-time meeting tracking** - Count phrases with colleagues in real-time
- 🔗 **WebSocket powered** - Instant updates using Socket.IO
- 🎮 **Meeting-based gameplay** - Create or join meeting rooms
- 👑 **Host controls** - Meeting hosts can manage participants and betting
- 🏆 **Closest bet wins** - Automatically finds who guessed closest to the actual count
- 📱 **Responsive design** - Works on desktop and mobile

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

The application will start on [http://localhost:4000](http://localhost:4000) with WebSocket support.

## How to Play

1. **Create a Meeting**: Click "Create New Meeting" to start tracking
2. **Share the Meeting**: Copy the meeting URL and share it with colleagues
3. **Join the Meeting**: Participants enter their names to join
4. **Place Your Bets**: When the host starts betting, everyone guesses how many times the target phrase will be said
5. **Reveal the Count**: The host reveals the actual count and the closest bet wins!

## Perfect For

- 🤝 **Team meetings** - Track "synergy", "circle back", "low hanging fruit"
- 📊 **All-hands meetings** - Count "exciting opportunity", "pivot", "game changer"
- 🎯 **Stand-ups** - Monitor "quick question", "just following up", "real quick"
- 🚨 **Sales calls** - Tally "paradigm shift", "win-win", "best practice"

## Technical Details

This project uses:

- **Next.js 15** - React framework with App Router
- **Socket.IO** - Real-time WebSocket communication
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Custom Server

The app uses a custom Express server (`server.js`) that integrates:
- Next.js request handling
- Socket.IO WebSocket server
- Real-time meeting room management
- Participant state synchronization

### WebSocket Events

The application handles these Socket.IO events:
- `joinRoom` - Join a meeting room
- `joinGame` - Add participant to meeting
- `startGuessing` - Begin betting phase
- `submitGuess` - Submit participant bet
- `revealAnswer` - Show actual count and closest bet
- `resetGame` - Start new meeting

## Development

To run in development mode:

```bash
npm run dev
```

To build for production:

```bash
npm run build
npm start
```

## Port Configuration

The application runs on port 4000 by default. To change the port:

```bash
PORT=5000 npm run dev
```

Or set the `NEXT_PUBLIC_SOCKET_URL` environment variable for custom WebSocket URLs.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
