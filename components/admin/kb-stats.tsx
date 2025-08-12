"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, Globe } from "lucide-react"

interface KBStatsProps {
  kbStatus: any
  isLoading: boolean
}

export function KBStats({ kbStatus, isLoading }: KBStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!kbStatus?.documents?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4" />
        <p>No documents in the knowledge base yet.</p>
        <p className="text-sm">Upload some content to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {kbStatus.documents.map((doc: any) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{doc.title}</CardTitle>
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  {doc.language.toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.updated_at !== doc.created_at && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
