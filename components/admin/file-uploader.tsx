"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface FileUploaderProps {
  onUploadComplete: () => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setProgress(0)
      setError(null)
      setResult(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        setResult(data)
        onUploadComplete()
      } catch (error) {
        setError("Upload failed. Please try again.")
        console.error("Upload error:", error)
      } finally {
        setUploading(false)
      }
    },
    [onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop a file here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports PDF, TXT, and Markdown files</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading and processing...</p>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully uploaded and processed {result.document?.title}. Created {result.chunksProcessed} knowledge
            chunks.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
