# Name Profile API

A Node.js + Express backend that enriches names with gender, age, and nationality predictions using public APIs — stored in SQLite.

---

## 📁 Project Structure

```
name-profile-api/
├── src/
│   ├── server.js                  # Entry point — wires everything together
│   ├── routes/
│   │   └── profileRoutes.js       # URL path → controller mapping
│   ├── controllers/
│   │   └── profileController.js   # HTTP logic: validate input, call services, respond
│   ├── services/
│   │   ├── externalApis.js        # Calls genderize, agify, nationalize APIs
│   │   └── profileService.js      # All database operations + business logic
│   ├── database/
│   │   └── db.js                  # SQLite connection + table creation
│   └── middleware/
│       └── errorHandler.js        # Global error + 404 handlers
├── data/                          # Auto-created — holds profiles.db (gitignored)
├── package.json
├── vercel.json                    # Vercel deployment config
└── .gitignore
```

---

## ⚡ How to Run Locally

### 1. Install Node.js
Download from https://nodejs.org (v18 or higher required for built-in `fetch`)

### 2. Clone / download this project, then:
```bash
cd name-profile-api
npm install
npm run dev     # development (auto-restarts on file changes)
# OR
npm start       # production
```

### 3. You should see:
```
✅ Database initialized — table ready.
🚀 Server running on http://localhost:3000
```

---

## 🧪 Testing with Postman

### Setup
1. Download Postman: https://postman.com
2. Set base URL: `http://localhost:3000`

---

### 1️⃣ POST /api/profiles — Create a profile

**Method:** POST  
**URL:** `http://localhost:3000/api/profiles`  
**Headers:** `Content-Type: application/json`  
**Body (raw JSON):**
```json
{ "name": "ella" }
```

**201 Success response:**
```json
{
  "status": "success",
  "message": "Profile created successfully",
  "data": {
    "id": "01952abc-def0-7000-8000-abcdef123456",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.98,
    "sample_size": 145021,
    "age": 34,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.12,
    "created_at": "2025-01-15T14:32:00.000Z"
  }
}
```

**Try the same name again → 200 with "already exists"**

**Try an invalid name (too obscure) → 502 error:**
```json
{
  "status": "error",
  "message": "Genderize returned an invalid response"
}
```

**Try missing name → 400 error:**
```json
{ "status": "error", "message": "Name is required" }
```

---

### 2️⃣ GET /api/profiles/:id — Get one profile

**Method:** GET  
**URL:** `http://localhost:3000/api/profiles/01952abc-def0-7000-8000-abcdef123456`  
(Use the actual ID returned from POST)

**200 Success:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**404 Not found:**
```json
{ "status": "error", "message": "Profile not found" }
```

---

### 3️⃣ GET /api/profiles — List all profiles (with optional filters)

**Method:** GET  
**URL:** `http://localhost:3000/api/profiles`

**With filters (add query params in Postman's "Params" tab):**
- `?gender=female`
- `?country_id=US`
- `?age_group=adult`
- `?gender=male&country_id=GB`  ← combined filters

**200 Success:**
```json
{
  "status": "success",
  "count": 3,
  "data": [ { ... }, { ... }, { ... } ]
}
```

---

### 4️⃣ DELETE /api/profiles/:id — Delete a profile

**Method:** DELETE  
**URL:** `http://localhost:3000/api/profiles/01952abc-def0-7000-8000-abcdef123456`

**204 Success:** (empty body — that's correct!)

**404 Not found:**
```json
{ "status": "error", "message": "Profile not found" }
```

---

## 🌐 Deploy to Vercel

> ⚠️ **Important SQLite note:** Vercel's serverless functions have a read-only filesystem.
> SQLite (a file-based database) **won't persist data** across requests on Vercel.
> For production deployment, use one of these alternatives:
> - **Turso** (SQLite-compatible, free tier): https://turso.tech
> - **PlanetScale** (MySQL): https://planetscale.com
> - **Neon** (PostgreSQL): https://neon.tech
>
> For learning/demo purposes, the steps below will still work — data just resets between cold starts.

### Steps:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (from project root)
vercel

# 4. Follow prompts, then deploy to production
vercel --prod
```

Your API will be live at: `https://your-project-name.vercel.app`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles` | Create profile for a name |
| GET | `/api/profiles` | List all profiles (filterable) |
| GET | `/api/profiles/:id` | Get single profile |
| DELETE | `/api/profiles/:id` | Delete profile |

### Query Filter Parameters (GET /api/profiles)
| Param | Values | Example |
|-------|--------|---------|
| `gender` | `male`, `female` | `?gender=female` |
| `country_id` | ISO code | `?country_id=NG` |
| `age_group` | `child`, `teenager`, `adult`, `senior` | `?age_group=adult` |

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Missing or empty name |
| 422 | Name is wrong type (not a string) |
| 404 | Profile not found |
| 502 | External API returned invalid/no data |
| 500 | Unexpected server error |