# 🎓 CIA Management System — MCA Department

A full-stack web application for managing MCA Continuous Internal Assessment (CIA) marks.
Built with **React + Redux** (frontend), **Express.js** (backend), and **MySQL** (database).

---

## 📁 Project Structure

```
cia-management/
├── database.sql                     ← MySQL schema + seed data
├── README.md
│
├── backend/                         ← Express.js REST API
│   ├── server.js                    ← Entry point (port 5000)
│   ├── .env                         ← DB & JWT config
│   ├── package.json
│   ├── config/
│   │   └── db.js                    ← MySQL connection
│   ├── middleware/
│   │   └── auth.js                  ← JWT + role-based guard
│   └── routes/
│       ├── auth.js                  ← POST /api/auth/login, /register
│       ├── marks.js                 ← GET/POST /api/marks
│       ├── students.js              ← CRUD /api/students
│       ├── faculty.js               ← CRUD /api/faculty
│       └── courses.js               ← GET /api/courses
│
└── frontend/                        ← React + Redux SPA
    ├── package.json
    └── src/
        ├── index.js                 ← Redux Provider + ReactDOM
        ├── index.css                ← Dark red theme + global styles
        ├── App.js                   ← Protected routes by role
        ├── store/
        │   ├── store.js             ← Redux configureStore
        │   └── slices/
        │       ├── authSlice.js     ← Login/logout state
        │       ├── marksSlice.js    ← CIA marks state
        │       └── studentsSlice.js ← Students CRUD state
        ├── pages/
        │   └── LoginPage.js         ← Role tabs: Admin/Faculty/Student
        └── components/
            ├── shared/
            │   ├── Navbar.js        ← Top navbar with logout
            │   └── Chatbot.js       ← Rule-based CIA chatbot
            ├── admin/
            │   ├── AdminDashboard.js
            │   ├── StudentManagement.js  ← Add/Delete students
            │   ├── FacultyManagement.js  ← Add/View faculty
            │   └── MarksOverview.js      ← View all marks per course
            ├── faculty/
            │   ├── FacultyDashboard.js
            │   ├── CIAMarks.js      ← Enter/Save/Export marks
            │   └── Courses.js       ← View assigned courses
            └── student/
                └── StudentDashboard.js  ← View-only marks + stats
```

---

## 🚀 Setup Instructions

### 1. MySQL Database

```bash
mysql -u root -p < database.sql
```

### 2. Backend (Express.js)

```bash
cd backend
npm install
# Edit .env if needed (DB password etc.)
npm run dev        # nodemon (development)
# or
npm start          # node (production)
```
Server runs on: **http://localhost:5000**

### 3. Frontend (React + Redux)

```bash
cd frontend
npm install
npm start
```
App runs on: **http://localhost:3000**

---

## 🔑 Login Credentials

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@college.edu        | admin123     |
| Faculty | ramesh@college.edu       | faculty123   |
| Faculty | sunita@college.edu       | faculty123   |
| Student | asha@student.edu         | student123   |
| Student | ravi@student.edu         | student123   |
| Student | meena@student.edu        | student123   |
| Student | arun@student.edu         | student123   |
| Student | priya@student.edu        | student123   |

---

## 👥 Role Permissions

| Feature                  | Admin | Faculty | Student |
|--------------------------|:-----:|:-------:|:-------:|
| View own marks           |       |         | ✅      |
| Enter CIA marks          |       | ✅      |         |
| Export marks CSV         |       | ✅      |         |
| Print marks sheet        |       | ✅      |         |
| View all courses         | ✅    | ✅      | ✅      |
| Manage students          | ✅    |         |         |
| Manage faculty           | ✅    |         |         |
| Marks overview (all)     | ✅    |         |         |
| Chatbot assistant        | ✅    | ✅      | ✅      |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` — Login (email, password, role)
- `POST /api/auth/register` — Register user

### Marks
- `GET /api/marks/:course` — Get marks for a course
- `GET /api/marks/student/:usn` — Get student's all marks
- `POST /api/marks` — Save marks (faculty/admin)

### Students
- `GET /api/students` — List all students
- `POST /api/students` — Add student (admin)
- `PUT /api/students/:id` — Update student (admin)
- `DELETE /api/students/:id` — Delete student (admin)

### Faculty
- `GET /api/faculty` — List faculty (admin)
- `POST /api/faculty` — Add faculty (admin)

### Courses
- `GET /api/courses` — List all courses

---

## 🛠 Tech Stack

- **Frontend:** React 18, Redux Toolkit, React Router v6, Axios
- **Backend:** Node.js, Express.js, JWT, bcryptjs
- **Database:** MySQL (mysql2)
- **Fonts:** Crimson Pro + DM Sans (Google Fonts)
