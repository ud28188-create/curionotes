# CurioNotes: Your Intelligent Knowledge Hub

You are an expert Senior Product Designer, Senior Full Stack Engineer, AI Engineer, and UI/UX Designer. Design and build a modern, production-ready SaaS web application called CurioNotes and I want this exact design from the attached image same style. And also provided some more screenshots of the reference of the website look for it. This is not just a note-taking application—it is an AI-powered notebook that understands everything users upload. The overall design language should be inspired by the simplicity, whitespace, typography, and premium feel of Google NotebookLM, while remaining completely original. The interface should feel elegant, minimal, professional, fast, and trustworthy, using smooth animations, rounded corners, subtle gradients, beautiful cards, soft shadows, and plenty of breathing space. Use a clean white theme with optional dark mode, premium typography, responsive layouts, and polished micro-interactions throughout the application.

CurioNotes should allow users to create notebooks where they can upload PDFs, Word documents, PowerPoint presentations, Excel files, images, handwritten notes, text files, Markdown files, research papers, lecture notes, and other study materials. Every uploaded document should be processed by AI so it becomes searchable, understandable, and interactive. The platform should never feel like cloud storage. Instead, every notebook should become an intelligent knowledge base that users can chat with naturally.

The landing page should immediately communicate the product vision with a large hero section containing the headline "Understand Anything." The word Anything should use a beautiful green-to-blue gradient similar in feeling to NotebookLM. The subheading should say "Your AI notebook that transforms documents into knowledge. Upload your notes, ask questions, generate summaries, and learn faster with AI." Include two primary call-to-action buttons: Get Started Free and See Demo. Under the buttons display small trust indicators like Secure & Private, AI Powered, Works with PDFs, Images, Word, PPT, Excel, and more. The navigation bar should include Features, Pricing, Open Source, Documentation, GitHub, Login, and Get Started.

The homepage should continue with beautifully designed feature sections that explain how CurioNotes works. The first section should focus on document uploads with elegant illustrations showing PDFs, PowerPoint slides, handwritten notes, Excel sheets, and images being uploaded into a notebook. The next section should demonstrate AI understanding by showing an interactive AI conversation answering questions directly from uploaded notes. Another section should showcase automatic AI-generated summaries, study guides, flashcards, MCQs, revision notes, and concept maps. Include sections explaining citations, semantic search, OCR, handwritten note recognition, cross-document reasoning, privacy, and AI accuracy. Finish with testimonials, FAQ, pricing, open-source information, and a beautiful modern footer.

Authentication should be intentionally simple. Allow users to sign up using only Full Name, Email Address, and Password. Support secure login, password reset, email verification, Google Sign-In, GitHub Sign-In, and persistent authentication. The onboarding experience should welcome users with a clean dashboard and encourage them to create their first notebook immediately.

The dashboard should feel similar to modern productivity software like Notion and Linear. Display notebook cards instead of folders. Each notebook should have a cover image, notebook icon, title, description, tags, total documents, last modified date, AI conversations, and quick action buttons. Users should be able to create unlimited notebooks, pin notebooks, archive notebooks, duplicate notebooks, favorite notebooks, and organize notebooks using folders, colors, or tags. Include global search at the top that searches across every notebook instantly.

Inside a notebook, users should be able to upload unlimited files using drag-and-drop. Supported formats include PDF, DOCX, PPTX, XLSX, TXT, Markdown, PNG, JPG, JPEG, SVG, CSV, and ZIP files. Uploaded files should automatically be processed by AI using OCR, semantic chunking, metadata extraction, and embeddings. Display upload progress with smooth animations and status indicators while files are being analyzed.

Every notebook should include a powerful AI chat panel. Users can ask natural language questions about their uploaded documents. AI must answer only using the uploaded content and always provide citations showing which document and page the answer came from. If the answer cannot be found, the AI should politely respond that the information does not exist in the uploaded documents rather than hallucinating. Support follow-up questions, conversation history, suggested prompts, markdown responses, code blocks, tables, equations, LaTeX, syntax highlighting, copy buttons, citations, source previews, and document highlighting.

CurioNotes should automatically generate AI-powered study materials. Users should be able to generate concise summaries, detailed summaries, chapter summaries, bullet summaries, five-minute revision notes, exam preparation guides, flashcards, multiple-choice questions with answers, true-or-false quizzes, fill-in-the-blank questions, viva questions, interview questions, coding exercises, cheat sheets, and learning roadmaps. Users should be able to customize difficulty levels, number of questions, topics, and learning objectives before generating study material.

Implement AI-powered semantic search across every uploaded document. Users should be able to search using concepts instead of exact keywords. Search results should display document previews, highlighted matches, notebook names, page numbers, and direct navigation to the relevant section. Support searching across a single notebook or every notebook in the account.

Add OCR support so users can upload scanned handwritten notes, notebook pages, classroom whiteboards, diagrams, textbook images, screenshots, and photographs. Extract text accurately, preserve formatting where possible, and allow AI chat using the extracted information. Support multilingual OCR for future expansion.

Implement an AI Knowledge Graph that automatically discovers relationships between topics. Instead of showing isolated documents, visualize how concepts connect using an interactive graph. Selecting any concept should display related documents, AI summaries, flashcards, quizzes, explanations, and connected topics.

Include AI Study Mode. Users should be able to press a "Start Studying" button, after which AI creates a personalized study session using uploaded notes. The session should include concept explanations, summaries, flashcards, quizzes, revision checkpoints, and performance tracking. At the end of every study session display strengths, weaknesses, estimated exam readiness, and suggested revision topics.

Implement notebook analytics showing uploaded documents, AI chats, summaries generated, quizzes completed, study streaks, revision time, learning progress, and GitHub-style contribution heatmaps representing study activity.

Support notebook sharing with multiple permission levels including Private, Shared via Link, Team Workspace, Classroom, and Public. Public notebooks should have SEO-friendly pages that can be shared with anyone while protecting private notebooks.

Create a responsive experience optimized for desktop, tablet, and mobile devices. Use smooth page transitions, loading skeletons, empty states, hover animations, drag-and-drop interactions, keyboard shortcuts, contextual menus, and delightful micro-interactions throughout the interface.

The backend architecture should be production-ready using React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Query, React Hook Form, Zod, Supabase Authentication, PostgreSQL, Supabase Storage, Edge Functions, pgvector for semantic search, LangChain for retrieval pipelines, OpenAI API for AI responses, OCR processing, Retrieval-Augmented Generation (RAG), background document indexing, secure role-based authentication, row-level security, rate limiting, API validation, error handling, logging, monitoring, and scalable deployment. The application should be cleanly structured, modular, maintainable, accessible, SEO-friendly, and optimized for performance.

CurioNotes should feel like the combination of NotebookLM, Notion, Perplexity AI, ChatGPT, and Obsidian, but with its own unique identity focused on helping students, researchers, professionals, and lifelong learners transform their personal documents into an intelligent AI knowledge workspace.

Design the entire interface with the elegance of Apple, the simplicity of Google, the productivity of Notion, the smooth interactions of Linear, and the professionalism of Stripe. Use generous whitespace, modern typography, soft shadows, subtle gradients, rounded corners (16–20px), smooth Framer Motion animations, premium cards, beautiful empty states, skeleton loaders, glassmorphism only where appropriate, responsive layouts, and a minimal color palette centered around white, black, emerald green, and blue. Every page should feel polished enough to be featured on Awwwards and Product Hunt. The application should look like a real startup ready for millions of users, not a student project.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://curionotes.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/621ff008-7691-4bbc-b70c-526148896c19).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
