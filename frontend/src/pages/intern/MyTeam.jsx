import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Hash, Volume2, Plus, Search, Send, Paperclip, Smile, Phone, Video,
  Users, Pin, X, MoreHorizontal, Edit3, Trash2, Crown, ChevronDown,
  ChevronRight, MessageSquare, FolderOpen, Settings, Bell, Mic, MicOff,
  Download, Image as ImageIcon, FileText, Archive
} from 'lucide-react'
import api from '../../services/api'
import { getSocket } from '../../socket/socket'
import { motion, AnimatePresence } from 'framer-motion'
import { Empty, Skeleton } from '../../components/common/index'
import { COMPANY_NAME } from '../../utils/constants'
import toast from 'react-hot-toast'

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (d) => {
  const date = new Date(d)
  const now  = new Date()
  const diff = now - date
  if (diff < 60000)   return 'just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  return date.toLocaleDateString([],{month:'short',day:'numeric'})
}

const isImage = (mime) => mime?.startsWith('image/')
const isFile  = (name) => !isImage(name)

const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🔥','✅','🎉','💯','⚡']

// ── FileIcon ────────────────────────────────────────────────────────────────
const FileIcon = ({ mime }) => {
  if (mime?.startsWith('image/')) return <ImageIcon size={16} className="text-violet-500"/>
  if (mime?.includes('pdf'))      return <FileText   size={16} className="text-red-500"/>
  if (mime?.includes('zip'))      return <Archive    size={16} className="text-amber-500"/>
  return <FileText size={16} className="text-zinc-400"/>
}

// ── EmojiPicker ─────────────────────────────────────────────────────────────
const EmojiPicker = ({ onPick, onClose }) => (
  <div className="absolute bottom-8 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-3 z-50 flex flex-wrap gap-1.5 w-56">
    {EMOJI_LIST.map(e => (
      <button key={e} onClick={() => { onPick(e); onClose() }}
        className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700">
        {e}
      </button>
    ))}
  </div>
)

// ── MessageBubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMine, onReact, onReply, onEdit, onDelete, onPin, userId }) => {
  const [showActions, setShowActions] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editVal, setEditVal]   = useState(msg.content)
  const socket = getSocket()

  const handleEdit = () => {
    socket?.emit('edit_message', { messageId: msg._id, content: editVal, teamId: msg.team })
    setEditing(false)
  }
  const handleDelete = () => {
    if (confirm('Delete this message?')) {
      socket?.emit('delete_message', { messageId: msg._id, teamId: msg.team })
      onDelete(msg._id)
    }
  }
  const isDeleted = !!msg.deletedAt

  return (
    <div className={`group flex gap-3 px-4 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors ${isMine ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)} onMouseLeave={() => { setShowActions(false); setShowEmoji(false) }}>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-300 flex-shrink-0 overflow-hidden mt-0.5">
        {msg.sender?.avatar ? <img src={msg.sender.avatar} className="w-full h-full object-cover" alt=""/> : msg.sender?.name?.[0]}
      </div>

      <div className={`flex-1 min-w-0 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name + time */}
        <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{isMine ? 'You' : msg.sender?.name}</span>
          <span className="text-xs text-zinc-400">{fmt(msg.createdAt)}</span>
          {msg.isPinned && <Pin size={10} className="text-amber-500"/>}
          {msg.edited  && <span className="text-xs text-zinc-400 italic">(edited)</span>}
        </div>

        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`mb-1 border-l-2 border-violet-400 pl-2 text-xs text-zinc-400 max-w-xs ${isMine ? 'text-right border-l-0 border-r-2 pr-2 pl-0' : ''}`}>
            <span className="font-semibold text-zinc-500">{msg.replyTo?.sender?.name || 'Unknown'}: </span>
            {msg.replyTo?.content?.slice(0,80)}
          </div>
        )}

        {/* Bubble */}
        {isDeleted ? (
          <div className="text-xs text-zinc-400 italic px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">This message was deleted</div>
        ) : editing ? (
          <div className="flex gap-2 w-full max-w-md">
            <input value={editVal} onChange={e => setEditVal(e.target.value)}
              className="input flex-1 text-sm" onKeyDown={e => e.key==='Enter' && handleEdit()} autoFocus/>
            <button onClick={handleEdit} className="btn-primary text-xs px-3">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3">Cancel</button>
          </div>
        ) : (
          <div className={`max-w-sm lg:max-w-lg rounded-2xl px-4 py-2.5 text-sm leading-relaxed
            ${isMine
              ? 'bg-violet-600 text-white rounded-tr-none'
              : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm'}`}>
            {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
            {/* Attachments */}
            {msg.attachments?.length > 0 && (
              <div className="mt-2 space-y-2">
                {msg.attachments.map((att, i) => (
                  isImage(att.mimeType) ? (
                    <a key={i} href={att.url} target="_blank" rel="noreferrer">
                      <img src={att.url} alt={att.name} className="rounded-xl max-h-48 max-w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"/>
                    </a>
                  ) : (
                    <a key={i} href={att.url} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600'} transition-colors`}>
                      <FileIcon mime={att.mimeType}/>
                      <span className="flex-1 truncate font-medium">{att.name}</span>
                      <Download size={13} className="flex-shrink-0"/>
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reactions */}
        {msg.reactions?.filter(r => r.users?.length > 0).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.reactions.filter(r => r.users?.length > 0).map(r => (
              <button key={r.emoji} onClick={() => onReact(msg._id, r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
                  ${r.users?.includes(userId) ? 'bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-violet-50 dark:hover:bg-violet-950/30'}`}>
                {r.emoji} <span className="font-semibold">{r.users?.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons on hover */}
      {showActions && !isDeleted && !editing && (
        <div className={`flex items-center gap-0.5 self-start mt-1 ${isMine ? 'order-first' : 'order-last'}`}>
          <div className="relative">
            <button onClick={() => setShowEmoji(!showEmoji)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="React">
              <Smile size={14}/>
            </button>
            {showEmoji && <EmojiPicker onPick={e => onReact(msg._id, e)} onClose={() => setShowEmoji(false)}/>}
          </div>
          <button onClick={() => onReply(msg)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Reply"><MessageSquare size={14}/></button>
          <button onClick={() => onPin(msg._id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors" title="Pin"><Pin size={14}/></button>
          {isMine && (
            <>
              <button onClick={() => { setEditing(true); setShowActions(false) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors" title="Edit"><Edit3 size={14}/></button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" title="Delete"><Trash2 size={14}/></button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Teams Component ────────────────────────────────────────────────────
export default function MyTeam() {
  const { user, internData } = useSelector(s => s.auth)
  const [team, setTeam]           = useState(null)
  const [channels, setChannels]   = useState([])
  const [activeChannel, setActiveChannel] = useState('general')
  const [messages, setMessages]   = useState([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [input, setInput]         = useState('')
  const [replyTo, setReplyTo]     = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const [onlineMembers, setOnlineMembers] = useState([])
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [showPinned, setShowPinned]   = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [showFiles, setShowFiles]     = useState(false)
  const [files, setFiles]         = useState([])
  const [sharedFiles, setSharedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [newChannel, setNewChannel] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const bottomRef   = useRef(null)
  const typingTimer = useRef(null)
  const fileInputRef = useRef(null)
  const socket = getSocket()

  const teamId = internData?.team?._id || internData?.team

  // ── Load team ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!teamId) { setLoading(false); return }
    const load = async () => {
      try {
        const [tRes, chRes] = await Promise.all([
          api.get(`/teams/${teamId}`),
          api.get(`/teams/${teamId}/channels`),
        ])
        setTeam(tRes.data.data)
        setChannels(chRes.data.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [teamId])

  // ── Socket events ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !teamId) return
    socket.emit('join_team', teamId)
    socket.emit('get_online_members', teamId)

    socket.on('new_message',     (msg)  => {
      if (msg.channel === activeChannel) setMessages(prev => [...prev, msg])
    })
    socket.on('message_edited',  (msg)  => setMessages(prev => prev.map(m => m._id === msg._id ? msg : m)))
    socket.on('message_deleted', ({messageId}) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deletedAt: new Date(), content:'This message was deleted', attachments:[] } : m)))
    socket.on('reaction_updated', ({messageId, reactions}) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m)))
    socket.on('message_pinned',  ({messageId, isPinned}) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned } : m)))
    socket.on('user_typing',     ({userId: uid, name, channel}) => {
      if (channel === activeChannel && uid !== user._id)
        setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name])
    })
    socket.on('user_stop_typing', ({userId: uid, channel}) => {
      setTypingUsers(prev => prev.filter(n => n !== (uid === user._id ? user.name : uid)))
    })
    socket.on('online_members',  ({members}) => setOnlineMembers(members))
    socket.on('member_online',   ({userId}) => setOnlineMembers(prev => prev.includes(userId) ? prev : [...prev, userId]))
    socket.on('presence_update', ({userId, status}) => {
      setOnlineMembers(prev => status==='online' ? (prev.includes(userId)?prev:[...prev,userId]) : prev.filter(id=>id!==userId))
    })

    return () => {
      socket.off('new_message'); socket.off('message_edited'); socket.off('message_deleted')
      socket.off('reaction_updated'); socket.off('message_pinned')
      socket.off('user_typing'); socket.off('user_stop_typing')
      socket.off('online_members'); socket.off('member_online'); socket.off('presence_update')
    }
  }, [socket, teamId, activeChannel])

  // ── Load messages on channel switch ──────────────────────────────────────
  useEffect(() => {
    if (!teamId) return
    setMsgLoading(true)
    setMessages([])
    api.get(`/teams/${teamId}/messages?channel=${activeChannel}&limit=60`)
      .then(r => setMessages(r.data.data))
      .finally(() => setMsgLoading(false))
  }, [teamId, activeChannel])

  // ── Load pinned ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!teamId || !showPinned) return
    api.get(`/teams/${teamId}/messages/pinned?channel=${activeChannel}`)
      .then(r => setPinnedMessages(r.data.data))
  }, [showPinned, teamId, activeChannel])

  // ── Load shared files ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!teamId || !showFiles) return
    api.get(`/teams/${teamId}/files`).then(r => setSharedFiles(r.data.data))
  }, [showFiles, teamId])

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Typing handler ────────────────────────────────────────────────────────
  const handleTyping = (val) => {
    setInput(val)
    socket?.emit('typing_start', { teamId, name: user?.name, channel: activeChannel })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing_stop', { teamId, channel: activeChannel })
      setTypingUsers([])
    }, 1500)
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const content = input.trim()
    if (!content && files.length === 0) return
    socket?.emit('typing_stop', { teamId, channel: activeChannel })

    if (files.length > 0) {
      setUploading(true)
      try {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        fd.append('channel', activeChannel)
        fd.append('content', content)
        await api.post(`/teams/${teamId}/messages/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setFiles([])
      } catch { toast.error('Upload failed') } finally { setUploading(false) }
    } else {
      socket?.emit('team_message', {
        teamId, channel: activeChannel, content,
        replyTo: replyTo?._id || null, type: 'text',
      })
    }
    setInput(''); setReplyTo(null)
  }

  const handleReact = (msgId, emoji) => {
    socket?.emit('add_reaction', { messageId: msgId, emoji, teamId })
  }
  const handlePin = (msgId) => {
    socket?.emit('pin_message', { messageId: msgId, teamId })
  }
  const handleDeleteMsg = (msgId) => {
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, deletedAt: new Date(), content:'This message was deleted', attachments:[] } : m))
  }
  const startCall = () => {
    const url = `https://meet.google.com/new`
    window.open(url, '_blank')
    socket?.emit('start_call', { teamId, callerName: user?.name, meetUrl: url })
    toast.success('Meeting started! Link shared with team.')
  }
  const addChannel = async () => {
    if (!newChannel.trim()) return
    try {
      const r = await api.post(`/teams/${teamId}/channels`, { name: newChannel.toLowerCase().replace(/\s+/g,'-'), type: 'text' })
      setChannels(prev => [...prev, r.data.data])
      setNewChannel(''); setShowChannelModal(false)
      toast.success('Channel created')
    } catch {}
  }

  const filteredMessages = searchQuery
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  const CHANNEL_ICON = { text: <Hash size={14}/>, announcement: <Volume2 size={14}/> }

  if (loading) return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"/>
        <p className="text-zinc-400 text-sm">Loading team workspace…</p>
      </div>
    </div>
  )

  if (!teamId || !team) return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <Empty title="Not in a team yet" description="Ask your admin to add you to a team to start collaborating." icon={UsersRound}/>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-950">

      {/* ── LEFT: Team/Channel Sidebar ────────────────────────────────────── */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-60'} transition-all duration-300 flex-shrink-0 bg-zinc-900 flex flex-col overflow-hidden`}>

        {/* Team header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {team?.name?.[0]?.toUpperCase()}
              </div>
              <h2 className="font-bold text-white text-sm truncate">{team?.name}</h2>
            </div>
            <ChevronDown size={14} className="text-zinc-500 flex-shrink-0"/>
          </div>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto py-2 hide-scrollbar">
          <div className="px-3 mb-1">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Channels</span>
              <button onClick={() => setShowChannelModal(true)} className="text-zinc-500 hover:text-white transition-colors">
                <Plus size={13}/>
              </button>
            </div>
          </div>
          {channels.map(ch => (
            <button key={ch._id || ch.name} onClick={() => setActiveChannel(ch.name)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg mx-1 transition-colors
                ${activeChannel === ch.name ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
              <span className="flex-shrink-0">{CHANNEL_ICON[ch.type] || <Hash size={14}/>}</span>
              <span className="truncate font-medium">{ch.name}</span>
            </button>
          ))}

          {/* Members section */}
          <div className="px-3 mt-3 mb-1">
            <button onClick={() => setShowMembers(!showMembers)} className="flex items-center justify-between w-full py-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors">
              <span>Members</span>
              <ChevronRight size={12} className={`transition-transform ${showMembers ? 'rotate-90' : ''}`}/>
            </button>
          </div>
          {showMembers && team?.members?.map(m => {
            const isOnline = onlineMembers.includes(m.user?._id || m._id)
            const isLeader = team.leader?._id === m._id || team.leader?.user?._id === m.user?._id
            return (
              <div key={m._id} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 rounded-lg mx-1 transition-colors">
                <div className="relative flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-violet-600/40 flex items-center justify-center text-xs font-bold text-violet-300 overflow-hidden">
                    {m.user?.avatar ? <img src={m.user.avatar} className="w-full h-full object-cover" alt=""/> : m.user?.name?.[0]}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${isOnline ? 'bg-emerald-400' : 'bg-zinc-600'}`}/>
                </div>
                <span className="truncate flex-1 text-xs">{m.user?.name}</span>
                {isLeader && <Crown size={10} className="text-amber-400 flex-shrink-0"/>}
              </div>
            )
          })}
        </div>

        {/* Bottom: user status */}
        <div className="px-3 py-3 border-t border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-violet-600/40 flex items-center justify-center text-xs font-bold text-violet-300">
                {user?.name?.[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-emerald-400">● Online</p>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors"><Settings size={13}/></button>
          </div>
        </div>
      </div>

      {/* ── CENTER: Chat area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">

        {/* Channel header */}
        <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded">
              <ChevronRight size={16} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`}/>
            </button>
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              {CHANNEL_ICON[channels.find(c=>c.name===activeChannel)?.type] || <Hash size={16}/>}
              <span className="font-bold text-sm">{activeChannel}</span>
            </div>
            {typingUsers.length > 0 && (
              <span className="text-xs text-violet-500 italic animate-pulse">
                {typingUsers.join(', ')} {typingUsers.length===1?'is':'are'} typing…
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative mr-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"/>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="input pl-8 py-1.5 text-xs w-40 focus:w-56 transition-all duration-300"/>
            </div>
            <button onClick={() => { setShowPinned(!showPinned); setShowFiles(false) }}
              className={`p-2 rounded-lg transition-colors ${showPinned ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'}`} title="Pinned messages">
              <Pin size={16}/>
            </button>
            <button onClick={() => { setShowFiles(!showFiles); setShowPinned(false) }}
              className={`p-2 rounded-lg transition-colors ${showFiles ? 'bg-violet-100 dark:bg-violet-950/30 text-violet-600' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'}`} title="Shared files">
              <FolderOpen size={16}/>
            </button>
            <button onClick={startCall}
              className="p-2 rounded-lg text-zinc-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600 transition-colors" title="Start meeting">
              <Video size={16}/>
            </button>
            <button onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-violet-100 dark:bg-violet-950/30 text-violet-600' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'}`} title="Members">
              <Users size={16}/>
            </button>
          </div>
        </div>

        {/* Pinned panel */}
        <AnimatePresence>
          {showPinned && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              className="border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 overflow-hidden flex-shrink-0">
              <div className="px-4 py-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1"><Pin size={11}/>Pinned Messages</p>
                {pinnedMessages.length === 0
                  ? <p className="text-xs text-amber-500">No pinned messages in this channel</p>
                  : pinnedMessages.map(m => (
                    <div key={m._id} className="text-xs text-amber-800 dark:text-amber-300 mb-1 flex gap-2">
                      <span className="font-semibold flex-shrink-0">{m.sender?.name}:</span>
                      <span className="line-clamp-1">{m.content}</span>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files panel */}
        <AnimatePresence>
          {showFiles && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              className="border-b border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20 overflow-hidden flex-shrink-0">
              <div className="px-4 py-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-1"><FolderOpen size={11}/>Shared Files</p>
                {sharedFiles.length === 0
                  ? <p className="text-xs text-violet-500">No files shared yet</p>
                  : sharedFiles.map(m => m.attachments?.map((att, i) => (
                    <a key={`${m._id}-${i}`} href={att.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2.5 text-xs text-violet-800 dark:text-violet-300 mb-2 hover:underline">
                      <FileIcon mime={att.mimeType}/>
                      <span className="truncate flex-1">{att.name}</span>
                      <span className="text-violet-400 flex-shrink-0">{m.sender?.name}</span>
                      <Download size={11} className="flex-shrink-0"/>
                    </a>
                  )))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
          {msgLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin"/>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-4">
                  <Hash size={28} className="text-violet-400"/>
                </div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Welcome to #{activeChannel}</p>
                <p className="text-sm text-zinc-400 mt-1">This is the start of the #{activeChannel} channel. Say hello!</p>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, i) => {
              const isMine = msg.sender?._id === user?._id || msg.sender === user?._id
              const prev   = filteredMessages[i-1]
              const sameUser = prev?.sender?._id === msg.sender?._id && new Date(msg.createdAt) - new Date(prev?.createdAt) < 300000
              return (
                <div key={msg._id}>
                  {(!sameUser || i === 0) && i > 0 && <div className="h-2"/>}
                  <MessageBubble
                    msg={msg} isMine={isMine}
                    onReact={handleReact} onReply={setReplyTo}
                    onEdit={() => {}} onDelete={handleDeleteMsg} onPin={handlePin}
                    userId={user?._id}
                  />
                </div>
              )
            })
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Reply preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              className="flex items-center gap-3 px-4 py-2 bg-violet-50 dark:bg-violet-950/20 border-t border-violet-200 dark:border-violet-900 flex-shrink-0">
              <div className="flex-1 border-l-2 border-violet-500 pl-2">
                <p className="text-xs font-bold text-violet-600">Replying to {replyTo.sender?.name}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><X size={15}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File preview */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              className="flex gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex-wrap flex-shrink-0">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs">
                  <FileIcon mime={f.type}/>
                  <span className="max-w-24 truncate">{f.name}</span>
                  <button onClick={() => setFiles(files.filter((_,j) => j !== i))} className="text-zinc-400 hover:text-red-500"><X size={11}/></button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input box */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200 dark:focus-within:ring-violet-900 transition-all">
            <div className="flex items-center gap-1 mb-0.5">
              <button onClick={() => fileInputRef.current?.click()} className="text-zinc-400 hover:text-violet-600 transition-colors p-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/20" title="Attach file">
                <Paperclip size={17}/>
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files))}/>
            </div>
            <textarea value={input} onChange={e => handleTyping(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={`Message #${activeChannel}…`} rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 outline-none resize-none placeholder:text-zinc-400 leading-5 max-h-32 overflow-y-auto"
              style={{ minHeight: '22px' }}
            />
            <button onClick={sendMessage} disabled={(!input.trim() && files.length===0) || uploading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed">
              {uploading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <Send size={15}/>}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* ── RIGHT: Members panel (desktop) ───────────────────────────────── */}
      <AnimatePresence>
        {showMembers && (
          <motion.div initial={{width:0,opacity:0}} animate={{width:220,opacity:1}} exit={{width:0,opacity:0}}
            transition={{duration:.2}}
            className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Members</h3>
              <p className="text-xs text-emerald-500 mt-0.5">{onlineMembers.length} online</p>
            </div>
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 hide-scrollbar">
              {/* Online */}
              {team?.members?.filter(m => onlineMembers.includes(m.user?._id||m._id)).length > 0 && (
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 mb-2">Online</p>
              )}
              {team?.members?.filter(m => onlineMembers.includes(m.user?._id||m._id)).map(m => {
                const isLeader = team.leader?._id === m._id
                return (
                  <div key={m._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-300 overflow-hidden">
                        {m.user?.avatar ? <img src={m.user.avatar} className="w-full h-full object-cover" alt=""/> : m.user?.name?.[0]}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{m.user?.name}</p>
                      {isLeader && <p className="text-xs text-amber-500 flex items-center gap-0.5"><Crown size={9}/>Leader</p>}
                    </div>
                  </div>
                )
              })}
              {/* Offline */}
              {team?.members?.filter(m => !onlineMembers.includes(m.user?._id||m._id)).length > 0 && (
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 mt-3 mb-2">Offline</p>
              )}
              {team?.members?.filter(m => !onlineMembers.includes(m.user?._id||m._id)).map(m => (
                <div key={m._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors opacity-60">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 overflow-hidden">
                      {m.user?.avatar ? <img src={m.user.avatar} className="w-full h-full object-cover" alt=""/> : m.user?.name?.[0]}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-400 border-2 border-white dark:border-zinc-900"/>
                  </div>
                  <p className="text-xs text-zinc-500 truncate flex-1">{m.user?.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add channel modal */}
      <AnimatePresence>
        {showChannelModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowChannelModal(false)}>
            <motion.div initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.95,opacity:0}}
              onClick={e => e.stopPropagation()}
              className="card w-full max-w-sm p-6">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Add Channel</h3>
              <input value={newChannel} onChange={e => setNewChannel(e.target.value)}
                className="input mb-4" placeholder="channel-name"
                onKeyDown={e => e.key==='Enter' && addChannel()}/>
              <div className="flex gap-3">
                <button onClick={() => setShowChannelModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={addChannel} className="btn-primary flex-1">Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
