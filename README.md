# AlgoLog 🚀

**Comprehensive Student Coding Analytics Platform**

AlgoLog is a production-ready, full-stack SaaS platform for educational institutions to track, analyze, and visualize student progress across multiple competitive programming platforms. Built with scalability, performance, and data integrity in mind.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Supported Platforms](#-supported-platforms)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Performance & Metrics](#-performance--metrics)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Features

### Core Capabilities
- 📊 **Multi-Platform Tracking**: Aggregate data from 6+ coding platforms
- 🎓 **Role-Based Access**: Separate dashboards for Admin, Faculty/Mentors, and Students
- 🔄 **Smart Data Sync**: Intelligent refetch with error recovery and retry logic
- 📈 **Advanced Analytics**: Performance trends, anomaly detection, validation scoring
- 🏆 **Contest Tracking**: Real-time LeetCode contest data with participant analysis
- 🗂️ **Hierarchical Organization**: Institution → Departments → Classes → Students
- 🔐 **Secure Authentication**: JWT-based auth with role-based permissions

### Advanced Features
- ⚡ **Batch Processing**: Concurrent data fetching with configurable concurrency
- 🛡️ **Data Validation**: Automatic validation and anomaly detection
- 📝 **Refetch Logging**: Persistent file-based logs for audit and analysis
- 🎯 **Rate Limiting**: Platform-specific rate limiters to prevent API abuse
- 💾 **Smart Caching**: Database-first caching with automatic invalidation
- 🔍 **Search & Filter**: Advanced filtering by department, class, year, performance
- 📊 **Data Quality Metrics**: Track validation scores and data freshness

### For Administrators
- 👥 Manage departments, classes, and student accounts
- 📤 Bulk CSV import/export for student data
- 🔄 Global refetch across all students
- 📊 Institution-wide analytics and reports
- 🏆 Contest leaderboards and participation tracking

### For Faculty/Mentors
- 📚 View students by department and class
- 🔄 Refetch data for specific classes
- 📈 Track individual student progress
- 🎯 Identify struggling students
- 📊 Class performance comparisons

### For Students
- 📊 Personal dashboard with multi-platform stats
- 🏆 Performance badges and achievements
- 📈 Progress visualization over time
- 🎯 Platform-specific insights
- 🔍 Compare with peers

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with modern hooks |
| **Redux Toolkit** | Centralized state management |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Lightning-fast build tool |
| **Chart.js** | Data visualization |
| **Lucide React** | Modern icon library |
| **React Hot Toast** | Elegant notifications |
| **React Router v7** | Client-side routing |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js v22+** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **Puppeteer** | Headless browser for scraping |
| **Cheerio** | HTML parsing |
| **Axios** | HTTP client |
| **Bottleneck** | Rate limiting |
| **bcrypt** | Password hashing |

### DevOps & Tools
- **Vercel**: Frontend hosting
- **MongoDB Atlas**: Cloud database
- **Nodemon**: Development hot-reload
- **ESLint**: Code linting
- **Git**: Version control

---

## 🎯 Supported Platforms

| Platform | Data Collected | Update Method | Status |
|----------|---------------|---------------|--------|
| 🟢 **LeetCode** | Problems solved (Easy/Medium/Hard), Contest rating, Global rank, Badges, Top percentage | GraphQL API + Scraper | ✅ Active |
| 🟠 **LeetCode Contests** | All contests, Participants, Start times, Duration | GraphQL API | ✅ Active |
| 🔵 **CodeChef** | Fully solved problems, Partially solved, Rating, Stars, Division, Contests | Web Scraper | ✅ Active |
| 🟠 **HackerRank** | Badges earned, Skills, Certifications | Web Scraper | ✅ Active |
| 🔴 **Codeforces** | Problems solved, Rating, Max rating, Rank, Contests | Web Scraper | ✅ Active |
| 🟣 **SkillRack** | Programs solved, Score, Tracks | Web Scraper | ✅ Active |
| ⚫ **GitHub** | Total commits, Repositories, Stars received, Contributions | Web Scraper | ✅ Active |

**Note**: All scrapers include retry logic, error handling, and respect platform rate limits.

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  Admin   │  │ Faculty  │  │ Student  │                │
│  │Dashboard │  │Dashboard │  │Dashboard │                │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│       │             │              │                       │
│       └─────────────┴──────────────┘                       │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTPS/REST API
┌───────────────────┴─────────────────────────────────────────┐
│                   Backend Layer (Node.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │  Middleware  │  │   Routes     │     │
│  └──────┬───────┘  └──────────────┘  └──────────────┘     │
│         │                                                   │
│  ┌──────┴────────────────────────────────────────┐        │
│  │          Business Logic Layer                 │        │
│  │  ┌────────────┐  ┌──────────────┐            │        │
│  │  │  Scrapers  │  │    Utils     │            │        │
│  │  │ (Puppeteer)│  │ (Validators) │            │        │
│  │  └────────────┘  └──────────────┘            │        │
│  └────────────────────────────────────────────────┘        │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────────┐
│                   Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   MongoDB    │  │  File Logs   │  │   Metrics    │     │
│  │  (Primary)   │  │  (Refetch)   │  │ (Analytics)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction**: Frontend sends authenticated request
2. **Authentication**: JWT token validated by middleware
3. **Controller Logic**: Route handler processes request
4. **Data Fetching**: Batch processor coordinates platform scrapers
5. **Validation**: Data validator checks quality and detects anomalies
6. **Storage**: MongoDB stores validated data; Logs written to files
7. **Response**: Enriched data sent back to frontend
8. **UI Update**: Redux state updated, components re-render

### Key Design Patterns

- **Repository Pattern**: Data access abstraction via Mongoose models
- **Batch Processing**: Concurrent operations with controlled concurrency
- **Circuit Breaker**: Automatic retry with exponential backoff
- **Smart Caching**: DB-first with upsert-only updates (no data deletion)
- **File-Based Logging**: Persistent audit trail for all refetch operations

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v4.4 or higher (or MongoDB Atlas account)
- **Git**: For version control
- **npm** or **yarn**: Package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dharanish-AM/AlgoLog.git
cd AlgoLog
```

2. **Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=8000
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/algolog
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

Server runs on `http://localhost:8000`

3. **Admin Dashboard Setup**
```bash
cd ../admin
npm install
npm run dev
```

Runs on `http://localhost:5173`

4. **Faculty Dashboard Setup**
```bash
cd ../faculty
npm install
npm run dev
```

Runs on `http://localhost:5174`

5. **Student Dashboard Setup**
```bash
cd ../student
npm install
npm run dev
```

Runs on `http://localhost:5175`

### Default Admin Credentials

After first run, create an admin account via MongoDB or use the signup flow. For development:

```javascript
// Use Postman to create admin
POST http://localhost:8000/api/admin/signup
{
  "name": "Admin User",
  "email": "admin@algolog.com",
  "password": "SecurePass123!"
}
```

---

## 📚 API Documentation

### Authentication

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@algolog.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "abc123",
    "name": "Admin User",
    "email": "admin@algolog.com"
  }
}
```

### Students

#### Get All Students
```http
GET /api/students/all
Authorization: Bearer <token>
```

#### Refetch Single Student Stats
```http
GET /api/student/refetch-student?id=<student_id>
Authorization: Bearer <token>
```

#### Refetch All Students
```http
GET /api/refetch-all-students
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "durationMs": 45230,
  "durationSec": "45.23",
  "departments": 5,
  "classes": 12,
  "totalStudents": 450,
  "succeeded": 440,
  "failed": 5,
  "skipped": 5,
  "totalPlatformsUpdated": 2640,
  "totalPlatformErrors": 12,
  "logFile": "/server/logs/refetch-all-students-2025-12-23.log"
}
```

### Contests

#### Get All Contests
```http
GET /api/contests/all
Authorization: Bearer <token>
```

#### Refetch Contests
```http
GET /api/contests/refetch
Authorization: Bearer <token>
```

### Metrics & Logs

#### Get Refetch Logs
```http
GET /api/metrics/logs
```

#### Get All-Students Refetch Metrics
```http
GET /api/metrics/logs/all-students
```

**Full API documentation**: See [API.md](./docs/API.md) (coming soon)

---

## 📊 Performance & Metrics

### Refetch Logs System

All refetch operations are logged to files for audit and analysis:

**Location**: `server/logs/`

**Log Types**:
- `refetch-all-students-YYYY-MM-DD.log`
- `refetch-single-student-YYYY-MM-DD.log`
- `refetch-class-students-YYYY-MM-DD.log`
- `refetch-contests-YYYY-MM-DD.log`

**Metrics Tracked**:
- Duration and performance
- Success/failure rates
- Platform-specific error rates
- Validation scores
- Anomaly detection results

**API Endpoints**:
- `GET /api/metrics/logs` - List all log files
- `GET /api/metrics/logs/all-students` - Aggregated metrics
- `POST /api/metrics/logs/cleanup` - Delete old logs

### Performance Benchmarks

| Operation | Avg Duration | Success Rate |
|-----------|-------------|--------------|
| Single student refetch | ~5s | 98%+ |
| Class refetch (50 students) | ~15s | 95%+ |
| All students (500 students) | ~45s | 97%+ |
| Contest data fetch | ~3s | 99%+ |

**Optimization Features**:
- Concurrent processing (6 workers)
- Batch size: 15 students
- Platform-specific rate limiting
- Retry logic with exponential backoff
- Connection pooling

---

## 📁 Project Structure

```
AlgoLog/
├── server/                      # Backend API
│   ├── config/                 # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   ├── axios.js           # Axios instance with retry
│   │   └── scraper.js         # Scraper config
│   ├── controllers/           # Request handlers
│   │   ├── authController.js  # Auth logic
│   │   ├── classController.js # Class management
│   │   ├── studentController.js # Student operations
│   │   └── contestController.js # Contest operations
│   ├── models/                # Mongoose schemas
│   │   ├── adminSchema.js
│   │   ├── classSchema.js
│   │   ├── departmentSchema.js
│   │   ├── studentSchema.js
│   │   └── contestSchema.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── classRoutes.js
│   │   └── studentRoutes.js
│   ├── middleware/            # Custom middleware
│   │   └── auth.js           # JWT verification
│   ├── scrapers/              # Platform scrapers
│   │   ├── scraper.js        # Main scraper logic
│   │   └── dummy-scraper.py  # Test scraper
│   ├── utils/                 # Helper utilities
│   │   ├── helpers.js        # General helpers
│   │   ├── jwt.js            # JWT utilities
│   │   ├── batchProcessor.js # Concurrent processing
│   │   └── dataValidator.js  # Data validation
│   ├── metrics/               # Logging & metrics
│   │   ├── RefetchLogsManager.js # Log management
│   │   ├── metricsRoutes.js     # Metrics API
│   │   └── README.md            # Metrics docs
│   ├── logs/                  # Refetch operation logs
│   ├── cron/                  # Scheduled jobs
│   │   └── cron.js           # Auto-refetch scheduler
│   ├── tests/                 # Test files
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── index.js              # Server entry point
│
├── admin/                     # Admin Dashboard
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Header.jsx
│   │   │   ├── StudentsTable.jsx
│   │   │   ├── ContestsTable.jsx
│   │   │   └── contest/
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contest.jsx
│   │   │   └── Auth.jsx
│   │   ├── redux/            # State management
│   │   │   └── store.js
│   │   ├── services/         # API calls
│   │   │   └── adminOperations.js
│   │   ├── utils/            # Utilities
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── faculty/                   # Faculty Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── services/
│   └── package.json
│
├── student/                   # Student Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── DATA_OPERATIONS_AUDIT.md  # Data integrity audit
├── README.md                  # This file
└── .gitignore
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (ESLint config)
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

### Reporting Issues

Please use GitHub Issues and include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

---

## 🛡️ Security

- JWT tokens expire in 24 hours
- Passwords hashed with bcrypt (10 rounds)
- Environment variables for sensitive data
- CORS enabled with configurable origins
- Input validation on all endpoints
- SQL injection prevention via Mongoose
- XSS protection via React

**Report security vulnerabilities**: [dharanisham@example.com](mailto:dharanisham@example.com)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Dharanish AM** - *Initial work* - [@Dharanish-AM](https://github.com/Dharanish-AM)

---

## 🙏 Acknowledgments

- Competitive programming platforms for inspiring this project
- Educational institutions for feedback and testing
- Open-source community for amazing tools and libraries

---

## 📞 Support

For support, email [dharanisham@example.com](mailto:dharanisham@example.com) or open an issue on GitHub.

---

**Built with ❤️ for educators and students worldwide**

⭐ Star this repo if you find it helpful!
