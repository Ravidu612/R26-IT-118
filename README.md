# TeaGuard AI - Intelligent Decision Support System for Sri Lankan Tea Estate Management

## Project Information

Project Title: Intelligent Decision Support System for Sri Lankan Tea Estate Management  
Project ID: R26-IT-118  
Module: PP1 Research Project  
Institute: Sri Lanka Institute of Information Technology (SLIIT)

---

# Group Members

| Student ID | Name | Specialization Area |
|---|---|---|
| IT22209320 | Miuranga W.A.R | Tea Leaf Disease Detection and Pattern Analysis |
| IT22279620 | Gunasekara G.N.D | Tea-Specific Weather & Climate Intelligence System |
| IT22267986 | Gunasekara L.M.N.P | Labor Management & Welfare Optimization |
| IT22282668 | Pathirana I.M | AI-Based Tea Sorting and Grading Automation |

---

# Project Overview

TeaGuard AI is a microservices-based AI-powered intelligent decision support platform developed to modernize Sri Lankan tea estate management using Artificial Intelligence, Machine Learning, and Web Technologies.

The system integrates:
- Tea leaf disease detection
- AI-based tea sorting and grading
- Labor management optimization
- Tea-specific climate intelligence
- Real-time analytics dashboards
- Decision support automation

This project aims to reduce manual processes, improve tea quality consistency, and enhance productivity within tea estates and tea factories.

---

# Research Problem

Sri Lanka’s tea industry still relies heavily on traditional manual processes which create several operational issues:

- Manual tea grading inconsistencies
- Slow tea disease identification
- Inefficient labor allocation
- Lack of intelligent climate forecasting
- Reduced factory productivity
- Poor decision-making support systems

TeaGuard AI addresses these challenges through AI-driven automation and intelligent analytics.

---

# Proposed Solution

The proposed system introduces a unified AI-driven decision support system for tea estate management.

Main features include:
- AI-powered tea disease detection
- Automated tea sorting and grading
- Smart labor task allocation
- Climate and weather intelligence
- Predictive analytics dashboard
- Real-time web-based monitoring system

---

# Overall System Architecture

```text
User Interface Layer
        ↓
React Frontend + Web Dashboard
        ↓
API Gateway (Node.js)
        ↓
Microservices Architecture
 ├── Auth Service
 ├── Model Service
 ├── AI Prediction Service
 └── Analytics Service
        ↓
AI/ML Engine
 ├── CNN Models
 ├── ResNet50
 ├── LSTM
 └── Random Forest
        ↓
MongoDB Database + HuggingFace Deployment
```

---

# Technology Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js
- FastAPI

## Database
- MongoDB

## Artificial Intelligence and Machine Learning
- Python
- TensorFlow
- Scikit-learn
- OpenCV
- CNN
- ResNet50
- LSTM
- YOLO

## Deployment and Tools
- Hugging Face
- Docker
- Docker Compose
- Git and GitHub
- Google Colab
- Postman

---

# System Modules

## 1. Tea Leaf Disease Detection and Pattern Analysis

Researcher: IT22209320 - Miuranga W.A.R

### Features
- CNN/ResNet50 disease detection
- Real-time image prediction
- Multiple tea disease identification
- Confidence score generation
- AI recommendations

### Diseases Detected
- Anthracnose
- Bird Eye Spot
- Grey Blight
- Blister Blight
- Algal Leaf Spot

---

## 2. Labor Management and Welfare Optimization

Researcher: IT22267986 - Gunasekara L.M.N.P

### Features
- AI-based worker allocation
- Smart task assignment
- Productivity forecasting
- Worker analytics dashboard
- Workforce optimization

---

## 3. AI-Based Tea Sorting and Grading Automation

Researcher: IT22282668 - Pathirana I.M

### Features
- AI-powered tea grading
- CNN image classification
- Batch quality analytics
- Automated grade prediction
- Factory process automation

### Tea Grades
- OP
- BOP
- BOPF
- Dust

### Evaluation Parameters
- Color
- Texture
- Particle Size
- Shape Consistency
- Moisture Level
- Density

---

## 4. Tea-Specific Weather and Climate Intelligence System

Researcher: IT22279620 - Gunasekara G.N.D

### Features
- Live weather API integration
- ML-based disease risk prediction
- Temperature forecasting
- Climate stress analysis
- Remote field monitoring

---

# Implemented First Phase

- Landing Page
- Login and Register System
- Protected Dashboard
- JWT Authentication
- MongoDB Integration
- FastAPI AI Service
- HuggingFace Deployment Setup
- Docker Configuration
- REST API Architecture
- Frontend UI Development

---

# Current Project Progress

| Component | Progress |
|---|---|
| Dataset Collection | 80% |
| Frontend Development | 70% |
| AI Model Training | 65% |
| Backend APIs | 70% |
| System Integration | 65% |
| Testing | 60% |

---

# Security Features

- JWT Authentication
- Refresh Token Strategy
- Protected API Routes
- Secure Environment Variables
- Server-side AI API Tokens

---

# Project Folder Structure

```text
TeaGuard-AI/
│
├── Frontend/
│
├── Backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── model-service/
│   └── shared/
│
├── AI-Models/
│
├── Dataset/
│
├── Documentation/
│
└── README.md
```

---

# Environment Setup

## Required Environment Variables

```env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
HF_TOKEN=
HF_API_URL=
```

---

# Run Without Docker

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

# Run With Docker

```bash
docker compose up --build
```

## Access Services

Frontend:
```text
http://localhost:5173
```

API Gateway:
```text
http://localhost:5000
```

---

# AI Models Used

| Model | Purpose |
|---|---|
| CNN | Tea image classification |
| ResNet50 | Disease detection |
| YOLO | Leaf object detection |
| LSTM | Weather forecasting |
| Random Forest | Labor analytics |

---

# Key Functional Requirements

- User Authentication
- Tea Image Upload
- Disease Prediction
- Tea Grade Classification
- Analytics Dashboard
- Weather Monitoring
- Labor Allocation
- Report Generation

---

# Non-Functional Requirements

- High Accuracy
- Fast Response Time
- User-Friendly UI
- Scalable Architecture
- Secure System Design
- Responsive Web Interface

---

# Research Contribution

TeaGuard AI introduces a novel integrated AI platform specifically designed for Sri Lankan tea estate management by combining:
- Tea disease intelligence
- Climate prediction
- AI grading automation
- Labor optimization
- Unified analytics dashboard

into one centralized intelligent decision support system.

---

# References

- Tea Research Institute Sri Lanka
- TensorFlow Documentation
- MongoDB Documentation
- Hugging Face Documentation
- React.js Documentation
- FastAPI Documentation

---

# License

This project is developed for academic and research purposes under SLIIT.

---

# GitHub Repository

Add your GitHub repository link here.

Example:

```text
https://github.com/Ravidu612/R26-IT-118.git
```

---

# Conclusion

TeaGuard AI aims to digitally transform Sri Lanka’s tea industry using Artificial Intelligence and intelligent automation. The system improves operational efficiency, tea quality management, workforce optimization, and decision-making capabilities for tea estate management.
