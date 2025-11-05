'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface Message {
  id: string
  user_id: string
  username: string
  avatar: string
  message: string
  created_at: string
}

interface Avatar {
  id: string
  name: string
  emoji: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const avatars: Avatar[] = [
    { id: '1', name: '고양이', emoji: '🐱' },
    { id: '2', name: '강아지', emoji: '🐶' },
    { id: '3', name: '토끼', emoji: '🐰' },
    { id: '4', name: '곰', emoji: '🐻' },
    { id: '5', name: '여우', emoji: '🦊' },
    { id: '6', name: '판다', emoji: '🐼' },
    { id: '7', name: '코알라', emoji: '🐨' },
    { id: '8', name: '사자', emoji: '🦁' },
    { id: '9', name: '호랑이', emoji: '🐅' }
  ]

  const emojis = ['😀', '😂', '😍', '🤔', '😎', '😭', '😡', '🎉', '❤️', '👍', '👋', '🙏', '💪', '🎈', '🌟', '🔥']

  useEffect(() => {
    // Load saved username and avatar
    const savedUsername = localStorage.getItem('chatUsername')
    const savedAvatarId = localStorage.getItem('chatAvatarId')
    
    if (savedUsername && savedAvatarId) {
      setUsername(savedUsername)
      const avatar = avatars.find(a => a.id === savedAvatarId)
      if (avatar) {
        setSelectedAvatar(avatar)
        setShowWelcome(false)
        loadMessages()
      }
    }
  }, [])

  useEffect(() => {
    if (!showWelcome) {
      const subscription = supabase
        .channel('chat')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages' 
        }, (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          scrollToBottom()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [showWelcome])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) {
      setMessages(data)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleJoin = () => {
    if (username.trim() && selectedAvatar) {
      localStorage.setItem('chatUsername', username)
      localStorage.setItem('chatAvatarId', selectedAvatar.id)
      setShowWelcome(false)
      loadMessages()
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const messageData = {
      user_id: user?.id || 'anonymous',
      username: username,
      avatar: selectedAvatar?.emoji || '👤',
      message: message.trim()
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert(messageData)

    if (!error) {
      setMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-card-bg rounded-2xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-center mb-2">익명 채팅방</h2>
          <p className="text-text-secondary text-center mb-6 text-sm">
            닉네임과 아바타를 선택하세요
          </p>

          <input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-border-color rounded-lg 
                     focus:outline-none focus:border-primary mb-6"
            maxLength={20}
          />

          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3">아바타 선택</p>
            <div className="grid grid-cols-3 gap-3">
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`p-4 bg-dark-bg border-2 rounded-lg transition-all
                    ${selectedAvatar?.id === avatar.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border-color hover:border-gray-600'}`}
                >
                  <div className="text-3xl mb-1">{avatar.emoji}</div>
                  <div className="text-xs text-text-secondary">{avatar.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!username.trim() || !selectedAvatar}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium
                     hover:bg-primary/90 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            채팅 참여하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card-bg border-b border-border-color px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">익명 채팅방</h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span>{selectedAvatar?.emoji} {username}</span>
            <button
              onClick={() => {
                localStorage.removeItem('chatUsername')
                localStorage.removeItem('chatAvatarId')
                setShowWelcome(true)
                setMessages([])
              }}
              className="text-xs hover:text-text-primary transition-colors"
            >
              나가기
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-text-secondary mt-8">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요! 👋
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[70%] ${msg.username === username ? 'flex-row-reverse' : ''}`}>
                <div className="text-2xl flex-shrink-0">{msg.avatar}</div>
                <div>
                  <div className={`text-xs text-text-secondary mb-1 ${msg.username === username ? 'text-right' : ''}`}>
                    {msg.username} · {formatTime(msg.created_at)}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.username === username 
                      ? 'bg-primary text-white' 
                      : 'bg-card-bg border border-border-color'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <div className="px-4 py-1 text-sm text-text-secondary min-h-[24px]">
        {typingUsers.length > 0 && (
          <span>
            {typingUsers.join(', ')}님이 입력 중
            <span className="inline-flex gap-1 ml-2">
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-pulse"></span>
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-pulse delay-100"></span>
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-pulse delay-200"></span>
            </span>
          </span>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-card-bg border border-border-color 
                      rounded-lg p-3 grid grid-cols-8 gap-2 shadow-lg">
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-xl p-2 hover:bg-hover-bg rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-card-bg border-t border-border-color p-4">
        <div className="flex gap-3 items-end">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-2xl text-text-secondary hover:text-text-primary transition-colors pb-2"
          >
            😊
          </button>
          <div className="flex-1 bg-dark-bg rounded-3xl px-4 py-2 border border-border-color 
                        focus-within:border-primary transition-colors">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-transparent resize-none outline-none max-h-24"
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center
                     hover:bg-primary/90 transition-all disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}