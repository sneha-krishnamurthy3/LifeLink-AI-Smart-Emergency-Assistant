import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Home = lazy(() => import('@/pages/Home'));
const EmergencyAssistant = lazy(() => import('@/pages/EmergencyAssistant'));
const HospitalFinder = lazy(() => import('@/pages/HospitalFinder'));
const BloodDonor = lazy(() => import('@/pages/BloodDonor'));
const SOSPage = lazy(() => import('@/pages/SOSPage'));
const VoiceAssistant = lazy(() => import('@/pages/VoiceAssistant'));
const About = lazy(() => import('@/pages/About'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emergency" element={<EmergencyAssistant />} />
        <Route path="/hospitals" element={<HospitalFinder />} />
        <Route path="/donors" element={<BloodDonor />} />
        <Route path="/sos" element={<SOSPage />} />
        <Route path="/voice" element={<VoiceAssistant />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

export default App;
