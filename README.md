# TeaGuard AI - Intelligent Tea Estate Management System

AI-powered decision support system for Sri Lankan tea estate management using Machine Learning, microservices, and modern web technologies.

---

# 📌 Project Overview

This project is designed to modernize tea estate management in Sri Lanka by introducing Artificial Intelligence and automation into tea grading, labor management, task allocation, and estate monitoring.

The platform provides:

- Tea leaf quality identification
- Worker attendance & labor optimization
- Task allocation management
- Dashboard analytics & reports
- AI-powered decision support
- Microservices-based scalable architecture

---

# 🎯 Research Problem

Tea estate management in Sri Lanka still relies heavily on manual processes, causing:

- Inefficient labor allocation
- Inaccurate tea grading
- Poor productivity monitoring
- Delays in management decisions

This system aims to solve these issues using AI-driven automation and intelligent decision support.

---

# 💡 Proposed Solution

The proposed system includes:

- AI-based tea leaf grading model
- Smart task allocation system
- Worker attendance monitoring
- Analytics dashboard
- Report generation system
- Web-based management platform
- Secure authentication system
- Microservices backend architecture

---

# 🛠 Technologies Used

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## AI / Machine Learning
- Python
- TensorFlow
- Scikit-learn
- OpenCV
- Hugging Face

## Tools
- Git & GitHub
- VS Code
- Docker
- Docker Compose
- Google Colab
- Postman

---

# 👥 Group Members

| Name | Student ID |
|---|---|
| Ravidu Miuranga | IT22209320 |
| Nethmi | IT22267986 |
| Member 3 | IT22282668 |
| Member 4 | IT22279620 |

---

# 📂 System Modules

## 1. Tea Leaf Grading Module
Uses AI to identify tea grades based on uploaded images.

## 2. Labor Management Module
Tracks worker attendance and manages workforce allocation.

## 3. Task Allocation Module
Assigns estate tasks efficiently based on workload and labor availability.

## 4. Analytics Dashboard
Displays charts, statistics, and estate performance reports.

## 5. Authentication Module
Handles secure login, registration, JWT authentication, and refresh tokens.

---

# 🧠 AI Features

- Tea grade prediction
- Dataset training
- Machine learning model evaluation
- Automated decision support
- AI model integration using Hugging Face APIs

---

# 📊 Functional Requirements

- User authentication
- Upload tea leaf images
- Generate grading reports
- Manage workers and tasks
- View analytics dashboard
- Download reports

---

# 🔒 Non-Functional Requirements

- User-friendly UI
- Fast response time
- Secure authentication
- Scalable architecture
- Responsive design

---

# 🏗 System Architecture

```text
User → Frontend (React + Vite)
            ↓
      API Gateway
            ↓
 ┌─────────────────────┐
 │ Auth Service        │
 │ Model Service       │
 │ Shared Services     │
 └─────────────────────┘
            ↓
       MongoDB Database
            ↓
      AI/ML Python Service
```

---

# 📁 Project Structure

```text
R26-IT-118/
│
├── Frontend/
│
├── Backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── model-service/
│   └── shared/
│
├── .env
├── .env.example
├── docker-compose.yml
└── README.md
```

---

# 🚀 Installation Guide

## Clone Repository

```bash
git clone https://github.com/Ravidu612/R26-IT-118.git
```

---

# ⚙ Environment Setup

1. Copy `.env.example` to `.env`

2. Configure environment variables:

```env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
HF_TOKEN=
```

---

# ▶ Run Without Docker

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Auth Service

```bash
cd Backend/auth-service
npm install
npm run dev
```

## Model Service

```bash
cd Backend/model-service
npm install
npm run dev
```

## API Gateway

```bash
cd Backend/api-gateway
npm install
npm run dev
```

---

# 🐳 Run With Docker Compose

```bash
docker compose up --build
```

Access:

- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000

---

# 🔐 Security Notes

- Frontend communicates only with backend APIs
- Hugging Face tokens are stored server-side
- Environment variables are protected using `.env`
- No sensitive secrets are committed to GitHub

---

# 📈 Current Progress

- Research topic selected
- Initial system design completed
- GitHub repository created
- README documentation completed
- Basic microservices architecture initialized
- Frontend authentication pages completed
- Backend authentication service initialized
- Docker configuration completed

---

# 📈 Future Improvements

- Real-time IoT integration
- Mobile application
- Advanced AI prediction models
- GPS-based worker tracking
- Cloud deployment
- Real-time analytics dashboards

---

# 📚 References

- Tea Research Institute Sri Lanka
- TensorFlow Documentation
- MongoDB Documentation
- React Documentation
- Node.js Documentation

---

# 🌟 Conclusion

This project aims to modernize Sri Lankan tea estate management using Artificial Intelligence, machine learning, and scalable web technologies. The system will improve efficiency, productivity, and decision-making capabilities within tea estate operations.

---

# 📄 License

This project is developed for academic and research purposes at SLIIT.