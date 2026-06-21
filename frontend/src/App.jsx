import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import ConfigBuilder from './pages/ConfigBuilder';
import ConfigView from './pages/ConfigView';
import PricingCalculator from './pages/PricingCalculator';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function AppLayout() {
  const location = useLocation();
  const isPublicPage = location.pathname === '/';

  if (isPublicPage) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/builder" element={<ConfigBuilder />} />
          <Route path="/config/:id" element={<ConfigView />} />
          <Route path="/calculator" element={<PricingCalculator />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}