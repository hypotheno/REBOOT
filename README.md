# 🏋️ REBOOT: Fitness Tracker Backend API

REBOOT is a RESTful backend API for a fitness tracking app. Users can register, log in, manage exercises, set fitness goals, build workout plans, and log their daily activities.

**Midterm Project: Backend API Deployment**
**Author:** Niño Belen

## 🔗 Live API

**Base URL:** `https://<REBOOT>.onrender.com`

> Note: Hosted on Render's free tier, so the first request may take 30–60 seconds to wake up the server.

## 🛠️ Tech Stack

- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** MySQL (mysql2)
- **Authentication:** JWT (access + refresh tokens), Passport
- **Password Hashing:** bcryptjs
- **Deployment:** Render

## 📁 Project Structure

```
src/
├── auth/             # Register, login, refresh token, JWT guard
├── users/            # User CRUD
├── exercises/        # Exercise CRUD
├── goals/            # Fitness goals CRUD
├── workout-plans/    # Workout plans CRUD
├── plan-exercises/   # Exercises inside a plan (sets/reps)
├── activity-logs/    # Workout activity logs CRUD
├── database/         # MySQL connection pool
├── common/           # Shared helpers and validation
├── app.module.ts
└── main.ts
```

## 🔐 Authentication

Only `/auth/*` routes are public. All other routes require a JWT access token in the header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire in 15 minutes. Use `/auth/refresh` to get a new one.

## 📌 API Endpoints

### Auth (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Get new tokens using refresh token |

### Users, Exercises, Goals, Workout Plans, Activity Logs (protected)

Each of these resources has the same CRUD endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/<resource>` | Get all records |
| GET | `/<resource>/:id` | Get one record |
| POST | `/<resource>` | Create a record |
| PUT | `/<resource>/:id` | Update a record |
| DELETE | `/<resource>/:id` | Delete a record |

Where `<resource>` is one of: `users`, `exercises`, `goals`, `workout-plans`, `activity-logs`.

### Plan Exercises (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plan-exercises` | Get all plan exercises |
| GET | `/plan-exercises/plan/:planId` | Get all exercises of a plan |
| GET | `/plan-exercises/:planId/:exerciseId` | Get one plan exercise |
| POST | `/plan-exercises` | Add an exercise to a plan |
| PUT | `/plan-exercises/:planId/:exerciseId` | Update sets/reps |
| DELETE | `/plan-exercises/:planId/:exerciseId` | Remove exercise from a plan |

## 📝 Sample Requests

**Register**
```json
POST /auth/register
{
  "full_name": "Niño Belen",
  "email": "nbelen@gbox.ncf.edu.ph",
  "password": "yourpassword",
  "weight_kg": 53,
  "height_cm": 169
}
```

**Login**
```json
POST /auth/login
{
  "email": "nbelen@gbox.ncf.edu.ph",
  "password": "yourpassword"
}
```

**Create Exercise**
```json
POST /exercises
{
  "exercise_name": "Push-ups",
  "category": "Strength",
  "calories_per_minute": 7,
  "description": "Bodyweight chest exercise"
}
```

## ✅ HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (missing or invalid fields) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |

## 💻 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/hypotheno/REBOOT.git
cd REBOOT

# 2. Install dependencies
npm install

# 3. Create a .env file
PORT=3000
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_SSL=false
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# 4. Run in development
npm run start:dev

# 5. Or build and run production
npm run build
npm start
```

## 🚀 Deployment (Render)

- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- Environment variables are set in the Render dashboard.
