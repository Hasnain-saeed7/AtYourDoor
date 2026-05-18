"use client"

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_REPLY_KEYS = [
  'howDoIBookAWorker',
  'howDoesPaymentWork',
  'whatIfIAmNotSatisfied',
  'howToBecomeAWorker',
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { t, language } = useLanguage()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('hiImTrusthiresAiAssistantICanHelpYouWithBookingsPa'),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  // Update initial assistant message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (!prev || prev.length === 0) return [{ role: 'assistant', content: t('hiImTrusthiresAiAssistantICanHelpYouWithBookingsPa'), timestamp: new Date() }]
      if (prev[0].role === 'assistant' && prev.length === 1) {
        return [{ ...prev[0], content: t('hiImTrusthiresAiAssistantICanHelpYouWithBookingsPa') }]
      }
      return prev
    })
  }, [language])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setIsTyping(true)

    try {
      const allMessages = [...messages, userMessage]

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()
      setIsTyping(false)

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again or email us at support@trusthire.pk 🙏",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[580px]'} flex flex-col`}>

          {/* Header */}
          <div className="bg-amber-600 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 rounded-full border-2 border-green-600" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">TrustHire Assistant</p>
                <p className="text-green-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 border-be-gray-900 rounded-full inline-block" />
                  Always online · Replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                      {message.role === 'assistant' && (
                        <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}

                      <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 1 && (
                <div className="px-4 py-2 bg-white border-t border-gray-50">
                      <p className="text-xs text-gray-400 mb-2 font-medium">{t('quickQuestions')}</p>
                  <div className="flex flex-wrap gap-2">
                          {QUICK_REPLY_KEYS.map((key) => (
                            <button
                              key={key}
                              onClick={() => sendMessage(t(key))}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-100 px-3 py-1.5 rounded-full transition-colors font-medium"
                            >
                              {t(key)}
                            </button>
                          ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all px-4 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('typeYourMessagePlaceholder')}
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                  >
                    {loading ? (
                      <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-300 mt-2">{t('poweredByTrustHireAI')}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-2xl shadow-2xl shadow-green-200 flex items-center justify-center transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>
    </>
  )
}