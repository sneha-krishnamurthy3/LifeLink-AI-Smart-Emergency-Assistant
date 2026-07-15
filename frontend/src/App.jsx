import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public pages
const Home               = lazy(() => import('@/pages/Home'));
const EmergencyAssistant = lazy(() => import('@/pages/EmergencyAssistant'));
const HospitalFinder     = lazy(() => import('@/pages/HospitalFinder'));
const BloodDonor         = lazy(() => import('@/pages/BloodDonor'));
const SOSPage            = lazy(() => import('@/pages/SOSPage'));
const VoiceAssistant     = lazy(() => import('@/pages/VoiceAssistant'));
const About              = lazy(() => import('@/pages/About'));

// Auth pages — pull named exports from AuthPage module
const LoginPage  = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.SignupPage })));

// Authenticated pages
const MyHealthPage = lazy(() => import('@/pages/MyHealthPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ── Public routes — no authentication required ─────────────── */}
        <Route path="/"          element={<Home />} />
        <Route path="/emergency" element={<EmergencyAssistant />} />
        <Route path="/hospitals" element={<HospitalFinder />} />
        <Route path="/donors"    element={<BloodDonor />} />
        <Route path="/sos"       element={<SOSPage />} />
        <Route path="/voice"     element={<VoiceAssistant />} />
        <Route path="/about"     element={<About />} />

        {/* ── Authentication routes ──────────────────────────────────── */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth"   element={<LoginPage />} />

        {/* ── Protected routes — require login ──────────────────────── */}
        <Route
          path="/my-health"
          element={
            <ProtectedRoute redirectTo="/login">
              <MyHealthPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
