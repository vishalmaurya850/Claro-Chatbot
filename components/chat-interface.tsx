"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, LogOut, Bot, User, Loader2 } from "lucide-react"
import { MessageSources } from "@/components/message-sources"
import { SourceDisplay } from "@/components/source-display"
import ChatSources from "@/components/chat-sources"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: Array<{
    score: number
    title: string
    content: string
  }>
  sourcesDisplay?: string[]
}

export function ChatInterface() {
  const { data: session } = useSession()
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
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        sources: data.sources
          ? data.sources.map((src: any) => ({
              score: src.score,
              title: src.title || "Untitled Source",
              content: src.content || "No content available",
            }))
          : undefined,
        sourcesDisplay: data.sourcesDisplay || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold">Claro Energy Assistant</h1>
              <p className="text-sm text-gray-500">Ask me anything about solar energy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p>Ask me about solar pumps, energy solutions, or any Claro Energy products.</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">Solar pump eligibility</Badge>
                    <Badge variant="secondary">Installation process</Badge>
                    <Badge variant="secondary">Maintenance tips</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex space-x-3 max-w-3xl ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={message.role === "user" ? "bg-blue-600 text-white" : ""}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.sourcesDisplay && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500">Sources:</p>
                        <ul className="text-xs">
                          {message.sourcesDisplay.map((source, i) => (
                            <li key={i}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {message.sources && <ChatSources sources={message.sources} />}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Thinking...</span>
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
              placeholder="Ask about solar pumps, eligibility, installation..."
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