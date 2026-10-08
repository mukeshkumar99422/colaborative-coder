/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Editor } from '@monaco-editor/react'
import { MonacoBinding } from 'y-monaco'
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'
import { ArrowLeft, Copy, Check, Link2, Users, Hash } from 'lucide-react'
import {colorFor, selectionFor, defineTheme, iconBtn} from '../utils/utils';


export default function Room() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [nameInput, setNameInput] = useState('')
  const [editor, setEditor] = useState(null)
  const [provider, setProvider] = useState(null)
  const [users, setUsers] = useState([])
  const [copied, setCopied] = useState(null) // 'code' | 'link' | null

  const ydoc = useMemo(() => new Y.Doc(), [code])

  // 1. validate room + load its metadata
  useEffect(() => {
    setStatus('loading')
    fetch(`/api/rooms/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data) => {
        setRoom(data)
        setStatus('ready')
      })
      .catch(() => setStatus('notfound'))
  }, [code])

  // 2. connect to the room
  useEffect(() => {
    if (status !== 'ready' || !username) return

    const p = new SocketIOProvider('/', code, ydoc, { autoConnect: true })
    p.awareness.setLocalStateField('user', { username })

    const updateUsers = () => {
      const list = []
      p.awareness.getStates().forEach((state, clientId) => {
        if (state.user) list.push({ clientId, username: state.user.username })
      })
      setUsers(list)
    }
    p.awareness.on('change', updateUsers)
    updateUsers()
    setProvider(p)

    return () => {
      p.awareness.off('change', updateUsers)
      p.disconnect()
      setProvider(null)
    }
  }, [status, username, code, ydoc])

  // 3. bind Monaco <-> Yjs (awareness enables remote cursors)
  useEffect(() => {
    if (!editor || !provider) return
    const binding = new MonacoBinding(
      ydoc.getText('monaco'),
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )
    return () => binding.destroy()
  }, [editor, provider, ydoc])

  const copy = async (text, which) => {
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  // ---------- states ----------
  const screen = 'h-screen bg-[#0E2130] flex flex-col gap-4 items-center justify-center p-4'

  if (status === 'loading') {
    return <main className={screen + ' text-[#8FA9BC]'}>Loading room…</main>
  }

  if (status === 'notfound') {
    return (
      <main className={screen + ' text-white'}>
        <p className="text-lg">
          Room <span className="font-mono text-[#CEFF52]">{code}</span> doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-[#CEFF52] hover:bg-[#dcff7d] text-[#152E40] font-semibold px-4 py-2 transition"
        >
          Back to home
        </button>
      </main>
    )
  }

  if (!username) {
    return (
      <main className={screen}>
        <form
          className="bg-[#152E40] border border-[#2A4A63] rounded-2xl p-6 w-full max-w-sm space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const name = nameInput.trim()
            if (!name) return
            localStorage.setItem('username', name)
            setUsername(name)
          }}
        >
          <h2 className="text-white text-lg font-semibold">
            Join <span className="text-[#CEFF52]">{room.name}</span>
          </h2>
          <input
            autoFocus
            className="w-full rounded-lg bg-[#0E2130] border border-[#2A4A63] px-3 py-2.5 text-white placeholder-[#5F7C91] focus:outline-none focus:border-[#CEFF52] focus:ring-1 focus:ring-[#CEFF52]"
            placeholder="Display name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={24}
          />
          <button className="w-full rounded-lg bg-[#CEFF52] hover:bg-[#dcff7d] text-[#152E40] font-semibold py-2.5 transition">
            Join
          </button>
        </form>
      </main>
    )
  }

  // ---------- main UI ----------
  return (
    <main className="h-screen w-full bg-[#0E2130] flex flex-col">
      {/* unique cursor + selection color per user */}
      <style>
        {users
          .map(
            (u) => `
.yRemoteSelection-${u.clientId} { background-color: ${selectionFor(u.clientId)}; }
.yRemoteSelectionHead-${u.clientId} { border-color: ${colorFor(u.clientId)}; }`
          )
          .join('\n')}
      </style>

      {/* top bar */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 bg-[#152E40] border-b border-[#2A4A63]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-[#8FA9BC] hover:text-white hover:bg-[#0E2130] transition"
            title="Leave room"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-semibold truncate">{room.name}</h1>
          <span className="text-xs font-medium rounded-md border border-[#CEFF52]/40 text-[#CEFF52] px-2 py-0.5">
            {room.language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 font-mono tracking-widest text-white bg-[#0E2130] border border-[#2A4A63] rounded-lg px-3 py-1.5 text-sm">
            <Hash size={14} className="text-[#8FA9BC]" />
            {code}
          </span>
          <button
            onClick={() => copy(code, 'code')}
            className={iconBtn + ' bg-[#0E2130] border border-[#2A4A63] text-white hover:border-[#CEFF52]'}
          >
            {copied === 'code' ? <Check size={15} className="text-[#CEFF52]" /> : <Copy size={15} />}
            {copied === 'code' ? 'Copied' : 'Copy code'}
          </button>
          <button
            onClick={() => copy(window.location.href, 'link')}
            className={iconBtn + ' bg-[#CEFF52] hover:bg-[#dcff7d] text-[#152E40] font-semibold'}
          >
            {copied === 'link' ? <Check size={15} /> : <Link2 size={15} />}
            {copied === 'link' ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* participants */}
        <aside className="w-64 shrink-0 bg-[#152E40] border border-[#2A4A63] rounded-xl overflow-y-auto">
          <h2 className="flex items-center gap-2 text-white font-semibold px-4 py-3 border-b border-[#2A4A63]">
            <Users size={16} className="text-[#CEFF52]" />
            Participants
            <span className="ml-auto text-xs text-[#8FA9BC]">{users.length}</span>
          </h2>
          <ul className="p-3 space-y-2">
            {users.map((u) => (
              <li
                key={u.clientId}
                className="flex items-center gap-3 rounded-lg bg-[#0E2130] px-3 py-2 text-white"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0E2130]"
                  style={{ backgroundColor: colorFor(u.clientId) }}
                >
                  {u.username[0]?.toUpperCase()}
                </span>
                <span className="truncate text-sm">{u.username}</span>
                {u.clientId === ydoc.clientID && (
                  <span className="ml-auto text-xs text-[#8FA9BC]">You</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* editor */}
        <section className="flex-1 min-w-0 rounded-xl overflow-hidden border border-[#2A4A63] bg-[#0F2537]">
          <Editor
            height="100%"
            language={room.language}
            theme="codetogether"
            beforeMount={defineTheme}
            onMount={(ed) => setEditor(ed)}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              padding: { top: 12 },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
            }}
          />
        </section>
      </div>
    </main>
  )
}