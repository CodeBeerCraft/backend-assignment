# DEEL Backend API

A robust Node.js/Express.js application for managing freelance contracts, jobs, and payments with role-based access control.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Error Handling](#error-handling)

## Features
- 🔐 Authentication & Role-Based Access Control (Client/Contractor/Admin)
- 👤 Profile Management
- 📄 Contract Creation and Management
- 💼 Job Tracking and Payment Processing
- 💰 Balance Management with Deposit Limits
- 📊 Admin Analytics
- 🛡️ Input Sanitization and SQL Injection Protection

## Technology Stack
- Node.js & Express.js
- SQLite with Sequelize ORM
- JWT Authentication
- Pug Template Engine
- Helmet for Security Headers
- Body Parser & Sanitize for Input Protection

## Getting Started

### Prerequisites
- Node.js (>=10.16.3)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
3. Create `.env` file with: ```PORT=3000, SECRET=your_jwt_secret```
4. Initialize database:
```bash
npm run seed
```
5. Start server:
```bash
npm start

## Database Schema

### Profile
- id (PK)
- firstName
- lastName
- profession
- balance
- type (client/contractor/admin)
- email (unique with type)
- password

### Contract
- id (PK)
- terms
- status (new/in_progress/terminated)
- ClientId (FK)
- ContractorId (FK)

### Job
- id (PK)
- description
- price
- paid (boolean)
- paymentDate
- ContractId (FK)

## API Documentation

### Authentication
All protected routes require Bearer token:
```bash
Authorization: Bearer <jwt_token>
```

### Profile Endpoints
- `POST /profiles/login` - Authenticate user
- `POST /profiles/register` - Create new profile
- `GET /profiles` - Get authenticated user profile

### Contract Endpoints
- `GET /contracts/:id` - Get contract by ID
- `GET /contracts` - List user's non-terminated contracts
- `POST /contracts` - Create new contract (Client only)
- `POST /contracts/:contractId` - Start job (Contractor only)

### Job Endpoints
- `GET /jobs/unpaid` - Get unpaid jobs
- `POST /jobs/:job_id/pay` - Process job payment (Client only)

### Balance Endpoints
- `POST /balance/deposit` - Deposit money (Client only, max 25% of unpaid jobs)

### Admin Endpoints
- `GET /admin/best-profession` - Get highest earning profession
- `GET /admin/best-clients` - Get top paying clients

## Security Features

1. **Input Sanitization**
   - Request parameter sanitization
   - SQL injection protection
   - Input validation middleware

2. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Token expiration

3. **Security Headers**
   - Helmet middleware
   - Referrer Policy
   - Hidden server information

## Error Handling

The application implements centralized error handling with:
- Custom error middleware
- Standardized error responses
- Transaction rollbacks for database operations
- Detailed error logging in development

### Standard Response Format
```bash
{
  "success": true,
  "error": false,
  "message": "Operation successful",
  "data": {}
}
```

## Project Structure
```bash
src/
├── controllers/    # Business logic
├── middleware/     # Auth & validation
├── models/        # Database models
├── routes/        # API routes
├── utils/         # Helper functions
├── views/         # Pug templates
├── app.js         # Express configuration
└── server.js      # Application entry
```

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
GNU General Public License v3.0