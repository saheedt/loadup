# LoadUp Job Application API

A NestJS backend service for creating job postings with customizable questions, accepting candidate applications, and automatically scoring them based on answer quality.

## Features

- **Job Management**: Create and retrieve job postings with custom questions
- **Application Submission**: Accept candidate applications with automatic scoring
- **Flexible Question Types**: Support for single-choice, multi-choice, number, and text questions answer types
- **Automatic Scoring**: Scoring algorithms for each question type
- **Pagination & Sorting**: Optimized list endpoints with flexible sorting options
- **Input Sanitization**: XSS and injection attack prevention on all text inputs
- **Unified Response Format**: Consistent API responses across all endpoints
- **N+1 Query Prevention**: Optimized database queries with eager loading
- **Testing**: Tests with sufficient coverage of business logic

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: SQLite with Prisma ORM
- **Validation**: class-validator & class-transformer
- **Sanitization**: isomorphic-dompurify
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

### 1. Clone the repository:
```bash
git clone git@github.com:saheedt/loadup.git
cd loadup
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up environment variables:
```bash
cp .env.sample .env
```

The `.env` file contains:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `NODE_ENV`: Application environment (default: `development`)
- `PORT`: Server port (default: `3000`)

### 4. Set up SQLite database:

The project uses SQLite with Prisma ORM. Follow these steps to initialize your database:

#### a. Generate Prisma Client
```bash
npx prisma generate
```
This creates the Prisma client based on your schema.

#### b. Run database migrations
```bash
npx prisma migrate deploy
```
This creates the SQLite database file at `prisma/dev.db` and applies all schema migrations.

**What happens:**
- Creates `prisma/dev.db` file (your SQLite database)
- Creates all tables: `Job`, `Question`, `Application`
- Sets up indexes for optimized queries
- Database is now ready to use!

**Verification:** After running migrations, you should see:
- File created: `prisma/dev.db`

#### c. (Optional) View your database
```bash
npx prisma studio
```
This opens a web UI at `http://localhost:5555` where you can browse and edit your database tables.

### Database Reset (if needed):
If you need to reset your database:
```bash
# Delete the database file
rm prisma/dev.db

# Re-run migrations
npx prisma migrate deploy
```

### Troubleshooting Database Setup:

**Problem: "Can't reach database server"**
- Ensure the `prisma/` directory exists
- Check `DATABASE_URL` in `.env` points to a valid path **(NOTE: path is relative to the prisma folder)**
- Verify you have write permissions in the project directory

**Problem: "Migration failed"**
- Delete `prisma/dev.db` and try again
- Ensure Prisma client is generated: `npx prisma generate`

**Problem: "Table doesn't exist"**
- Run migrations: `npx prisma migrate deploy`
- If still failing, reset database (see above)

## Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm run start:prod
```

## Running Tests

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:3000/api/v1/docs
```

## Question Types Guide

LoadUp supports 4 different question types, each with its own scoring mechanism. Below are detailed examples of how to create each type.

### 1. Text Question

Text questions allow candidates to provide free-form text answers. Scoring is based on keyword matching.

**Example:**
```json
{
  "text": "Describe your experience with TypeScript and backend development",
  "type": "text",
  "scoring": {
    "points": 10,
    "keywords": ["typescript", "nodejs", "backend", "api", "express", "nest"]
  }
}
```

**How Candidates Answer:**
```json
{
  "questionId": "uuid",
  "value": "I have 5 years of TypeScript experience building backend APIs with NestJS"
}
```

---

### 2. Number Question

Number questions expect numeric answers within a specified range.

**Example:**
```json
{
  "text": "How many years of backend development experience do you have?",
  "type": "number",
  "scoring": {
    "points": 15,
    "min": 3,
    "max": 10
  }
}
```

**How Candidates Answer:**
```json
{
  "questionId": "uuid",
  "value": 5
}
```

---

### 3. Single Choice Question

Single choice questions present multiple options where only ONE correct answer exists.

**Example:**
```json
{
  "text": "Which database is best suited for relational data with ACID compliance?",
  "type": "single_choice",
  "options": ["MongoDB", "PostgreSQL", "Redis", "Cassandra"],
  "scoring": {
    "points": 10,
    "correctOption": "PostgreSQL"
  }
}
```

**How Candidates Answer:**
```json
{
  "questionId": "uuid",
  "value": "PostgreSQL"
}
```

---

### 4. Multi Choice Question

Multi choice questions allow multiple correct answers with proportional scoring.

**Example:**
```json
{
  "text": "Which of the following are strongly-typed programming languages?",
  "type": "multi_choice",
  "options": ["TypeScript", "JavaScript", "Java", "Python", "Go"],
  "scoring": {
    "points": 20,
    "correctOptions": ["TypeScript", "Java", "Go"]
  }
}
```

**How Candidates Answer:**
```json
{
  "questionId": "uuid",
  "value": ["TypeScript", "Java", "Go"]
}
```
---

## Scoring Algorithms

### 1. Single Choice Question
- **Full points** if answer matches the correct option
- **Zero points** otherwise

```typescript
{
  "type": "single_choice",
  "options": ["Option A", "Option B", "Option C"],
  "scoring": {
    "correctOption": "Option B",
    "points": 10
  }
}
```

### 2. Multi Choice Question
- **Proportional scoring** based on correctly selected options
- Score = points × (matching_options / total_correct_options)

```typescript
{
  "type": "multi_choice",
  "options": ["A", "B", "C", "D"],
  "scoring": {
    "correctOptions": ["A", "C"],
    "points": 20
  }
}
```

### 3. Number Question
- **Full points** if answer is within the specified range
- **Zero points** otherwise

```typescript
{
  "type": "number",
  "scoring": {
    "min": 3,
    "max": 10,
    "points": 15
  }
}
```

### 4. Text Question
- **Keyword matching** with case-insensitive search
- Score = points × (matched_keywords / total_keywords)

```typescript
{
  "type": "text",
  "scoring": {
    "keywords": ["typescript", "nodejs", "backend"],
    "points": 10
  }
}
```

## Architecture & Design Decisions

### 1. Database Optimization

**Indexing:**
- Jobs: Indexes on `createdAt`, `location`, `customer` for efficient sorting
- Applications: Compound indexes on `(jobId, totalScore)` and `(jobId, createdAt)`
- Questions: Index on `jobId` for efficient eager loading

**N+1 Query Prevention:**
- All list endpoints use Prisma's `include` for eager loading
- Single query with joins instead of multiple round trips

**Example:**
```typescript
// Single query with eager loading (not N+1)
const job = await prisma.job.findUnique({
  where: { id },
  include: { questions: true } // Loaded in same query
});
```

### 2. Pagination Strategy

**Offset-Based Pagination:**
- Simple and intuitive (`page` + `limit`)
- Reusable `PaginationQueryDto` across all endpoints
- Generic `PaginatedResponseDto<T>` for type safety

**Benefits:**
- Predictable page numbers for users
- Jump to any page directly
- Total count and page calculation included

### 3. Input Sanitization

**XSS Prevention:**
- DOMPurify sanitizes all text inputs before storage
- Applied via NestJS pipes (transparent to business logic)
- Prevents `<script>`, `<img>` injection, and event handlers

**Fields Sanitized:**
- Job: title, location, customer, description, question text, options
- Application: candidate name, email, text answers

### 4. Response Format

**Unified Structure:**
- All successful responses: `{ statusCode, message, data }`
- All error responses: `{ statusCode, message, error, timestamp, path }`
- Implemented via global interceptor and exception filter

### 5. Scoring Engine

**Strategy Pattern:**
- Each question type has a dedicated scorer class
- Easy to extend with new question types
- Separation of concerns (scoring logic isolated)

### 6. Data Storage Decisions

**SQLite Limitations & Solutions:**
- Arrays stored as JSON strings (transformed in service layer)
- Scoring configs stored as JSON
- Clean API contracts (arrays/objects) despite storage format
- Transform layer prevents implementation details from leaking

### 7. Validation Strategy

**Two-Layer Validation:**
- **Structured params** (sortBy, order, page, limit): Enum validation only
- **Free text**: Validation + Sanitization
- SQL injection prevented by Prisma's parameterized queries
- Type-safety through TypeScript

## Tradeoffs

### 1. SQLite vs PostgreSQL
**Decision:** SQLite
- ✅ Zero configuration, single file database
- ✅ Perfect for take-home assignments and demos
- ✅ Easy for reviewers to run locally
- ❌ Limited concurrent write performance (acceptable for demo)
- **Migration Path:** Prisma makes switching to PostgreSQL straightforward

### 2. Embedded Answers vs Separate Table
**Decision:** Storing answers as JSON in Application table
- ✅ Simpler queries, atomic operations
- ✅ Answers always retrieved with application
- ✅ Faster implementation
- ❌ Less flexible for complex queries (not needed for current requirements)

### 3. Calculate Score on Submit vs On-Demand
**Decision:** Calculate and store on submit
- ✅ Faster retrieval (no recalculation needed)
- ✅ Consistent scores over time
- ✅ Easier sorting by score
- ✅ Score breakdown stored for auditing
- ❌ Recalculation needed if scoring rules change (unlikely in demo)

### 4. Offset vs Cursor Pagination
**Decision:** Offset-based pagination
- ✅ Simpler to implement and understand
- ✅ Direct page access
- ✅ Good for moderate datasets
- ❌ Cursor-based would be better for very large datasets (overkill for demo)

## Project Structure
<!-- Generated with https://tree.nathanfriend.com/-->
```
loadup/
├── prisma/                          # Prisma database files
│   ├── schema.prisma                # Database schema definition
│   ├── migrations/                  # Database migration files
│   └── dev.db                       # SQLite database file (gitignored)
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── app.controller.ts            # Root controller
│   ├── app.service.ts               # Root service
│   ├── database/                    # Database module
│   │   ├── prisma.service.ts        # Prisma client service
│   │   └── prisma.module.ts         # Prisma module
│   ├── common/                      # Shared utilities
│   │   ├── constants/               # Constants & error messages
│   │   ├── decorators/              # Custom decorators
│   │   ├── dto/                     # Shared DTOs (pagination)
│   │   ├── enums/                   # Enums (question types, sort order)
│   │   ├── filters/                 # Exception filters
│   │   ├── interceptors/            # Response interceptors
│   │   ├── interfaces/              # TypeScript interfaces
│   │   └── pipes/                   # Validation & sanitization pipes
│   ├── jobs/                        # Job management module
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── jobs.module.ts
│   │   └── dto/
│   ├── applications/                # Application submission module
│   │   ├── applications.controller.ts
│   │   ├── applications.service.ts
│   │   ├── applications.module.ts
│   │   └── dto/
│   └── scoring/                     # Scoring engine
│       ├── scoring.service.ts
│       ├── scoring.module.ts
│       └── strategies/              # Scoring strategy implementations
│           ├── single-choice.scorer.ts
│           ├── multi-choice.scorer.ts
│           ├── number.scorer.ts
│           └── text.scorer.ts
├── test/                            # E2E tests
├── .env                             # Environment variables (gitignored)
├── .env.sample                      # Environment variables template
├── package.json                     # Dependencies and scripts
└── tsconfig.json                    # TypeScript configuration
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3000
```

## License

MIT
