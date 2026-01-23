# AlgoLog 🚀

**Educational Coding Analytics & Contest Management Platform**

AlgoLog is a comprehensive full-stack platform designed for educational institutions to track, manage, and analyze student progress in competitive programming. It supports multi-user roles (Admin, Faculty, Students), real-time data synchronization from multiple coding platforms, and advanced analytics dashboards.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v22+-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Features

### Core Capabilities
- 🎓 **Role-Based Access Control**: Separate interfaces for Admin, Faculty, and Students
- 📊 **Multi-Platform Tracking**: Aggregate data from coding platforms (LeetCode, CodeChef, Codeforces, HackerRank, SkillRack, GitHub)
- 🏆 **Contest Management**: Track LeetCode contests with participants and performance analytics
- 🗂️ **Hierarchical Organization**: Institution → Departments → Classes → Students structure
- 🔐 **Secure Authentication**: JWT-based authentication with password hashing
- 🔄 **Data Synchronization**: Real-time data fetching and updating from multiple platforms

### Administrator Features
- 👥 Manage departments, classes, and student accounts
- 📤 CSV bulk import/export for student data management
- 🔄 Trigger data refetch across all students
- 📊 Institution-wide analytics and dashboards
- 🏆 Contest leaderboards and tracking
- 📈 Performance analytics and trends

### Faculty Features
- 📚 View students organized by department and class
- 🔄 Refetch data for specific classes
- 📈 Track individual and class-wide progress
- 🎯 Performance monitoring and reporting
- 📊 Class comparisons and analytics

### Student Features
- 📊 Personal dashboard with profile statistics
- 🏆 View personal achievements and progress
- 📈 Track performance trends over time
- 🎯 Multi-platform coding statistics
- 🔍 Performance insights and analysis

---

## 🛠️ Tech Stack

### Frontend - Admin & Faculty
- **React 18** with modern hooks
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Vite** for fast builds
- **Chart.js & Recharts** for data visualization
- **React Router v7** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Frontend - Student
- **React 19** with latest features
- **Redux** for state management
- **Tailwind CSS** with scrollbar plugins
- **Vite** for bundling
- **Axios** for API communication
- **React Hot Toast** for user feedback

### Backend
- **Node.js v22+** runtime
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Puppeteer** for web scraping
- **Cheerio** for HTML parsing
- **Axios** HTTP client with retry logic
- **Bottleneck** for rate limiting
- **Node Cron** for scheduled tasks
- **Helmet** for security headers

---

## 📁 Project Structure

```
AlgoLog/
├── admin/                          # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Admin pages (Dashboard, Auth, Charts)
│   │   ├── redux/                  # State management
│   │   ├── services/               # API service calls
│   │   └── utils/                  # Helper functions
│   ├── package.json
│   └── vite.config.js
│
├── faculty/                        # Faculty dashboard (React + Vite)
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── pages/                  # Faculty views
│   │   ├── redux/                  # State management
│   │   ├── services/               # API calls
│   │   └── utils/                  # Utilities
│   ├── package.json
│   └── vite.config.js
│
├── student/                        # Student dashboard (React + Vite)
│   ├── src/
│   │   ├── components/             # UI elements
│   │   ├── pages/                  # Student pages
│   │   ├── utils/                  # Helper utilities
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Backend API (Node.js + Express)
│   ├── controllers/                # Route handlers
│   │   ├── authController.js       # Authentication logic
│   │   ├── studentController.js    # Student operations
│   │   ├── classController.js      # Class management
│   │   └── contestController.js    # Contest handling
│   ├── models/                     # MongoDB schemas
│   │   ├── adminSchema.js
│   │   ├── studentSchema.js
│   │   ├── classSchema.js
│   │   ├── departmentSchema.js
│   │   └── contestSchema.js
│   ├── routes/                     # API endpoints
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   └── classRoutes.js
│   ├── scrapers/                   # Data scraping modules
│   │   ├── scraper.js              # Main scraper
│   │   └── dummy-scrapper.py       # Python scraper
│   ├── config/                     # Configuration files
│   │   ├── database.js             # MongoDB connection
│   │   ├── axios.js                # Axios configuration
│   │   └── scraper.js              # Scraper settings
│   ├── middleware/                 # Express middleware
│   │   └── authMiddleware.js       # JWT verification
│   ├── utils/                      # Utility functions
│   │   ├── jwt.js                  # JWT operations
│   │   ├── helpers.js              # General helpers
│   │   ├── dataValidator.js        # Data validation
│   │   ├── batchProcessor.js       # Batch operations
│   │   └── errorTracker.js         # Error handling
│   ├── cron/                       # Scheduled tasks
│   │   └── cron.js
│   ├── logs/                       # Application logs
│   └── index.js                    # Server entry point
│
├── README.md
├── sonar-project.properties        # SonarQube configuration
└── .env (not in repo)              # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v22+ and npm
- MongoDB (local or Atlas cloud)
- Git

### Installation & Setup

#### 1. Clone Repository
```bash
git clone https://github.com/Dharanish-AM/AlgoLog.git
cd AlgoLog
```

#### 2. Setup Backend (Server)
```bash
cd server
npm install

# Create .env file in server/ directory
cat > .env << EOF
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algolog
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
EOF

npm start
```

The API will be available at `http://localhost:8000`

#### 3. Setup Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

Access at `http://localhost:5173`

#### 4. Setup Faculty Dashboard
```bash
cd faculty
npm install
npm run dev
```

Access at `http://localhost:5174`

#### 5. Setup Student Dashboard
```bash
cd student
npm install
npm run dev
```

Access at `http://localhost:5175`

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Contests
- `GET /api/contests` - Get all contests
- `GET /api/contests/:id` - Get contest details
- `POST /api/contests` - Create contest

---

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. All protected routes require:

```
Authorization: Bearer <token>
```

Users are authenticated with username/password, and a JWT token is issued on successful login.

---

## 📊 Data Models

### Student Schema
- Basic Info: Name, Email, Roll Number, Registration Number
- Platform Handles: LeetCode, CodeChef, Codeforces, HackerRank, SkillRack, GitHub usernames
- Statistics: Problems solved, ratings, achievements
- Relationships: Belongs to Class and Department

### Class Schema
- Class Name, Year, Section
- Associated Students and Faculty
- Department Reference

### Department Schema
- Department Name
- Associated Classes and Students

### Admin Schema
- Admin credentials and permissions
- Institution management access

### Contest Schema
- Contest name and metadata
- Participants and their performance
- Contest type and platform

---

## 🐳 Environment Variables

```env
# Server
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algolog
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=development

# Database
DB_NAME=algolog

# API Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📝 Development

### Running Tests
```bash
cd server
npm test
```

### Building for Production
---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend Layer (React + Vite)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Admin    │  │ Faculty  │  │ Student  │    │
│  │Dashboard │  │Dashboard │  │Dashboard │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼──────────────┼──────────────┼─────────┘
        │ HTTPS/REST API
┌───────┼──────────────┼──────────────┼─────────┐
│       ▼              ▼              ▼         │
│   ┌─────────────────────────────────────┐    │
│   │  Backend (Node.js + Express)        │    │
│   │  ┌───────────┐  ┌──────────────┐  │    │
│   │  │Controllers│  │Routes & Auth │  │    │
│   │  └─────┬─────┘  └──────────────┘  │    │
│   └────────┼────────────────────────────┘    │
│            ▼                                  │
│   ┌─────────────────────────────────────┐    │
│   │  Data Layer (MongoDB)               │    │
│   │  • Students & Classes               │    │
│   │  • Departments & Contests           │    │
│   │  • Admin Accounts                   │    │
│   └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘

External APIs ◄────────────────────────────────
 (LeetCode, CodeChef, Codeforces, etc.)
```

---

## 🔄 Core Workflows

### Authentication Flow
1. User logs in with credentials
2. Password verified against bcrypt hash
3. JWT token generated with user role
4. Token stored in frontend (localStorage/cookies)
5. All subsequent requests include token in header

### Data Fetching Flow
1. User triggers refetch (admin)
2. Backend gets student list from DB
3. Batch processor fetches from multiple platforms
4. Data validated and normalized
5. Conflicts detected and resolved
6. MongoDB updated with latest data
7. Success/failure logged to file
8. Metrics returned to frontend

### Multi-Dashboard Access
- Admin has full institutional access
- Faculty restricted to their department/classes
- Students see only their own data
- Role-based middleware enforces permissions

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v22 or higher
- **MongoDB**: Local or Atlas cloud database
- **npm**: Node package manager
- **Git**: For cloning the repository

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/Dharanish-AM/AlgoLog.git
cd AlgoLog
```

#### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algolog
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EOF

npm start
```

Backend runs on `http://localhost:8000`

#### 3. Admin Dashboard
```bash
cd ../admin
npm install
npm run dev
```

Access at `http://localhost:5173`

#### 4. Faculty Dashboard
```bash
cd ../faculty
npm install
npm run dev
```

Access at `http://localhost:5174`

#### 5. Student Dashboard
```bash
cd ../student
npm install
npm run dev
```

Access at `http://localhost:5175`

### Production Build
```bash
# Build each frontend
npm run build

# Build all at once
for dir in admin faculty student; do
  cd $dir && npm run build && cd ..
done
```

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Authentication**: Token-based with expiration
- **CORS Protection**: Configurable origins
- **Input Validation**: Server-side validation
- **Helmet.js**: Security headers
- **Environment Variables**: Sensitive data protection
- **Rate Limiting**: Prevent brute force attacks

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Dharanish AM** - [@Dharanish-AM](https://github.com/Dharanish-AM)

---

**Made with ❤️ for educational institutions**
