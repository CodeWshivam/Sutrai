import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { EmergencyBanner } from './components/common/EmergencyBanner';

const AppContent: React.FC = () => {
  const [showGlobalEmergency, setShowGlobalEmergency] = useState(false);
  const navigate = useNavigate();

  const handleTriggerEmergency = () => {
    setShowGlobalEmergency(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cloud text-midnight selection:bg-aqua/20 selection:text-midnight">
      {/* Sticky Navbar */}
      <Navbar onTriggerEmergency={handleTriggerEmergency} />

      {/* Global Emergency Modal / Banner Overlay if triggered from Navbar */}
      {showGlobalEmergency && (
        <div className="bg-midnight-950 p-4 border-b border-coral/30">
          <div className="max-w-7xl mx-auto">
            <EmergencyBanner
              scenarioName="Acute Cardiac Distress Simulation (User Triggered)"
              location={{
                address: '14th Cross, Indiranagar, Bengaluru (Simulated GPS)',
                coordinates: { latitude: 12.9784, longitude: 77.6408 },
                source: 'gps',
                isUnknown: false,
              }}
              onDismiss={() => setShowGlobalEmergency(false)}
              isSimulated={true}
            />
          </div>
        </div>
      )}

      {/* Main Page Routing */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onTriggerEmergency={handleTriggerEmergency} />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

import { ThemeProvider } from './context/ThemeContext';

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
