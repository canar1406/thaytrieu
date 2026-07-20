import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './CouyenCommon.css'; // Isolated design system
import './CoursePage.css';
import { apiFetch, getToken } from '../api';


const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dummyCourseData, setDummyCourseData] = useState(null);
  const [registeredCoursesList, setRegisteredCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    setIsLoading(true);
    if (!user || !getToken()) { navigate('/login'); return; }
    Promise.all([
      apiFetch(`/courses/${id || '1'}`).then(r => { if (!r.ok) throw new Error('forbidden'); return r.json(); }),
      apiFetch('/courses').then(r => r.json())
    ])
    .then(([courseData, courseList]) => {
      setDummyCourseData(courseData);
      setRegisteredCoursesList(courseList);
      setIsLoading(false);
      navigate('/dashboard', { replace: true });
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id, navigate, user]);
  
  const [expandedSections, setExpandedSections] = useState({ 
    'c9-sec1': true, 'c9-sec2': true,
    'ch9-sec1': true, 'ch9-sec2': true,
    'c10-sec1': true, 'c10-sec2': true,
    'c11-sec1': true, 'c11-sec2': true,
    'c12-sec1': true, 'c12-sec2': true,
    'sec1': true, 'sec2': true 
  });
  const [completedItems, setCompletedItems] = useState(new Set());
  const [currentItem, setCurrentItem] = useState(null);
  const [historyStack, setHistoryStack] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Timer for study requirement (1 minute for interactive study/testing)
  const [studyTime, setStudyTime] = useState(0); 
  const STUDY_REQUIRED_SECONDS = 60; // 60 seconds

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setCurrentItem(null);
    setHistoryStack([null]);
    setHistoryIndex(0);
    // Load completed items from local storage
    const saved = localStorage.getItem(`completed_${id}`);
    if (saved) {
      setCompletedItems(new Set(JSON.parse(saved)));
    } else {
      setCompletedItems(new Set());
    }
  }, [id]);

  // Timer Effect
  useEffect(() => {
    let timer = null;
    if (currentItem && !completedItems.has(currentItem.id)) {
      timer = setInterval(() => {
        setStudyTime(prev => {
          const nextTime = prev + 1;
          if (nextTime >= STUDY_REQUIRED_SECONDS) {
            // Mark as completed
            setCompletedItems(prevSet => {
              const newSet = new Set(prevSet);
              newSet.add(currentItem.id);
              localStorage.setItem(`completed_${id}`, JSON.stringify([...newSet]));
              return newSet;
            });
            clearInterval(timer);
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentItem, completedItems, id]);

  const handleToggleSection = (secId) => {
    setExpandedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleSelectItem = (item) => {
    setCurrentItem(item);
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(item);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setStudyTime(0); // Reset timer when switching items
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setCurrentItem(historyStack[nextIndex]);
      setStudyTime(0);
    } else if (currentItem !== null) {
      setCurrentItem(null);
      setStudyTime(0);
    } else {
      navigate(-1);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentItem(historyStack[nextIndex]);
      setStudyTime(0);
    } else {
      navigate(1);
    }
  };

  if (isLoading) {
    return (
      <div className="couyen-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ padding: '24px 40px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: 'var(--primary-600)', margin: 0 }}>Đang tải dữ liệu khóa học...</h3>
        </div>
      </div>
    );
  }

  if (!dummyCourseData) {
    return (
      <div className="couyen-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ padding: '24px 40px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: 'var(--danger-500)', margin: 0 }}>Không tìm thấy khóa học!</h3>
          <button className="btn-primary mt-3" onClick={() => navigate('/dashboard')}>Quay lại Dashboard</button>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const allItems = dummyCourseData.sections.flatMap(sec => sec.items);
  const totalItems = allItems.length;
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const getEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
    }
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/').split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
    }
    return url;
  };

  const getDynamicProgress = (courseId, staticProgress, totalLessons) => {
    if (courseId === (id || '1')) return progressPercent;
    if (!totalLessons) return staticProgress;
    const saved = localStorage.getItem(`completed_${courseId}`);
    if (!saved) return staticProgress;
    const compSet = new Set(JSON.parse(saved));
    return Math.round((compSet.size / totalLessons) * 100);
  };

  const dynamicCoursesList = registeredCoursesList
    .filter(course => user && (user.role === 'admin' || (user.allowedCourses || []).map(String).includes(String(course.id))))
    .map(course => ({
      ...course,
      progress: getDynamicProgress(course.id, course.progress, course.totalLessons)
    }));

  const currentIndex = currentItem ? allItems.findIndex(i => i.id === currentItem.id) : -1;
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  return (
    <div className="couyen-app">
      <div className="app-layout">
        
        {/* Main Content (Full screen layout without global sidebar) */}
        <main className="main-content" style={{ marginLeft: 0 }}>

          <div className="course-layout">

            {/* Sidebar TOC */}
            <div className={`course-sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <div className="course-sidebar-header">
                <h2 className="course-sidebar-title">Mục lục khóa học</h2>
                <div className="course-overall-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              <div className="course-sidebar-content">
                
                {/* Danh sách các khóa học đã đăng ký */}
                <div className="sidebar-registered-courses" style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Khóa học đã đăng ký</span>
                    <span style={{ background: 'rgba(0,102,204,0.12)', color: '#0066CC', padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700 }}>{dynamicCoursesList.length} khóa</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dynamicCoursesList.map(rc => {
                      const isCurrent = rc.id === (id || '1');
                      return (
                        <Link
                          key={rc.id}
                          to={`/course/${rc.id}`}
                          onClick={() => setIsSidebarOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            background: isCurrent ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.35)',
                            color: isCurrent ? '#0066CC' : '#2C2C2E',
                            fontWeight: isCurrent ? 700 : 500,
                            fontSize: '0.84rem',
                            border: isCurrent ? '1px solid rgba(0, 102, 204, 0.35)' : '1px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: isCurrent ? '0 4px 12px rgba(0,102,204,0.1), inset 0 1px 1px rgba(255,255,255,1)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isCurrent ? '#0066CC' : '#34c759', flexShrink: 0, boxShadow: isCurrent ? '0 0 8px #0066CC' : 'none' }}></span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rc.title}</span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: isCurrent ? '#0066CC' : '#8E8E93', fontWeight: 700, background: isCurrent ? 'rgba(0,102,204,0.1)' : 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: '6px' }}>{rc.progress}%</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '8px 14px 4px', fontSize: '0.72rem', fontWeight: 700, color: '#636366', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nội dung bài học
                </div>

                {dummyCourseData.sections.map((section, idx) => {
                  const isOpen = expandedSections[section.id] !== false;
                  return (
                  <div key={section.id} className={`toc-section ${isOpen ? 'open' : ''}`}>
                    <div className="toc-section-header" onClick={() => handleToggleSection(section.id)}>
                      <div className="toc-section-info">
                        <div className="toc-section-title">Chương {idx + 1}: {section.title}</div>
                        <div className="toc-section-meta">{section.items.length} bài học • {section.duration}</div>
                      </div>
                      <div className="toc-section-toggle">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    {isOpen && (
                    <div className="toc-list">
                      {section.items.map(item => {
                        const isActive = currentItem?.id === item.id;
                        const isCompleted = completedItems.has(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`toc-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className={`toc-item-icon ${isCompleted ? 'completed' : ''}`}>
                              {isCompleted ? (
                                <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                              ) : item.type === 'video' ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                              )}
                            </div>
                            <div className="toc-item-content">
                              <div className="toc-item-title">{item.title}</div>
                              <div className="toc-item-duration">{item.duration}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Overlay */}
            <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            {/* Main Area — topbar lives here so it only spans this column */}
            <div className="course-main">

              {/* Topbar — same style as Dashboard */}
              <div className="topbar-wrapper">
                <header className="topbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={handleGoBack} className="topbar-nav-btn" title="Quay lại page trước" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', color: '#636366', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18, strokeWidth: 2.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <button onClick={handleGoForward} className="topbar-nav-btn" title="Tiến tới page tiếp theo" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', color: '#636366', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18, strokeWidth: 2.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#2C2C2E', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{dummyCourseData.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '8px 14px', color: '#636366', fontWeight: 600, fontSize: '0.85rem', display: 'none', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} className="mobile-toc-toggle">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16, strokeWidth: 2.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                      Bài học
                    </button>
                  </div>
                </header>
              </div>

              <div className="course-main-header">
                <div>
                  <h1 className="main-lesson-title">
                    {currentItem ? currentItem.title : `Chào mừng đến với khóa học của ${dummyCourseData.teacher || 'Thầy Triều'}`}
                  </h1>
                  {currentItem ? (
                    <div className="main-lesson-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {completedItems.has(currentItem.id) ? (
                        <span style={{ color: '#34c759', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 199, 89, 0.12)', padding: '5px 12px', borderRadius: '20px' }}>
                          ✓ Đã hoàn thành bài học
                        </span>
                      ) : (
                        <>
                          <span style={{ color: '#0066CC', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 102, 204, 0.1)', padding: '5px 12px', borderRadius: '20px' }}>
                            ⏱ Thời gian học: {Math.floor(studyTime / 60)}:{((studyTime % 60) < 10 ? '0' : '') + (studyTime % 60)} / 01:00
                          </span>
                          <button
                            onClick={() => {
                              setCompletedItems(prevSet => {
                                const newSet = new Set(prevSet);
                                newSet.add(currentItem.id);
                                localStorage.setItem(`completed_${id || '1'}`, JSON.stringify([...newSet]));
                                return newSet;
                              });
                            }}
                            style={{ background: '#34c759', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(52,199,89,0.3)', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            ✓ Hoàn thành ngay
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="course-viewport">
                {!currentItem ? (
                  <>
                    <div className="course-hero">
                      <div className="course-cover-banner" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0, 102, 204, 0.15), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(255, 255, 255, 0.8)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
                        <img src="./1783264418835_6184149828822151336_6184149828822151336_3208d6bfda3f1da2241a23a53a628ada.jpg" alt="Course Cover" style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.4s ease' }} />
                      </div>
                    </div>
                    
                    <div className="course-home-content">
                      <div className="course-home-header">
                        <h2 className="course-home-title">Danh sách bài học</h2>
                        <span className="course-home-badge">{totalItems} bài học</span>
                      </div>
                      
                      <div className="course-home-sections">
                        {dummyCourseData.sections.map((section, idx) => {
                          const isOpen = expandedSections[section.id] !== false;
                          return (
                          <div key={section.id} className={`ch-section ${isOpen ? 'open' : ''}`}>
                            <div className="ch-section-header" onClick={() => handleToggleSection(section.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
                              <span>Tuần {idx + 1} – {section.title}</span>
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16, strokeWidth: 2.5, color: '#636366', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                            {isOpen && (
                            <div className="ch-list">
                              {section.items.map(item => {
                                const isCompleted = completedItems.has(item.id);
                                return (
                                  <div key={item.id} className="ch-item" onClick={() => handleSelectItem(item)}>
                                    <div className={`ch-item-icon ${isCompleted ? 'completed' : 'pending'}`}>
                                      {isCompleted ? (
                                        <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                      ) : item.type === 'video' ? (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                      ) : (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                      )}
                                    </div>
                                    <div className="ch-item-info">
                                      <div className="ch-item-title">[{item.type === 'video' ? 'Video' : 'Tài liệu'}] {item.title}</div>
                                      <div className="ch-item-meta">{item.duration}</div>
                                    </div>
                                    <div className="ch-item-action">
                                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`video-container ${currentItem.type === 'video' ? 'active' : ''}`}>
                      {currentItem.type === 'video' && (
                        <iframe src={getEmbedUrl(currentItem.url)} title="Video Player" allowFullScreen></iframe>
                      )}
                    </div>
                    <div className={`pdf-container ${currentItem.type === 'pdf' ? 'active' : ''}`}>
                      {currentItem.type === 'pdf' && (
                        <iframe src={getEmbedUrl(currentItem.url)} title="PDF Viewer"></iframe>
                      )}
                    </div>

                    {/* Prev / Next Navigation */}
                    <div className="lesson-nav-bar">
                      <button
                        className="lesson-nav-btn"
                        disabled={!prevItem}
                        onClick={() => prevItem && handleSelectItem(prevItem)}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:16,height:16,strokeWidth:2.5}}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                        <span>{prevItem ? prevItem.title : 'Đầu khóa học'}</span>
                      </button>

                      <div className="lesson-nav-progress">
                        <span>{currentIndex + 1} / {totalItems}</span>
                      </div>

                      <button
                        className="lesson-nav-btn lesson-nav-btn--next"
                        disabled={!nextItem}
                        onClick={() => nextItem && handleSelectItem(nextItem)}
                      >
                        <span>{nextItem ? nextItem.title : 'Cuối khóa học'}</span>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:16,height:16,strokeWidth:2.5}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePage;
