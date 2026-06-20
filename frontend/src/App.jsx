import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import ConfigBuilder from './pages/ConfigBuilder';
import ConfigView from './pages/ConfigView';
import PricingCalculator from './pages/PricingCalculator';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function AppLayout() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (!token || isPublicPage) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/parts" element={<PrivateRoute><Parts /></PrivateRoute>} />
          <Route path="/builder" element={<PrivateRoute><ConfigBuilder /></PrivateRoute>} />
          <Route path="/config/:id" element={<PrivateRoute><ConfigView /></PrivateRoute>} />
          <Route path="/calculator" element={<PrivateRoute><PricingCalculator /></PrivateRoute>} />
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