# 📘 SmartPedagogy Backend

This is the **backend** part of the SmartPedagogy project. It powers all logic behind student submissions, assignment evaluation, AI feedback generation, and role-based user management.

---

## 🚀 Features

### 📄 Assignment APIs

- Teachers can **upload assignments** (in text format).
- Students receive and submit their assignments.

### 🤖 AI Evaluation Engine

- Extracts content from submitted PDFs or images.
- Runs **AI model** and **AI-based evaluation**.
- Returns structured **scores and feedback**.

### 👥 Role-Based System

- Manages **Teacher** and **Student** roles.
- Authentication via JWT.

### 📊 Evaluation Storage

- AI feedback and scores are stored in MongoDB.
- Results are linked to assignments and students for insights.

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **Gemini API (AI Evaluation)**
- **Tesseract.js** (for image/PDF OCR)

---

## 📂 Project Structure (Backend)

```
smartpedagogy-backend/
│
├── config/             → Contains configuration files for establishing and managing the MongoDB connection
├── helper/             → Helper functions for API routes
├── models/             → Mongoose models
├── middlewares/        → JWT, role checks
├── routes/             → API routes for assignments, authentication, user management, submissions, and AI evaluation
├── server.js           → Main Express app
└── .env                → Environment variables
```

---

### 🔮 Future Plans

1. Teachers can upload **PDF or JPG** files (alongside text).
2. Enable **chat & student search** features.
3. **Subject-specific fine-tuned AI models**.
4. Extract & compare **questions vs answers** in assignment.
5. Improve **handwritten OCR** model accuracy.
6. Assign assignments **only to specific branches/sections**.

7. **Push notification system** for important updates.
8. **Version control** for assignment submissions.
9. **Live review sessions** via Meet/Zoom.
10. **Gamification features & leaderboards**.
11. **AI-powered doubt assistant** for students.

---

## 📦 Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Coder-life25/smartpedagogy-backend-.git
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with:

```
PORT=5555
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

4. Run the backend:

```bash
npm run dev
```

---

## 📄 License

MIT License
