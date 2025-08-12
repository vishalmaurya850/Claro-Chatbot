"use client"

import { useRef, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, LogOut, Zap, User, Bot } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"

interface ChatInterfaceProps {
  initialHistory: any[]
}

export function ChatInterface({ initialHistory }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage } = useChat()
  const isLoading = false // Adjust isLoading logic if needed
  const [isTyping, setIsTyping] = useState<boolean>(false) // Track typing status

  const [input, setInput] = useState<string>("")

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsTyping(true) // Set typing to true when sending a message
    await sendMessage({ text: input })
    setIsTyping(false) // Reset typing status after sending
    await sendMessage({ text: input })
    setInput("")
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="font-semibold">Claro Energy</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <Badge variant="secondary" className="text-xs">
                {/* Role property may not exist on user; fallback to 'User' */}
                {"role" in (session?.user ?? {}) ? (session?.user as any).role : "USER"}
              </Badge>
            </div>
          </div>

          <Separator className="mb-4" />

          <div>
            <h3 className="text-sm font-medium mb-2">Recent Topics</h3>
            <div className="space-y-1">
              {initialHistory.slice(0, 5).map((chat, index) => (
                <div key={index} className="text-xs text-muted-foreground p-2 rounded hover:bg-muted/50">
                  {chat.message.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-green-600" />
              <span>Claro Energy Assistant</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-medium mb-2">Welcome to Claro Energy KB</h3>
                      <p>Ask me anything about solar energy, renewable solutions, or sustainable practices!</p>
                    </div>
                  )}
  
                  {messages.map((message: any) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
  
                  {isTyping && <TypingIndicator />}
                </div>
                  <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask about solar energy, policies, or technical details..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
              </ScrollArea>
          </CardContent>
        </Card>
        </div>
      </div>
  )
}