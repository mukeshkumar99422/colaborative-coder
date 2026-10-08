import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { YSocketIO } from 'y-socket.io/dist/server'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


//=====================================================================
// Express is the HTTP request-handling layer; 
// httpServer is the actual network server, 
// and Socket.IO needs the latter to handle WebSocket/HTTP-upgrade connections.
//=====================================================================
const app = express() // handle http requests
app.use(express.json())
app.use(express.static('public'))

const httpServer = createServer(app)
const io = new Server(httpServer, { // handle WebSocket connections
  cors: { origin: '*', methods: ['GET', 'POST'] },
})
const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

// ---------- Rooms (in memory) ----------
const rooms = new Map() // code -> { code, name, language, createdAt }

const ALLOWED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'csharp', 'go', 'rust', 'php', 'html', 'css', 'json', 'sql',
]

// 32 chars, no confusing ones (I, O, 0, 1), so 32 divides 256 evenly (no bias)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode() {
  let code
  do {
    code = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % 32]).join('')
  } while (rooms.has(code))
  return code
}


// ----------------- API Routes -----------------
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy', success: true })
})

// create a room
app.post('/api/rooms', (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 40)
  const language = String(req.body?.language || '')

  if (!name) return res.status(400).json({ error: 'Room name is required' })
  if (!ALLOWED_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: 'Unsupported language' })
  }

  const code = generateRoomCode()
  const room = { code, name, language, createdAt: Date.now() }
  rooms.set(code, room)
  res.status(201).json(room)
})

// get room info (also used to validate a code before joining)
app.get('/api/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase())
  if (!room) return res.status(404).json({ error: 'Room not found' })
  res.json(room)
})

// SPA fallback so refreshing /room/ABC123 serves the React app
// (must stay AFTER the api routes)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000')
})