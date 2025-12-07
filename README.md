# AlgoLog 🚀  
**Track Student Coding Progress Across Multiple Platforms**

AlgoLog is a full-stack platform for monitoring algorithmic problem-solving activities across multiple coding platforms. Built for educational institutions to track student performance.

---

## 🌟 Features

- 📊 Multi-platform progress tracking
- 🎓 Role-based dashboards (Admin, Faculty, Student)
- 🔄 Automated data synchronization
- 📈 Analytics and reporting
- 🔐 Secure authentication
- 🗂️ Hierarchical organization (Institution → Departments → Classes → Students)

---

## 🛠️ Tech Stack

### Frontend
- React.js with Redux Toolkit
- Tailwind CSS
- Vite
- Chart.js

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Web Scrapers (Puppeteer, Cheerio)

---

## 🎯 Supported Platforms

| Platform | Data Collected | Refresh Method |
|----------|---------------|----------------|
| 🟢 **LeetCode** | Problems solved (Easy/Medium/Hard), Contest rating, Global rank, Badges | GraphQL API + Scraper |
| 🔵 **CodeChef** | Fully solved problems, Rating, Contests | Web Scraper |
| 🟠 **HackerRank** | Badges earned, Certifications | Web Scraper |
| 🔴 **Codeforces** | Problems solved, Rating, Contests | Web Scraper |
| 🟣 **SkillRack** | Programs solved, Score | Web Scraper |
| ⚫ **GitHub** | Total commits, Repositories, Contributions | Web Scraper |

---

## 📁 Project Structure

```
AlgoLog/
├── server/                  # Backend API
│   ├── config/             # Database & configuration
│   │   ├── database.js
│   │   └── scraper.js
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── classController.js
│   │   └── studentController.js
│   ├── models/             # Mongoose schemas
│   │   ├── adminSchema.js
│   │   ├── classSchema.js
│   │   ├── departmentSchema.js
│   │   └── studentSchema.js
│   ├── routes/             # API endpoints
│   │   ├── authRoutes.js
│   │   ├── classRoutes.js
│   │   └── studentRoutes.js
│   ├── middleware/         # Custom middleware
│   ├── scrapers/           # Platform scrapers
│   │   └── scraper.js
│   ├── utils/              # Helper functions
│   │   ├── helpers.js
│   │   ├── jwt.js
│   │   ├── batchProcessor.js
│   │   └── dataValidator.js
│   ├── cron/               # Scheduled jobs
│   └── index.js            # Server entry point
│
├── admin/                  # Admin Dashboard (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── faculty/                # Faculty Dashboard (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── services/
│   └── package.json
│
├── student/                # Student Dashboard (React)
│   ├── src/
│   │   ├── components/

---

## 🎯 Supported Platforms

LeetCode | CodeChef | HackerRank | Codeforces | SkillRack | GitHub

---

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/Dharanish-AM/AlgoLog.git
cd AlgoLog
```

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file with MongoDB URI and JWT secret, then:
```bash
npm run dev
```

### Frontend Setup
```bash
cd admin   # or faculty / student
npm install
npm run dev
```

---

## 📝 License

MIT License

---

**Built with ❤️ for educators and students**
