"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, LogOut, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface Document {
  id: string
  title: string
  content: string
  sections: string[]
  language: string[]
  updatedAt: string
}

export function AdminDashboard() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [replaceExisting, setReplaceExisting] = useState(false)

  // Section update states
  const [selectedDocument, setSelectedDocument] = useState<string>("")
  const [sectionTitle, setSectionTitle] = useState("")
  const [sectionContent, setSectionContent] = useState("")
  const [isUpdatingSection, setIsUpdatingSection] = useState(false)

  // Add state for available sections
  const [availableSections, setAvailableSections] = useState<string[]>([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("replaceExisting", replaceExisting.toString())

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus({
          type: "success",
          message: `Successfully processed ${result.filename}: ${result.chunksCreated} chunks created across ${result.sections} sections`,
        })
        setSelectedFile(null)
        fetchDocuments()
      } else {
        const error = await response.json()
        setUploadStatus({
          type: "error",
          message: error.error || "Upload failed",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Upload failed due to network error",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSectionUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocument || !sectionTitle || !sectionContent) return

    setIsUpdatingSection(true)
    setUploadStatus(null)

    try {
      const response = await fetch("/api/admin/update-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: selectedDocument,
          sectionTitle,
          content: sectionContent,
        }),
      })

      if (response.ok) {
        setUploadStatus({
          type: "success",
          message: `Successfully updated section "${sectionTitle}" in ${selectedDocument}`,
        })
        setSectionTitle("")
        setSectionContent("")
        fetchDocuments()
      } else {
        const error = await response.json()
        setUploadStatus({
          type: "error",
          message: error.error || "Section update failed",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Section update failed due to network error",
      })
    } finally {
      setIsUpdatingSection(false)
    }
  }

  // Update available sections when document is selected
  useEffect(() => {
    if (selectedDocument) {
      const selectedDoc = documents.find((doc) => doc.title === selectedDocument)
      if (selectedDoc && selectedDoc.sections) {
        // Get sections from the selected document
        setAvailableSections(Array.isArray(selectedDoc.sections) ? selectedDoc.sections : [])
        setSectionTitle("") // Reset section title when document changes
      } else {
        setAvailableSections([])
      }
    } else {
      setAvailableSections([])
    }
  }, [selectedDocument, documents])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage knowledge base content</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {uploadStatus && (
          <Alert
            className={`mb-6 ${uploadStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={uploadStatus.type === "success" ? "text-green-800" : "text-red-800"}>
              {uploadStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="update">Update Sections</TabsTrigger>
            <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>Upload PDF, TXT, or Markdown files to add to the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="replace"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                    />
                    <Label htmlFor="replace">Replace existing document if it exists</Label>
                  </div>
                  <Button type="submit" disabled={!selectedFile || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="update">
            <Card>
              <CardHeader>
                <CardTitle>Update Document Section</CardTitle>
                <CardDescription>
                  Update specific sections of existing documents without replacing the entire document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSectionUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="document">Select Document</Label>
                    <select
                      id="document"
                      value={selectedDocument}
                      onChange={(e) => setSelectedDocument(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Choose a document...</option>
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.title}>
                          {doc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sectionTitle">Section Title</Label>
                    <select
                      id="sectionTitle"
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={!selectedDocument}
                      required
                    >
                      <option value="">Choose a section...</option>
                      {availableSections.map((section, index) => (
                        <option
                          key={index}
                          value={
                            typeof section === "object" && section !== null
                              ? ((section as { title?: string; sectionTitle?: string }).title ||
                                (section as { title?: string; sectionTitle?: string }).sectionTitle ||
                                "")
                              : String(section)
                          }
                        >
                          {typeof section === "object" && section !== null
                            ? ((section as { title?: string; sectionTitle?: string }).title ||
                              (section as { title?: string; sectionTitle?: string }).sectionTitle ||
                              "")
                            : String(section)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sectionContent">Section Content</Label>
                    <Textarea
                      id="sectionContent"
                      value={sectionContent}
                      onChange={(e) => setSectionContent(e.target.value)}
                      placeholder="Enter the updated content for this section..."
                      rows={8}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!selectedDocument || !sectionTitle || !sectionContent || isUpdatingSection}
                  >
                    {isUpdatingSection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Section
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>View and manage all documents in the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold">{doc.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{doc.sections.length} sections</span>
                                <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(doc.language)
                                  ? doc.language.map((lang) => (
                                      <Badge key={lang} variant="secondary">
                                        {lang === "en" ? "English" : "Hindi"}
                                      </Badge>
                                    ))
                                  : doc.language && (
                                      <Badge variant="secondary">
                                        {doc.language === "en" ? "English" : "Hindi"}
                                      </Badge>
                                    )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View sections ({doc.sections?.length || 0})
                              </summary>
                              <div className="mt-2 pl-4 space-y-1">
                                {(doc.sections ?? []).map((section, index) => (
                                  <div key={index} className="text-gray-600">
                                    • {typeof section === 'object' && section !== null
                                        ? (section as { title?: string; sectionTitle?: string }).title || 
                                          (section as { title?: string; sectionTitle?: string }).sectionTitle || 
                                          JSON.stringify(section)
                                        : String(section)}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard
