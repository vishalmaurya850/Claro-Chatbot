import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Shield, Zap, Globe } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-green-500">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Claro Energy</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent Knowledge Base
            <span className="text-blue-600"> Chatbot</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant answers to your energy-related questions with our AI-powered chatbot. 
            Access comprehensive knowledge base with multilingual support.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent conversations with context-aware responses and source citations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Multilingual</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for multiple languages with automatic detection and response.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based access control with secure authentication and data protection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Fast & Accurate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lightning-fast responses with high accuracy using advanced RAG technology.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users who trust our AI-powered knowledge base for their energy solutions.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
