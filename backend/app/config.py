"""
LifeLink AI - Application Configuration

Loads environment variables from the backend/.env file and exports
configuration constants used throughout the application.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory (parent of app/)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# --- Google Gemini AI ---
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")

# --- MongoDB ---
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "lifelink_ai")

# --- Google Maps / Places ---
GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "your_google_maps_api_key_here")

# --- CORS / Frontend ---
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# --- Firebase Cloud Messaging (FCM) ---
FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
