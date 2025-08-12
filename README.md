# Claro Energy KB Chatbot

A comprehensive Next.js application for an intelligent knowledge base chatbot with multilingual support, vector search, and admin management capabilities.

## Features

- 🤖 **AI-Powered Chat**: Intelligent responses using RAG (Retrieval-Augmented Generation)
- 🌍 **Multilingual Support**: English and Hindi language detection and responses
- 🔐 **Role-Based Authentication**: User and admin roles with different access levels
- 📚 **Knowledge Base Management**: Upload and manage documents with version control
- 🔍 **Vector Search**: Semantic search using Pinecone vector database
- 📱 **Responsive Design**: Modern UI with dark/light theme support
- ⚡ **Real-time Chat**: Streaming responses with typing indicators
- 📊 **Admin Dashboard**: Analytics and content management tools

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Supabase
- **Database**: Supabase (PostgreSQL)
- **Vector DB**: Pinecone
- **OpenRouter**: OpenAI GPT-4 with OpenRouter SDK
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Pinecone account and index
- OpenAI API key

### Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd claro-energy-chatbot
   ```

2. **Install dependencies**
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
   or
   ```
   pnpm install
   ```

4. **Set up environment variables**
   ```
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_SUPABASE_URL`: From your Supabase project
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your Supabase project
   - `OPENAI_API_KEY`: From OpenAI dashboard
   - `PINECONE_API_KEY`: From Pinecone console
   - `NEXTAUTH_URL`=http://localhost:3000
   - `SUPABASE_SERVICE_ROLE_KEY`= SERVICE ROLE KEY FROM THE SUPABASE
   - `DATABASE_URL`=SUPABASE DATABASE URL in PRISMA ORM
   - `DIRECT_URL`=SUPABASE DIRECT URL in PRISMA ORM
   - `PINECONE_API_KEY`=PINECONE API KEY FOR VECTOR DB
   - `MISTRAL_API_KEY`=MISTRAL API KEY FOR THE EMBEDDINGS
   - `OPENROUTER_API_KEY`=OPENROUTER API KEY FOR OPENAI

5. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```
   npx prisma generate
   npx prisma migrate dev --name
   ```

6. **Create Pinecone index**
   
   Create a new index in Pinecone with:
   - Name: `claro-kb`
   - Dimensions: `1024` (for OpenAI embeddings)
   - Metric: `cosine`

7. **Run the development server**
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
   or
   ```
   pnpm dev
   ```

9. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Sign up/Login**: Create an account or sign in
2. **Start Chatting**: Ask questions about solar energy, policies, or technical details
3. **Multilingual**: Chat in English or Hindi - language is auto-detected
4. **Context Aware**: The bot remembers your conversation history

### For Admins

1. **Access Admin Panel**: Login with admin role to access `/admin`
2. **Upload Documents**: Add PDF, TXT, or Markdown files to the knowledge base
3. **Manage Content**: View and organize uploaded documents
4. **Monitor Usage**: Track chatbot performance and usage analytics

## Project Structure

```
claro-energy-chatbot/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── chat/              # User chat interface
│   └── login/             # Authentication
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── supabase.ts        # Supabase client
│   ├── vector-db.ts       # Pinecone integration
│   ├── rag.ts             # RAG implementation
│   └── chat-service.ts    # Chat utilities
├── scripts/               # Database and setup scripts
└── types/                 # TypeScript type definitions
```

## Key Features Explained

### RAG (Retrieval-Augmented Generation)

The chatbot uses RAG to provide accurate, contextual responses:

1. **Query Processing**: User questions are embedded using OpenAI
2. **Vector Search**: Similar content is found in Pinecone
3. **Context Augmentation**: Retrieved content enhances the AI prompt
4. **Response Generation**: GPT-4 generates informed responses

### Multilingual Support

- **Auto-Detection**: Language is detected from user input
- **Contextual Responses**: AI responds in the detected language
- **Filtered Search**: Vector search filters by language

### Admin Features

- **Document Upload**: Support for PDF, TXT, and Markdown files
- **Content Processing**: Automatic chunking and embedding
- **Version Control**: Track document changes and updates
- **Analytics Dashboard**: Monitor usage and performance

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**: Commit your code to a GitHub repository
2. **Connect to Vercel**: Import your project in Vercel dashboard
3. **Set Environment Variables**: Add all required env vars in Vercel
4. **Deploy**: Vercel will automatically build and deploy

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] More language support
- [ ] Voice chat capabilities
- [ ] Mobile app
- [ ] Integration with more AI models
- [ ] Advanced document processing
