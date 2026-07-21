import { Routes, Route, Link } from 'react-router-dom';
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

const NotFound = () => (
  <main className="route-status" aria-labelledby="not-found-title">
    <div className="route-status-card">
      <p className="route-status-code">404</p>
      <h1 id="not-found-title">Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại hoặc đã được thay đổi.</p>
      <Link className="btn btn-primary" to="/">Về trang chủ</Link>
    </div>
  </main>
);

function App() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" style={{ padding: 32, textAlign: 'center' }}>Đang tải…</div>}><Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/course/:id" element={<CoursePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes></Suspense>
  );
}

export default App;
