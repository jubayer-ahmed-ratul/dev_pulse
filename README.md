# DevPulse

An internal tech issue and feature tracker for software teams. Teams can report bugs, suggest features, and coordinate resolutions through a role-based REST API.

**Live URL:** (https://devpulsee-delta.vercel.app/)

---

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor / maintainer)
- Create, view, update, and delete issues
- Filter issues by type and status, sort by date
- Reporter details included in issue responses (no SQL JOINs)
- Maintainer-only status workflow control
- Passwords never exposed in any response

---

## Tech Stack

| Technology | Details |
|---|---|
| Node.js | LTS runtime (v24.x) |
| TypeScript | Latest stable version |
| Express.js | Modular router architecture |
| PostgreSQL | Hosted on Neon (serverless) |
| pg | Native PostgreSQL driver, raw SQL only |
| bcryptjs | Password hashing (salt rounds: 10) |
| jsonwebtoken | JWT generation and verification |
| dotenv | Environment variable management |
| tsx | TypeScript execution for development |

---

## Setup

### Prerequisites

- Node.js v24.x or higher
- PostgreSQL database (or a [Neon](https://neon.tech) account)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd devpulse

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
CONNECTIONSTRING=postgresql://<user>:<password>@<host>/<db>?sslmode=require
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### Run

```bash
# Development (with hot reload)
npm run dev
```

The server will start on `http://localhost:5000`. The database tables are created automatically on first run.

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues (with filters) |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update issue fields |
| PATCH | `/api/issues/:id/status` | Maintainer only | Update issue status |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for `GET /api/issues`

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

**Example:**
```
GET /api/issues?sort=oldest&type=bug&status=open
```

### Authorization Header

Protected endpoints require:
```
Authorization: <JWT_TOKEN>
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(50) | Required |
| email | VARCHAR(50) | Unique, required |
| password | TEXT | Hashed, never returned |
| role | VARCHAR(20) | `contributor` (default) or `maintainer` |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-generated |

### `issues`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required |
| description | TEXT | Required, min 20 characters |
| type | VARCHAR(20) | `bug` or `feature_request` |
| status | VARCHAR(20) | `open` (default), `in_progress`, `resolved` |
| reporter_id | INT | References users.id (app-level validation) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-generated |

---

## User Roles

| Role | Permissions |
|---|---|
| contributor | Register, login, create issues, view issues, update own open issues |
| maintainer | All contributor permissions + update any issue, delete issues, change status |

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```
