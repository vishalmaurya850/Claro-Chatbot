"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { User, Bot } from "lucide-react"
import type { UIMessage } from "ai"

interface ChatMessageProps {
  message: UIMessage & { content: string }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2 max-w-[80%]`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</AvatarFallback>
        </Avatar>

        <Card className={`${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <CardContent className="p-3">
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
