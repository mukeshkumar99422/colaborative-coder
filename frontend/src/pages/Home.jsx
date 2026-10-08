import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, LogIn, Plus, ArrowLeft } from 'lucide-react'
import {LANGUAGES, inputCls, primaryBtn, labelCls} from '../utils/utils'

export default function Home() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null | 'join' | 'create'
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [code, setCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const saveUsername = () => localStorage.setItem('username', username.trim())

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const roomCode = code.trim().toUpperCase()
      const res = await fetch(`/api/rooms/${roomCode}`)
      if (!res.ok) throw new Error('No room found with that code')
      saveUsername()
      navigate(`/room/${roomCode}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create room')
      saveUsername()
      navigate(`/room/${data.code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setMode(null)
    setError('')
  }

  return (
    <main className="min-h-screen bg-[#0E2130] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,rgba(206,255,82,0.08),transparent_60%)]">
      <div className="w-full max-w-md">
        {/* brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#CEFF52] text-[#152E40] flex items-center justify-center">
            <Terminal size={26} strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-bold text-white mt-4 tracking-tight">
            Code<span className="text-[#CEFF52]">Together</span>
          </h1>
          <p className="text-[#8FA9BC] mt-1 text-sm">Real-time collaborative code editor</p>
        </div>

        <div className="bg-[#152E40] border border-[#2A4A63] rounded-2xl p-6 space-y-5 shadow-2xl shadow-black/30">
          <div>
            <label className={labelCls}>Display name</label>
            <input
              className={inputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={24}
            />
          </div>

          {!mode && (
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!username.trim()}
                onClick={() => setMode('join')}
                className="group rounded-xl border border-[#2A4A63] bg-[#0E2130] hover:border-[#CEFF52] p-4 text-left transition disabled:opacity-40 disabled:hover:border-[#2A4A63]"
              >
                <LogIn size={22} className="text-[#CEFF52]" />
                <div className="text-white font-semibold mt-3">Join room</div>
                <div className="text-xs text-[#8FA9BC] mt-0.5">Enter a room code</div>
              </button>
              <button
                disabled={!username.trim()}
                onClick={() => setMode('create')}
                className="group rounded-xl border border-[#2A4A63] bg-[#0E2130] hover:border-[#CEFF52] p-4 text-left transition disabled:opacity-40 disabled:hover:border-[#2A4A63]"
              >
                <Plus size={22} className="text-[#CEFF52]" />
                <div className="text-white font-semibold mt-3">Create room</div>
                <div className="text-xs text-[#8FA9BC] mt-0.5">Start a new session</div>
              </button>
            </div>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className={labelCls}>Room code</label>
                <input
                  className={inputCls + ' uppercase tracking-[0.3em] font-mono text-center text-lg'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button className={primaryBtn} disabled={loading || !username.trim()}>
                {loading ? 'Joining…' : 'Join room'}
              </button>
            </form>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Room name</label>
                <input
                  className={inputCls}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. DSA practice"
                  maxLength={40}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Language</label>
                <select
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <button className={primaryBtn} disabled={loading || !username.trim()}>
                {loading ? 'Creating…' : 'Create room'}
              </button>
            </form>
          )}

          {mode && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 mx-auto text-sm text-[#8FA9BC] hover:text-white transition"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}