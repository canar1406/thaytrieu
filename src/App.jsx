import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<div role="status" style={{ padding: 32, textAlign: 'center' }}>Đang tải...</div>}><Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/course/:id" element={<CoursePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes></Suspense>
  );
}

export default App;
