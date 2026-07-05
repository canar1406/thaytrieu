import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './CouyenCommon.css'; // Import the isolated CSS variables
import './Dashboard.css';
import ExamPractice from '../components/ExamPractice';

ChartJS.register(ArcElement, Tooltip);

const TARGET_DATE = new Date(2027, 5, 25); // June 25, 2027

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'practice'
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Countdown Timer Logic
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/data/courses/course-list.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error loading courses:", err));
  }, []);

  const chartData = {
    labels: ['Hoàn thành', 'Chưa học'],
    datasets: [
      {
        data: [15, 25],
        backgroundColor: ['#2451d1', '#f3f4f6'],
        borderWidth: 0,
        cutout: '75%',
        borderRadius: 20
      },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null; // Or a loading spinner

  return (
    <div className="couyen-app">
      <div className="app-layout">
        
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">T</div>
            <div className="sidebar-logo-text">
              <span className="brand-name">Thầy Triều</span>
              <span className="brand-sub">Học Toán Online</span>
            </div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-section-title">Học tập</div>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span>Tổng quan</span>
            </div>
            <div className="nav-item-dropdown">
              <div className="nav-item" onClick={() => setShowCourseMenu(!showCourseMenu)} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  <span>Khóa học</span>
                </div>
                <svg style={{ transform: showCourseMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              {showCourseMenu && (
                <div className="nav-sublist">
                  {courses.map(course => (
                    <Link key={course.id} to={`/course/${course.id}`} className="nav-subitem">
                      {course.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className={`nav-item ${activeTab === 'practice' ? 'active' : ''}`} onClick={() => setActiveTab('practice')} style={{ cursor: 'pointer' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Luyện đề</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="user-card" onClick={handleLogout}>
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">Học sinh</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Wrapper acts like .navbar on Landing Page (gives padding above/below the pill) */}
          {activeTab !== 'practice' && (
            <div className="topbar-wrapper">
              <header className="topbar">
              <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="Toán Thầy Triều" className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(59,110,244,0.15)' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Toán Thầy Triều</span>
              </div>
              
              <div className="nav-links" style={{ display: 'flex', gap: '0.5rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                <span className="nav-link-item" style={{ fontSize: '0.9rem', fontWeight: 500, padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--primary-600)', background: 'rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 10px rgba(80,100,200,0.12)' }}>Tổng quan học tập</span>
              </div>

              <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn-register-course" onClick={() => { navigate('/'); setTimeout(() => { document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }); }, 300); }} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: 'var(--radius-full)', padding: '8px 18px', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,1)' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Đăng ký khoá học mới
                </button>
              </div>
            </header>
          </div>
          )}

          {activeTab === 'practice' ? (
            <ExamPractice onBackToDashboard={() => setActiveTab('overview')} />
          ) : (
          <div className="dashboard-content">
            <div className="page-header">
              <h1 className="page-greeting">Chào buổi sáng, {user.name.split(' ')[user.name.split(' ').length - 1]}! 👋</h1>
              <div className="page-subtitle">Cùng tiếp tục hành trình chinh phục kỳ thi THPT QG môn Toán nhé.</div>
            </div>

            <div className="dashboard-grid">
              
              {/* Countdown Banner */}
              <div className="countdown-banner">
                <div className="countdown-left">
                  <div className="countdown-event-tag">
                    <span className="countdown-dot"></span>
                    Sự kiện sắp tới
                  </div>
                  <h2 className="countdown-title">Kỳ thi THPT Quốc Gia</h2>
                  <div className="countdown-subtitle">Môn Toán - Hãy chuẩn bị thật kỹ!</div>
                </div>
                
                <div className="countdown-timer">
                  <div className="time-unit">
                    <div className="time-box">
                      <div className="time-number">{timeLeft.days}</div>
                    </div>
                    <div className="time-label">Ngày</div>
                  </div>
                  <div className="countdown-sep">:</div>
                  <div className="time-unit">
                    <div className="time-box">
                      <div className="time-number">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="time-label">Giờ</div>
                  </div>
                  <div className="countdown-sep">:</div>
                  <div className="time-unit">
                    <div className="time-box">
                      <div className="time-number">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="time-label">Phút</div>
                  </div>
                  <div className="countdown-sep">:</div>
                  <div className="time-unit">
                    <div className="time-box">
                      <div className="time-number">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="time-label">Giây</div>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="courses-section">
                <div className="section-header-row">
                  <h3 className="section-heading">Khóa học của tôi</h3>
                  <button className="btn btn-ghost btn-sm">Xem tất cả</button>
                </div>
                <div className="courses-scroll">
                  {courses.map(course => {
                    const totalLessons = course.totalLessons || 0;
                    const durationHours = Math.round(totalLessons * 1.5);
                    const progress = 0; // Tương lai sẽ lấy từ progress thực tế
                    
                    return (
                    <div className="course-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
                      <div className="course-thumbnail">
                        <span className="course-thumb-icon">📐</span>
                        {progress === 100 ? (
                          <span className="course-status-badge status-complete">Hoàn thành</span>
                        ) : (
                          <span className="course-status-badge status-active">Đang học</span>
                        )}
                      </div>
                      <div className="course-card-body">
                        <h4 className="course-card-title">{course.title}</h4>
                        <div className="course-card-meta">
                          <span>{totalLessons} bài</span>
                          <span>•</span>
                          <span>{durationHours} giờ</span>
                        </div>
                        
                        <div className="course-card-progress">
                          <div className="course-card-progress-text">
                            <span>Tiến độ</span>
                            <strong>{progress}%</strong>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>

                        <div className="course-card-footer">
                          <div className="teacher-tag">
                            <div className="teacher-tag-avatar">T</div>
                            <span>Thầy Triều</span>
                          </div>
                          <button className="btn btn-outline btn-sm">Vào học</button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (Widgets) */}
              <div className="right-column">
                
                {/* Weekly Calendar Widget */}
                <div className="card week-calendar">
                  <div className="card-header">
                    <h3 className="card-title">Lịch học tuần này</h3>
                  </div>
                  <div className="card-body">
                    <div className="week-days">
                      <div className="week-day">
                        <div className="week-day-label">T2</div>
                        <div className="week-day-num">15</div>
                      </div>
                      <div className="week-day has-class">
                        <div className="week-day-label">T3</div>
                        <div className="week-day-num">16</div>
                        <div className="week-day-dot"></div>
                      </div>
                      <div className="week-day">
                        <div className="week-day-label">T4</div>
                        <div className="week-day-num">17</div>
                      </div>
                      <div className="week-day today has-class">
                        <div className="week-day-label">T5</div>
                        <div className="week-day-num">18</div>
                        <div className="week-day-dot"></div>
                      </div>
                      <div className="week-day">
                        <div className="week-day-label">T6</div>
                        <div className="week-day-num">19</div>
                      </div>
                      <div className="week-day has-class">
                        <div className="week-day-label">T7</div>
                        <div className="week-day-num">20</div>
                        <div className="week-day-dot"></div>
                      </div>
                      <div className="week-day">
                        <div className="week-day-label">CN</div>
                        <div className="week-day-num">21</div>
                      </div>
                    </div>

                    <div className="upcoming-lessons">
                      <div className="upcoming-item">
                        <div className="upcoming-time">19:30</div>
                        <div className="upcoming-info">
                          <div className="upcoming-title">Đại số & Giải tích Nâng cao</div>
                          <div className="upcoming-date">Hôm nay • Livestream</div>
                        </div>
                      </div>
                      <div className="upcoming-item">
                        <div className="upcoming-time">20:00</div>
                        <div className="upcoming-info">
                          <div className="upcoming-title">Luyện đề số 5</div>
                          <div className="upcoming-date">Thứ 7, 20/07</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Progress Widget */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Tiến độ tổng quan</h3>
                  </div>
                  <div className="card-body progress-chart">
                    <div className="chart-container">
                      <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                      <div className="chart-center-text">
                        <div className="chart-percent">37%</div>
                        <div className="chart-label">Tổng bài học</div>
                      </div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-row">
                        <div className="legend-dot-label">
                          <div className="legend-dot" style={{ background: '#2451d1' }}></div>
                          <span>Hoàn thành</span>
                        </div>
                        <div className="legend-val">15 bài</div>
                      </div>
                      <div className="legend-row">
                        <div className="legend-dot-label">
                          <div className="legend-dot" style={{ background: '#f3f4f6' }}></div>
                          <span>Chưa học</span>
                        </div>
                        <div className="legend-val">25 bài</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
