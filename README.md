# 🛍️ AI-Powered Pakistani Suits E-Commerce Platform

A modern full-stack e-commerce platform built with **Laravel API** and **Next.js**, enhanced with **AI-powered Admin Assistant**, **Customer AI Help Assistant**, and **Business Intelligence** features.

This project is also my personal journey of learning **AI Engineering**, **AI Agents**, **Tool Calling**, **RAG (Retrieval-Augmented Generation)**, and preparing for future **MCP (Model Context Protocol)** integration.

---

# 🚀 Tech Stack

## Backend

- Laravel 11
- MySQL
- Sanctum Authentication
- REST API
- Service Repository Pattern

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS

## AI

- Groq API
- OpenAI Compatible Architecture
- AI Tool Calling
- Rule-based + AI Intent Detection
- Keyword RAG
- Customer AI Assistant
- Admin AI Agent

---

# ✨ Features

## Customer Store

- User Registration & Login
- Product Listing
- Product Search
- Categories
- Product Details
- Shopping Cart
- Checkout
- Orders
- Wishlist
- Customer Dashboard

---

## Admin Dashboard

- Dashboard Analytics
- Product Management
- Category Management
- Customer Management
- Order Management
- Inventory Management
- Sales Reports
- Business Intelligence Reports

---

# 🤖 AI Admin Assistant

The Admin AI Assistant allows administrators to interact with the business using natural language.

Example Questions

```
Show order 123

Find customer Noor

How many orders today?

Show today's sales

Show pending orders

Show repeated customers

Top spending customers

Best selling products this month

Products almost out of stock

Which city has most orders?

Average order value this month

Compare this week and last week sales

Products not selling this month
```

---

# 📊 Business Intelligence

Supports business analytics such as

- Sales Reports
- Order Reports
- Product Reports
- Customer Reports
- Revenue Reports
- Inventory Reports
- Payment Method Summary
- Order Status Summary
- City-wise Orders
- Average Order Value
- Sales Comparison
- Low Stock + High Sales
- Products Not Selling

---

# 🛒 Product Intelligence

The AI can answer

```
Find product Festive 3-Piece Lawn

Search Lawn Products

Show product 10

Best selling products

Product sales report

Low stock products
```

---

# 👥 Customer Intelligence

Supports

- Customer Search
- Customer Orders
- Customer Spending
- Repeat Customers
- Sales Count
- Top Spending Customers

---

# 🤖 Customer AI Help Assistant

A customer-facing AI assistant available at

```
/help/ai-assistant
```

Example Questions

```
How many days delivery?

Can I exchange my suit?

Can I return damaged item?

What size should I choose?

How do I wash lawn fabric?

How can I contact support?
```

---

# 📚 Customer Knowledge Base

The assistant retrieves answers from

- About Us
- Contact Us
- Shipping Policy
- Return Policy
- Exchange Policy
- Privacy Policy
- Terms & Conditions
- Size Guide
- Fabric Care
- FAQs

---

# 🧠 AI Architecture

## Admin Assistant

```
Admin
        │
        ▼
Next.js Admin Chat
        │
        ▼
Groq NLP Router
        │
        ▼
Intent Detection
        │
        ▼
Laravel API
        │
        ▼
Database
        │
        ▼
Groq Summary
        │
        ▼
Admin Response
```

---

## Customer Assistant

```
Customer
        │
        ▼
Next.js Chat
        │
        ▼
Keyword Retrieval
        │
        ▼
Knowledge Base
        │
        ▼
Groq
        │
        ▼
Customer Answer
```

---

# 🔍 AI Concepts Implemented

✔ Prompt Engineering

✔ Function Calling

✔ Tool Calling

✔ Intent Detection

✔ Entity Extraction

✔ Business Intelligence

✔ Product Intelligence

✔ Customer Intelligence

✔ Rule-based NLP

✔ AI Routing

✔ Keyword RAG

✔ Context Injection

✔ Source Attribution

✔ Read-only AI Tools

---

# 🔐 Security

- Server-side AI API Keys
- Sanctum Authentication
- Admin Protected APIs
- Read-only AI Tools
- No Sensitive Data Exposure

---

# ⚙ Environment Variables

```env
NEXT_PUBLIC_API_URL=

LARAVEL_API_URL=

LARAVEL_API_TOKEN=

USE_MOCK_AI=false

AI_PROVIDER=groq

GROQ_API_KEY=

GROQ_MODEL=llama-3.1-8b-instant

OPENAI_API_KEY=

OPENAI_MODEL=gpt-4o-mini
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone <repository-url>
```

---

## Install Frontend

```bash
npm install
```

---

## Install Backend

```bash
composer install
```

---

## Run Backend

```bash
php artisan serve
```

---

## Run Frontend

```bash
npm run dev
```

---

# 📁 Project Structure

```
Frontend (Next.js)

app/
components/
lib/
docs/

Backend (Laravel)

app/
routes/
database/
resources/
```

---

# 📖 Learning Journey

This repository is more than an e-commerce project.

It is my practical journey into AI Engineering.

During development I learned:

- AI Agents
- Tool Calling
- Prompt Engineering
- Intent Detection
- Entity Extraction
- Groq API Integration
- Laravel AI APIs
- Next.js AI Routes
- Business Intelligence
- Customer AI Assistant
- Keyword RAG (without Vector Database)

Future learning goals include:

- Vector RAG
- Embeddings
- MCP (Model Context Protocol)
- AI Workflows
- Autonomous AI Agents
- Multi-Agent Systems

---

# 🗺 Roadmap

## ✅ Completed

- Laravel REST APIs
- Next.js Store
- Admin Dashboard
- AI Admin Assistant
- Customer AI Assistant
- Business Intelligence
- Product Intelligence
- Customer Intelligence
- Keyword RAG

## 🚧 In Progress

- Testing & QA
- Documentation
- Deployment

## 🔮 Future

- Vector Database
- Semantic Search
- MCP Learning Project
- Multi-Agent AI
- AI Memory
- Voice AI
- WhatsApp AI Integration

---

# 👨‍💻 Author

**Muhammad Danish Ashraf**
  
Laravel Developer | Next.js Developer | AI Engineer 

Pakistan 🇵🇰

---

# ⭐ Acknowledgements

Special thanks to the open-source community and AI platforms that made this learning journey possible.

- Laravel
- Next.js
- React
- Groq
- OpenAI
- Tailwind CSS