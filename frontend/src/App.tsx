import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { SimulateDefectModal } from './components/SimulateDefectModal';
import { SystemicAlertModal } from './components/SystemicAlertModal';
import { HackathonDemoModal } from './components/HackathonDemoModal';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { DefectDetails } from './pages/DefectDetails';
import { PatternIntelligence } from './pages/PatternIntelligence';
import { PatternDetails } from './pages/PatternDetails';
import { NCRManagement } from './pages/NCRManagement';
import { TicketManagement } from './pages/TicketManagement';
import { QualityAnalytics } from './pages/QualityAnalytics';
import { StationHealth } from './pages/StationHealth';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

import { api } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('sentinel_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      email: 'engineer@forgesentinel.com',
      full_name: 'Alex Rivera',
      role: 'ENGINEER'
    };
  });

  const [unreadCount, setUnreadCount] = useState(2);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [systemicModalOpen, setSystemicModalOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sentinel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sentinel_user');
    }
  }, [user]);

  // Fetch unread alerts
  const loadAlertsCount = async () => {
    try {
      const alerts = await api.getAlerts({ acknowledged: 'false' });
      setUnreadCount(alerts.length);
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    loadAlertsCount();
    const interval = setInterval(loadAlertsCount, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDefectCreated = (result: any) => {
    setSimulationResult(result);
    if (result.is_systemic) {
      setSystemicModalOpen(true);
    }
    loadAlertsCount();
  };

  const handleResetDatabase = async () => {
    try {
      await api.resetDemoDatabase();
      alert('Database successfully reset to seed hackathon state!');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        {/* Left Sidebar */}
        <Sidebar
          userRole={user.role}
          userName={user.full_name}
          onOpenDemo={() => setDemoModalOpen(true)}
          onOpenSimulate={() => setSimulateModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar
            unreadAlertCount={unreadCount}
            onOpenDemo={() => setDemoModalOpen(true)}
            onOpenSimulate={() => setSimulateModalOpen(true)}
            onResetDatabase={handleResetDatabase}
          />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-monitor" element={<LiveMonitor onOpenSimulate={() => setSimulateModalOpen(true)} />} />
              <Route path="/defects/:id" element={<DefectDetails />} />
              <Route path="/patterns" element={<PatternIntelligence />} />
              <Route path="/patterns/:id" element={<PatternDetails />} />
              <Route path="/ncrs" element={<NCRManagement />} />
              <Route path="/tickets" element={<TicketManagement />} />
              <Route path="/analytics" element={<QualityAnalytics />} />
              <Route path="/stations" element={<StationHealth />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Modals */}
        <SimulateDefectModal
          isOpen={simulateModalOpen}
          onClose={() => setSimulateModalOpen(false)}
          onDefectCreated={handleDefectCreated}
        />

        <SystemicAlertModal
          isOpen={systemicModalOpen}
          onClose={() => setSystemicModalOpen(false)}
          result={simulationResult}
        />

        <HackathonDemoModal
          isOpen={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          onDemoCompleted={handleDefectCreated}
        />
      </div>
    </Router>
  );
};
export default App;
