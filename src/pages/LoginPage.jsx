import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './LandingPage.css';
import './LoginPage.css';
import { apiFetch } from '../api';

gsap.registerPlugin(useGSAP);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useGSAP(() => {
    // Page fade in
    gsap.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
    
    // Left side slide in
    gsap.fromTo('.login-split-left', 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 }
    );
    
    // Right side slide in
    gsap.fromTo('.login-split-right', 
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    
    // Login box pop up
    gsap.fromTo('.login-box', 
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)', delay: 0.3 }
    );
  }, { scope: containerRef });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      const user = response.ok && data.success ? data.user : null;
      
      if (user) {
        sessionStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('Email hoặc mật khẩu không chính xác');
        formRef.current.classList.add('shake');
        setTimeout(() => {
          formRef.current.classList.remove('shake');
        }, 820);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối với máy chủ.');
    }
  };

  return (
    <div className="lp-root login-page-root" ref={containerRef}>
      {/* ═══ ANIMATED BLOBS ═══ */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      
      {/* ═══ MATH BACKGROUND ═══ */}
      <div className="math-bg-container">
        {/* Simple Symbols */}
        <span className="math-sym sym-1">∫</span>
        <span className="math-sym sym-2">∑</span>
        <span className="math-sym sym-3">π</span>
        <span className="math-sym sym-4">√</span>
        <span className="math-sym sym-5">∞</span>
        <span className="math-sym sym-6">Δ</span>
        <span className="math-sym sym-7">θ</span>
        <span className="math-sym sym-8">λ</span>
        <span className="math-sym sym-9">Ω</span>
        <span className="math-sym sym-10">μ</span>

        {/* Complex Formulas */}
        <span className="math-formula form-1">e^(iπ) + 1 = 0</span>
        <span className="math-formula form-2">a² + b² = c²</span>
        <span className="math-formula form-3">lim (x→∞)</span>
        <span className="math-formula form-4">f'(x) = dy/dx</span>
        <span className="math-formula form-5">sin²θ + cos²θ = 1</span>
        <span className="math-formula form-6">E = mc²</span>
        <span className="math-formula form-7">∮ E·dA = Q/ε₀</span>
      </div>

      <div className="login-center-wrapper">
        <div className="login-box" ref={formRef}>
          <div className="login-brand-centered">
            <img src="./logo.jpg" alt="Logo" className="login-logo-img" />
            <h2>Đăng Nhập</h2>
            <p>Hệ thống quản lý học tập cá nhân hóa</p>
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Ví dụ: hocvien@gmail.com"
              />
            </div>
            <div className="input-group">
              <label>Mật Khẩu</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Nhập mật khẩu"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Vào Lớp Học
            </button>
          </form>
          
          <div className="login-footer-text">
            <span>Chưa có tài khoản? </span>
            <span className="login-link" onClick={() => navigate('/')}>
              Đăng ký ngay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
