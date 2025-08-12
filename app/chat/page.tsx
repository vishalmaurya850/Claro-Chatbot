"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, LogOut } from 'lucide-react'
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-lg font-semibold">Claro Energy Assistant</h1>
              <p className="text-sm text-gray-500">Ask me anything about renewable energy</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {session?.user?.name}
            </span>
            {/* Show ADMIN panel button if user is ADMIN */}
            {session?.user?.role === "ADMIN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
              >
                Admin Panel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <Bot className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Claro Energy Assistant!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ask me questions about solar energy, renewable solutions, or sustainability practices.
                </p>
              </CardContent>
            </Card>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={message.role === 'user' ? 'bg-green-600 text-white' : ''}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sources:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-300">
                          {message.sources.map((source, index) => (
                            <li key={index}>• {source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about solar panels, renewable energy, sustainability..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
