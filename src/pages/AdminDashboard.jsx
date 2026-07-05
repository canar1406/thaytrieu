import React, { useState, useEffect } from 'react';
import './CouyenCommon.css'; // For glassmorphism styles
import './Dashboard.css'; // For sidebar layout

const API_BASE = 'http://localhost:3001/api';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('users'); // users, courses, publish
  const [errorMsg, setErrorMsg] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null); // When editing a course
  const [exams, setExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null); // When editing an exam

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        loadUsers();
        loadCourses();
        loadExams();
      } else {
        setErrorMsg(data.message || 'Lỗi đăng nhập');
      }
    } catch (error) {
      setErrorMsg('Không thể kết nối đến Local Server. Hãy chắc chắn bạn đã chạy file start-admin.bat');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (e) { console.error(e); }
  };

  const loadExams = async () => {
    try {
      const res = await fetch(`${API_BASE}/exams`);
      const data = await res.json();
      setExams(data);
    } catch (e) { console.error(e); }
  };

  const handleSaveUsers = async () => {
    try {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      });
      alert('Đã lưu danh sách học sinh!');
    } catch (e) { alert('Lỗi khi lưu!'); }
  };

  const handleAddUser = () => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { id: newId, email: '', password: '', name: '', role: 'student', courses: [] }]);
  };

  const handleSaveExams = async (updatedExams) => {
    try {
      await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExams)
      });
    } catch (e) { alert('Lỗi khi lưu đề thi!'); }
  };

  const handleAddExam = () => {
    const title = prompt("Nhập tên đề thi mới:");
    if (!title) return;
    let maxId = 0;
    exams.forEach(e => {
      const num = parseInt(e.id);
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const newId = String(maxId + 1);
    const newExam = {
      id: newId,
      title,
      fileUrl: ''
    };
    const updatedExams = [...exams, newExam];
    setExams(updatedExams);
    handleSaveExams(updatedExams);
  };

  const handleDeleteExam = (id) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    const updatedExams = exams.filter(e => e.id !== id);
    setExams(updatedExams);
    handleSaveExams(updatedExams);
  };

  const handleDeleteUser = (id) => {
    if (confirm('Xóa học sinh này?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleChangeUser = (id, field, value) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleAddCourse = async () => {
    const title = prompt("Nhập tên khóa học mới:");
    if (!title) return;
    const newId = courses.length > 0 ? Math.max(...courses.map(c => parseInt(c.id))) + 1 : 1;
    const newCourse = { id: String(newId), title, totalLessons: 0 };
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);

    // Save to course-list.json
    try {
      await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourses)
      });
      // Create empty course file
      await fetch(`${API_BASE}/courses/${newId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: String(newId), title, desc: "", sections: [] })
      });
      alert('Đã tạo khóa học mới!');
    } catch (e) {
      alert('Lỗi khi tạo khóa học!');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác!')) return;
    const updatedCourses = courses.filter(c => c.id !== id);
    setCourses(updatedCourses);

    try {
      // Update list
      await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourses)
      });
      // Delete file via API
      await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
      alert('Đã xóa khóa học!');
    } catch (e) {
      alert('Lỗi khi xóa!');
    }
  };

  const handlePublish = async () => {
    if (!confirm('Bạn có chắc muốn đồng bộ tất cả thay đổi (nháp) lên trang web thật không?')) return;
    try {
      const res = await fetch(`${API_BASE}/github-push`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Đã đồng bộ lên Web thành công! Vui lòng đợi 1-2 phút để trang web cập nhật.');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (e) { alert('Không thể kết nối đến máy chủ Local.'); }
  };

  if (!isAdmin) {
    return (
      <div className="couyen-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary-600)', marginBottom: '24px' }}>Admin Login</h2>
          {errorMsg && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Email Admin" className="input-field" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
            <input type="password" placeholder="Mật khẩu" className="input-field" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
            <button type="submit" className="btn-primary">Đăng Nhập</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="couyen-app">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">T</div>
            <div className="sidebar-logo-text">
              <span className="brand-name">Admin Tool</span>
              <span className="brand-sub">Quản trị nội dung</span>
            </div>
          </div>
          <div className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => {setActiveTab('users'); setCurrentCourse(null);}} style={{cursor: 'pointer'}}>
              Quản lý Học sinh
            </div>
            <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => {setActiveTab('courses'); setCurrentCourse(null); setCurrentExam(null);}} style={{cursor: 'pointer'}}>
              Quản lý Khóa học
            </div>
            <div className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => {setActiveTab('exams'); setCurrentCourse(null); setCurrentExam(null);}} style={{cursor: 'pointer'}}>
              Quản lý Đề thi
            </div>
            <div className={`nav-item ${activeTab === 'publish' ? 'active' : ''}`} onClick={() => {setActiveTab('publish'); setCurrentCourse(null);}} style={{cursor: 'pointer', marginTop: 'auto', background: 'var(--primary-50)', color: 'var(--primary-700)'}}>
              ☁️ Đồng bộ lên Web
            </div>
          </div>
        </aside>

        <main className="main-content" style={{ padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'users' && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>Quản lý Học sinh</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" onClick={handleAddUser}>+ Thêm học sinh</button>
                  <button className="btn-primary" onClick={handleSaveUsers}>Lưu thay đổi</button>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                      <th style={{ padding: '12px' }}>ID</th>
                      <th style={{ padding: '12px' }}>Tên</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Mật khẩu</th>
                      <th style={{ padding: '12px' }}>Quyền</th>
                      <th style={{ padding: '12px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '12px' }}>{u.id}</td>
                        <td style={{ padding: '12px' }}><input value={u.name} onChange={e => handleChangeUser(u.id, 'name', e.target.value)} className="input-field" style={{ padding: '8px' }}/></td>
                        <td style={{ padding: '12px' }}><input value={u.email} onChange={e => handleChangeUser(u.id, 'email', e.target.value)} className="input-field" style={{ padding: '8px' }}/></td>
                        <td style={{ padding: '12px' }}><input value={u.password} onChange={e => handleChangeUser(u.id, 'password', e.target.value)} className="input-field" style={{ padding: '8px' }}/></td>
                        <td style={{ padding: '12px' }}>
                          <select value={u.role} onChange={e => handleChangeUser(u.id, 'role', e.target.value)} className="input-field" style={{ padding: '8px' }}>
                            <option value="student">Học sinh</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && !currentCourse && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>Quản lý Khóa học</h2>
                <button className="btn-primary" onClick={handleAddCourse}>+ Tạo Khóa học mới</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ padding: '24px', border: '1px solid var(--gray-200)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0 }}>{course.title}</h3>
                    <p style={{ margin: 0, color: 'var(--gray-500)' }}>ID: {course.id} | Số bài: {course.totalLessons}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => {
                         fetch(`${API_BASE}/courses/${course.id}`)
                           .then(res => res.json())
                           .then(data => setCurrentCourse(data));
                      }}>Chỉnh sửa nội dung</button>
                      <button className="btn-secondary" style={{ color: 'red', padding: '8px' }} onClick={() => handleDeleteCourse(course.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'courses' && currentCourse && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <button onClick={() => setCurrentCourse(null)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', marginBottom: '8px' }}>← Quay lại danh sách</button>
                  <h2>Chỉnh sửa: {currentCourse.title}</h2>
                </div>
                <div>
                  <button className="btn-primary" onClick={async () => {
                    // Update currentCourse data
                    await fetch(`${API_BASE}/courses/${currentCourse.id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(currentCourse)
                    });
                    
                    // Recalculate total lessons
                    let totalLessons = 0;
                    currentCourse.sections.forEach(sec => {
                      totalLessons += sec.items.length;
                    });

                    // Update courses list
                    const updatedCourses = courses.map(c => 
                      c.id === currentCourse.id 
                        ? { ...c, title: currentCourse.title, totalLessons } 
                        : c
                    );
                    setCourses(updatedCourses);

                    await fetch(`${API_BASE}/courses`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updatedCourses)
                    });

                    alert('Lưu bản nháp thành công!');
                  }}>Lưu Nội Dung</button>
                </div>
              </div>

              {/* Course Info Edit */}
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input value={currentCourse.title} onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})} className="input-field" placeholder="Tên khóa học"/>
                <textarea value={currentCourse.desc} onChange={e => setCurrentCourse({...currentCourse, desc: e.target.value})} className="input-field" placeholder="Mô tả" rows={3}/>
              </div>

              <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', color: 'var(--primary-700)' }}>
                <strong>💡 Hướng dẫn nhập Link Video/Tài liệu</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li style={{ marginBottom: '6px' }}><strong>Youtube:</strong> Copy trực tiếp link video (ví dụ: <code>https://www.youtube.com/watch?v=...</code>) hoặc link rút gọn (<code>https://youtu.be/...</code>).</li>
                  <li><strong>Google Drive (Video/PDF):</strong> Tải file lên Drive, bật chia sẻ <strong>"Bất kỳ ai có đường liên kết"</strong>, sau đó copy link chia sẻ dán vào đây. Hệ thống sẽ tự động nhúng!</li>
                </ul>
              </div>

              {/* Sections Edit */}
              <div>
                {currentCourse.sections.map((sec, secIndex) => (
                  <div key={sec.id} style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <input value={sec.title} onChange={e => {
                        const newSecs = [...currentCourse.sections];
                        newSecs[secIndex].title = e.target.value;
                        setCurrentCourse({...currentCourse, sections: newSecs});
                      }} className="input-field" style={{ flex: 1, fontWeight: 'bold' }} placeholder="Tên Chương"/>
                    </div>
                    
                    {/* Items */}
                    <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {sec.items.map((item, itemIndex) => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--gray-50)', padding: '12px', borderRadius: '8px' }}>
                          <select value={item.type} onChange={e => {
                            const newSecs = [...currentCourse.sections];
                            newSecs[secIndex].items[itemIndex].type = e.target.value;
                            setCurrentCourse({...currentCourse, sections: newSecs});
                          }} className="input-field" style={{ width: '100px', padding: '8px' }}>
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                          </select>
                          <input value={item.title} onChange={e => {
                            const newSecs = [...currentCourse.sections];
                            newSecs[secIndex].items[itemIndex].title = e.target.value;
                            setCurrentCourse({...currentCourse, sections: newSecs});
                          }} className="input-field" style={{ flex: 1, padding: '8px' }} placeholder="Tên bài học"/>
                          <input value={item.url} onChange={e => {
                            const newSecs = [...currentCourse.sections];
                            newSecs[secIndex].items[itemIndex].url = e.target.value;
                            setCurrentCourse({...currentCourse, sections: newSecs});
                          }} className="input-field" style={{ flex: 2, padding: '8px' }} placeholder="Link Nhúng (Embed URL)"/>
                          <button onClick={() => {
                            if(confirm('Xóa bài này?')) {
                              const newSecs = [...currentCourse.sections];
                              newSecs[secIndex].items.splice(itemIndex, 1);
                              setCurrentCourse({...currentCourse, sections: newSecs});
                            }
                          }} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>Xóa</button>
                        </div>
                      ))}
                      <button className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '14px' }} onClick={() => {
                        const newSecs = [...currentCourse.sections];
                        newSecs[secIndex].items.push({ id: `item-${Date.now()}`, title: 'Bài học mới', type: 'video', url: '' });
                        setCurrentCourse({...currentCourse, sections: newSecs});
                      }}>+ Thêm bài học</button>
                    </div>
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => {
                  setCurrentCourse({
                    ...currentCourse,
                    sections: [...currentCourse.sections, { id: `sec-${Date.now()}`, title: 'Chương mới', items: [] }]
                  });
                }}>+ Thêm Chương mới</button>
              </div>
            </div>
          )}

          {activeTab === 'publish' && (
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h1 style={{ color: 'var(--primary-600)', marginBottom: '16px' }}>Đồng bộ Dữ liệu</h1>
              <p style={{ color: 'var(--gray-600)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px auto' }}>
                Tất cả các thay đổi về khóa học, bài giảng và tài khoản bạn vừa thực hiện đều là bản nháp và chỉ đang lưu trên máy tính này.
                <br/><br/>
                Bấm vào nút bên dưới để Đẩy (Push) toàn bộ dữ liệu mới nhất lên trang web trực tuyến (GitHub Pages). Trang web sẽ tự cập nhật sau khoảng 1 đến 2 phút.
              </p>
              <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }} onClick={handlePublish}>🚀 ĐỒNG BỘ LÊN WEB (PUBLISH)</button>
            </div>
          )}

          {activeTab === 'exams' && !currentExam && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>Quản lý Đề thi</h2>
                <button className="btn-primary" onClick={handleAddExam}>+ Tạo Đề thi mới</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {exams.map(exam => (
                  <div key={exam.id} style={{ padding: '24px', border: '1px solid var(--gray-200)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0 }}>{exam.title}</h3>
                    <p style={{ margin: 0, color: 'var(--gray-500)', wordBreak: 'break-all' }}>Đường dẫn file: {exam.fileUrl || (exam.data ? 'JSON Format (Cũ)' : 'Chưa có')}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setCurrentExam(exam)}>Chỉnh sửa</button>
                      <button className="btn-secondary" style={{ color: 'red', padding: '8px' }} onClick={() => handleDeleteExam(exam.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exams' && currentExam && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <button onClick={() => setCurrentExam(null)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', marginBottom: '8px' }}>← Quay lại danh sách</button>
                  <h2>Chỉnh sửa: {currentExam.title}</h2>
                </div>
                <div>
                  <button className="btn-primary" onClick={async () => {
                    const newExams = exams.map(e => e.id === currentExam.id ? currentExam : e);
                    setExams(newExams);
                    await handleSaveExams(newExams);
                    alert('Lưu đề thi thành công!');
                  }}>Lưu Đề thi</button>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                <strong>💡 Hướng dẫn lưu file Đề thi</strong>
                <p style={{ margin: '8px 0 0 0' }}>
                  Thầy có thể soạn đề thi bằng Markdown (.md) hoặc JSON. Hãy tạo file đề thi và lưu vào thư mục <code>public/data/exams/</code>. <br/>
                  Sau đó, nhập đường dẫn vào ô bên dưới (ví dụ: <code>/data/exams/de-thi-1.md</code> hoặc <code>/data/exams/de-kiem-tra-toan.json</code>).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Tên đề thi:</label>
                  <input value={currentExam.title} onChange={e => setCurrentExam({...currentExam, title: e.target.value})} className="input-field" placeholder="Tên đề thi" />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Đường dẫn file (Markdown hoặc JSON):</label>
                  <input value={currentExam.fileUrl || ''} onChange={e => setCurrentExam({...currentExam, fileUrl: e.target.value})} className="input-field" placeholder="Ví dụ: /data/exams/de-thi-1.md" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
