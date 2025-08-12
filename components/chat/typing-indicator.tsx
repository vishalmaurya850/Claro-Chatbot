"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-2 max-w-[80%]">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <Card className="bg-muted">
          <CardContent className="p-3">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
