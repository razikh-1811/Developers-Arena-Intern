# Blog API (Node.js & Express)

A RESTful Blog API built using Node.js and Express.

## Features
- CRUD operations for blog posts
- JWT-based authentication
- Middleware for auth and error handling
- Environment configuration using dotenv

## Tech Stack
- Node.js
- Express.js
- JWT
- REST API

## How to Run
1. npm install
2. create .env file using .env.example
3. npm run dev

## API Endpoints
GET /api/posts  
POST /api/posts (auth required)  
PUT /api/posts/:id (auth required)  
DELETE /api/posts/:id (auth required)
