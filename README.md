<p align="center">
  <img src="https://img.shields.io/badge/LifeLink_AI-Emergency_Response-2563EB?style=for-the-badge&logo=heart&logoColor=white" alt="LifeLink AI" />
</p>

<h1 align="center">🏥 LifeLink AI</h1>
<h3 align="center">Your AI-Powered Emergency Companion</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Powered-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  An intelligent emergency response platform powered by <strong>Google Gemini AI</strong> that acts as your personal emergency coordinator — providing instant first aid guidance, locating nearby hospitals, connecting blood donors, and enabling one-touch SOS alerts.
</p>

<p align="center">
  Built for <strong>Google for Developers × Coding Ninjas Hackathon</strong> | Theme: <strong>Agentic AI & Emerging Tech</strong>
</p>

---

## 🌟 Overview

**LifeLink AI** is not just another chatbot — it's an **Agentic AI Emergency Coordinator** that understands the context of medical emergencies and takes intelligent action. When every second counts, LifeLink AI provides:

- 🧠 **AI-Powered Emergency Analysis** — Understands emergency descriptions and provides structured, actionable guidance
- 🏥 **Hospital Discovery** — Finds and displays nearby hospitals with ratings, distance, and navigation
- 🩸 **Blood Donor Network** — Connects users with compatible blood donors instantly
- 🚨 **One-Touch SOS** — Emergency alert system with location sharing and contact notification
- 🎙️ **Voice Assistant** — Hands-free emergency assistance using speech recognition
- 🛡️ **Safety First** — Always includes medical disclaimers and recommends professional help

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Home   │ │Emergency │ │Hospital  │ │  Blood Donor   │  │
│  │  Page   │ │Assistant │ │ Finder   │ │   Network      │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐                     │
│  │   SOS   │ │  Voice   │ │  About   │                     │
│  │  Alert  │ │Assistant │ │   Page   │                     │
│  └─────────┘ └──────────┘ └──────────┘                     │
│                        │ Axios HTTP                         │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                  BACKEND (FastAPI)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │ POST /chat   │ │ GET /donors  │ │  GET /hospitals     │  │
│  │  → Gemini AI │ │  → MongoDB/  │ │  → Google Places /  │  │
│  │              │ │    JSON      │ │    Sample Data      │  │
│  └──────────────┘ └──────────────┘ └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────┴────┐         ┌────┴────┐          ┌────┴────┐
    │ Google  │         │MongoDB /│          │ Google  │
    │ Gemini  │         │  JSON   │          │  Maps   │
    │   AI    │         │Fallback │          │   API   │
    └─────────┘         └─────────┘          └─────────┘
```

---

## ✨ Features

### 🧠 AI Emergency Assistant
The core of LifeLink AI. Powered by Google Gemini, it functions as an intelligent emergency coordinator that:
- Analyzes emergency descriptions in natural language
- Determines urgency level (Critical / High / Medium / Low)
- Provides step-by-step first aid instructions
- Lists clear Do's and Don'ts
- Recommends hospital visits when necessary
- Provides emergency contact numbers

### 🏥 Hospital Finder
- Google Maps integration for visual hospital discovery
- Search by city or use current location
- Hospital details: name, rating, distance, open/closed status
- One-tap navigation and calling

### 🩸 Blood Donor Network
- Filter donors by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- View donor details: name, age, distance, availability
- One-tap calling to donors
- MongoDB-powered with automatic JSON fallback

### 🚨 SOS Alert System
- Large, dramatic SOS button with pulse animation
- Shares current GPS location
- Displays emergency contacts
- Direct-dial emergency numbers (112, 108, 102)

### 🎙️ Voice Assistant
- Speech-to-text emergency description
- AI processes voice input and responds
- Text-to-speech reads AI response aloud
- Hands-free operation for critical situations

---

## 📁 Folder Structure

```
LifeLink-AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer, Layout
│   │   │   ├── chat/          # ChatBubble, ChatInput, SuggestionChips, ResponseCard
│   │   │   ├── cards/         # FeatureCard, HospitalCard, DonorCard
│   │   │   └── ui/            # Button, Badge, LoadingSpinner, AnimatedCounter
│   │   ├── context/           # EmergencyContext
│   │   ├── hooks/             # useGeolocation, useSpeechRecognition, useTextToSpeech
│   │   ├── pages/             # Home, EmergencyAssistant, HospitalFinder, BloodDonor, SOSPage, VoiceAssistant, About
│   │   ├── services/          # API service layer
│   │   ├── utils/             # Constants, helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Environment configuration
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic models
│   │   ├── routes/
│   │   │   ├── chat.py        # AI chat endpoint
│   │   │   ├── donors.py      # Blood donor endpoint
│   │   │   └── hospitals.py   # Hospital search endpoint
│   │   ├── services/
│   │   │   ├── gemini_service.py  # Google Gemini AI integration
│   │   │   └── db_service.py      # MongoDB + JSON fallback
│   │   └── data/
│   │       └── donors.json    # Sample donor data
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **Google AI Studio API Key** ([Get one here](https://aistudio.google.com/apikey))
- **MongoDB** (optional — automatically falls back to JSON)
- **Google Maps API Key** (optional — uses sample data without it)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/LifeLink-AI.git
cd LifeLink-AI
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Edit `.env` and add your **Gemini API Key** (required):
```
GEMINI_API_KEY=your_actual_gemini_api_key
```

Copy `.env` to the backend directory as well:
```bash
cp .env backend/.env
```

### 3. Install & Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open in Browser
Navigate to `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API health check |
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/chat` | Send emergency message to AI |
| `GET` | `/api/donors` | Get blood donors (optional: `?blood_group=A+`) |
| `GET` | `/api/hospitals` | Get nearby hospitals (optional: `?lat=...&lng=...&city=...`) |

### Example: Chat Request
```json
POST /api/chat
{
  "message": "My father has severe chest pain and difficulty breathing",
  "conversation_history": []
}
```

### Example: Chat Response
```json
{
  "emergency_type": "Possible Cardiac Emergency",
  "urgency_level": "CRITICAL",
  "first_aid": [
    "Call 112 immediately",
    "Help the person sit upright in a comfortable position",
    "Loosen any tight clothing",
    "If prescribed, help them take their nitroglycerin"
  ],
  "dos": ["Stay calm", "Monitor breathing", "Keep the person still"],
  "donts": ["Don't let them walk", "Don't give food or water", "Don't ignore symptoms"],
  "hospital_advice": "Rush to the nearest hospital with cardiac care immediately.",
  "emergency_numbers": ["112 - National Emergency", "108 - Ambulance"],
  "disclaimer": "This is AI-generated guidance. Always seek professional medical help."
}
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework & build tool |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **Animations** | Framer Motion | Smooth micro-interactions |
| **Icons** | Lucide React | Beautiful icon library |
| **Routing** | React Router v6 | Client-side navigation |
| **HTTP** | Axios | API communication |
| **Backend** | FastAPI | High-performance Python API |
| **AI Engine** | Google Gemini (via AI Studio) | Emergency analysis & guidance |
| **Database** | MongoDB | Blood donor data storage |
| **Fallback DB** | JSON files | Zero-config demo mode |
| **Maps** | Google Maps Platform | Hospital location & navigation |
| **Voice** | Web Speech API | Speech recognition & synthesis |

---

## 🧠 AI Agent Design

LifeLink AI is designed as an **Agentic AI** system, not a simple chatbot:

1. **Understanding** — Parses natural language emergency descriptions
2. **Assessment** — Determines urgency level and emergency type
3. **Action Planning** — Creates structured first aid action plans
4. **Guidance** — Provides step-by-step instructions with Do's and Don'ts
5. **Coordination** — Recommends hospital visits and emergency services
6. **Safety** — Always includes disclaimers and professional help recommendations

The system prompt instructs Gemini to behave as an emergency coordinator, responding with structured JSON that the frontend renders into beautiful, scannable cards.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend → Render
1. Push to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy with: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🔮 Future Scope

- 🚑 **Real-time Ambulance Tracking** — Live GPS tracking of dispatched ambulances
- ⌚ **Wearable Integration** — Connect with smartwatches for automatic emergency detection
- 🌍 **Multi-language Support** — Emergency assistance in regional languages
- 📱 **AR First Aid** — Augmented reality guided first aid procedures
- 👥 **Community Network** — Crowd-sourced emergency responders nearby
- 🏥 **Hospital Integration** — Direct API integration with hospital admission systems
- 📊 **Analytics Dashboard** — Emergency pattern analysis for city planning

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Team LifeLink** | Full Stack Development, AI Integration, UI/UX Design |

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the <strong>Google for Developers × Coding Ninjas Hackathon</strong>
</p>
<p align="center">
  <strong>Theme: Agentic AI & Emerging Tech</strong>
</p>
