/**
 * Feature Flags
 * 
 * Centralized configuration for toggling incomplete or future features.
 * This allows code for unfinished features to be merged into the main branch
 * without exposing them to users, ensuring the app remains deployable.
 */

export const features = {
  // Authentication & Infrastructure
  SUPABASE_AUTH: true,      // Phase 1: Authentication
  PWA_SUPPORT: true,        // Phase 1: Progressive Web App
  
  // My Health Platform
  MY_HEALTH_HUB: false,     // Phase 2: User Dashboard replacing Home for authenticated users
  MEDICAL_RECORDS: false,   // Phase 2: Real uploads to Supabase Storage
  MEDICINE_REMINDERS: false,// Phase 2: Medicine reminders
  APPOINTMENTS: false,      // Phase 2: Doctor appointments
  
  // AI Coordinator & Assessment Engine
  ASSESSMENT_ENGINE: false, // Phase 3: Domain layer assessment before Gemini
  STRUCTURED_AI: false,     // Phase 3: Gemini returns structured JSON action plan
  
  // Emergency Features
  HOSPITAL_OVERPASS: false, // Phase 4: Overpass API integration for real hospitals
  DONOR_NETWORK_V2: false,  // Phase 4: DB-backed donors with expanding radius
  DYNAMIC_SOS: false,       // Phase 4: DB-backed SOS contacts and live GPS SMS
  
  // Ecosystem Expansions
  EMERGENCY_CARD: false,    // Phase 5: QR-based public emergency profile
  FAMILY_DASHBOARD: false,  // Phase 6: Family tracking and SOS receiving
  EMERGENCY_TIMELINE: false,// Phase 6: Automatic history logging
  NOTIFICATIONS: false,     // Phase 8: Firebase Cloud Messaging
};

/**
 * Helper hook/function to check if a feature is enabled
 */
export const isFeatureEnabled = (featureKey) => {
  return features[featureKey] === true;
};
