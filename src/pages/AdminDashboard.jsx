import React, { useState, useEffect } from 'react';
import './CouyenCommon.css'; // For glassmorphism styles
import './Dashboard.css'; // For sidebar layout
import './AdminDashboard.css';
import { apiFetch } from '../api';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('users'); // users, courses, publish
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [isSavingUsers, setIsSavingUsers] = useState(false);
  const [notice, setNotice] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null); // When editing a course
  const [exams, setExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null); // When editing an exam

  useEffect(() => {
    apiFetch('/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user?.role === 'admin') {
        setIsAdmin(true); loadUsers(); loadCourses(); loadExams();
      }
    });
  }, []);

  useEffect(() => {
    if (users.length > 0 && !users.some(user => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success && data.user?.role === 'admin') {
        sessionStorage.setItem('authToken', data.token);
        setIsAdmin(true);
        loadUsers();
        loadCourses();
        loadExams();
      } else {
        setErrorMsg(data.message || 'Lỗi đăng nhập');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến Local Server. Hãy chắc chắn bạn đã chạy file start-admin.bat');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await apiFetch(`/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const loadCourses = async () => {
    try {
      const res = await apiFetch(`/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (e) { console.error(e); }
  };

  const loadExams = async () => {
    try {
      const res = await apiFetch(`/exams`);
      const data = await res.json();
      setExams(data);
    } catch (e) { console.error(e); }
  };

  const handleSaveUsers = async () => {
    setIsSavingUsers(true);
    setNotice('');
    try {
      const response = await apiFetch(`/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lưu học viên');
      await loadUsers();
      setNotice('Đã lưu thay đổi học viên thành công.');
    } catch (e) {
      setNotice(`Không thể lưu: ${e.message}`);
    } finally {
      setIsSavingUsers(false);
    }
  };

  const handleAddUser = () => {
    const newId = `new-${crypto.randomUUID()}`;
    setUsers([...users, { id: newId, email: '', password: '', name: '', role: 'student', allowedCourses: [] }]);
    setSelectedUserId(newId);
  };

  const handleSaveExams = async (updatedExams) => {
    try {
      const response = await apiFetch(`/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExams)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lưu đề thi');
      return true;
    } catch (e) { alert(`Lỗi khi lưu đề thi: ${e.message}`); return false; }
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

  const handleDeleteExam = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    const response = await apiFetch(`/exams/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) return alert('Không thể xóa đề thi.');
    setExams(exams.filter(e => e.id !== id));
  };

  const handleExamFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('File đề thi phải nhỏ hơn 2 MB.');
    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        setCurrentExam(current => ({ ...current, data: parsed.data || parsed, markdownContent: '', fileName: file.name, fileUrl: '' }));
      } else if (file.name.toLowerCase().endsWith('.md')) {
        setCurrentExam(current => ({ ...current, markdownContent: text, data: undefined, fileName: file.name, fileUrl: '' }));
      } else {
        alert('Chỉ hỗ trợ file .json hoặc .md.');
      }
    } catch {
      alert('Không đọc được file. Nếu là JSON, hãy kiểm tra lại định dạng file.');
    }
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
      await apiFetch(`/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourses)
      });
      // Create empty course file
      await apiFetch(`/courses/${newId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: String(newId), title, desc: "", sections: [] })
      });
      alert('Đã tạo khóa học mới!');
    } catch {
      alert('Lỗi khi tạo khóa học!');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác!')) return;
    const updatedCourses = courses.filter(c => c.id !== id);
    setCourses(updatedCourses);

    try {
      // Update list
      await apiFetch(`/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourses)
      });
      // Delete file via API
      await apiFetch(`/courses/${id}`, { method: 'DELETE' });
      alert('Đã xóa khóa học!');
    } catch {
      alert('Lỗi khi xóa!');
    }
  };

  const filteredUsers = users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(userSearch.trim().toLowerCase()));
  const selectedUser = users.find(user => user.id === selectedUserId);
  const tabInfo = {
    users: ['Học viên', 'Quản lý tài khoản và phân quyền khóa học'],
    courses: ['Khóa học', 'Tổ chức chương và nội dung bài giảng'],
    exams: ['Đề thi', 'Quản lý ngân hàng đề và nội dung kiểm tra']
  }[activeTab];

  if (!isAdmin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <div className="admin-login-mark" aria-hidden="true">T</div>
          <p className="admin-eyebrow">TRUNG TÂM QUẢN TRỊ</p>
          <h1 id="admin-login-title">Đăng nhập quản trị</h1>
          <p className="admin-login-copy">Sử dụng tài khoản Admin đã tạo trên hệ thống.</p>
          {errorMsg && <p className="admin-form-error" role="alert">{errorMsg}</p>}
          <form onSubmit={handleLogin} className="admin-login-form">
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" spellCheck={false} placeholder="admin@example.com…" className="input-field" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
            <label htmlFor="admin-password">Mật khẩu</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu…" className="input-field" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
            <button type="submit" className="btn-primary">Đăng nhập</button>
          </form>
        </section>
      </main>
    );
  }

  const switchTab = tab => {
    setActiveTab(tab);
    setCurrentCourse(null);
    setCurrentExam(null);
    setNotice('');
  };

  return (
    <div className="admin-app">
      <a className="admin-skip-link" href="#admin-main">Bỏ qua điều hướng</a>
      <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true">T</div>
          <div><strong>Thầy Triều</strong><span>Admin Center</span></div>
        </div>
        <nav className="admin-nav">
          <p className="admin-nav-label">QUẢN LÝ</p>
          <button className={activeTab === 'users' ? 'active' : ''} aria-current={activeTab === 'users' ? 'page' : undefined} onClick={() => switchTab('users')}><span aria-hidden="true">👥</span><span>Học viên</span><b>{users.length}</b></button>
          <button className={activeTab === 'courses' ? 'active' : ''} aria-current={activeTab === 'courses' ? 'page' : undefined} onClick={() => switchTab('courses')}><span aria-hidden="true">📚</span><span>Khóa học</span><b>{courses.length}</b></button>
          <button className={activeTab === 'exams' ? 'active' : ''} aria-current={activeTab === 'exams' ? 'page' : undefined} onClick={() => switchTab('exams')}><span aria-hidden="true">📝</span><span>Đề thi</span><b>{exams.length}</b></button>
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-system-status"><i aria-hidden="true" /><span><strong>Supabase</strong><small>Đã kết nối an toàn</small></span></div>
          <button className="admin-logout" onClick={async () => { await apiFetch('/logout', { method: 'POST' }); setIsAdmin(false); }}><span aria-hidden="true">↪</span>Đăng xuất</button>
        </div>
      </aside>

      <main id="admin-main" className="admin-main">
        <div className="admin-content">
          <header className="admin-topbar">
            <div><p className="admin-eyebrow">TRUNG TÂM QUẢN TRỊ</p><h1>{tabInfo[0]}</h1><p>{tabInfo[1]}</p></div>
            <div className="admin-topbar-profile"><span>PT</span><div><strong>Thầy Triều</strong><small>Quản trị viên</small></div></div>
          </header>

          <section className="admin-overview" aria-label="Tổng quan hệ thống">
            <article><span className="blue" aria-hidden="true">👥</span><div><strong>{users.length}</strong><small>Học viên</small></div></article>
            <article><span className="violet" aria-hidden="true">📚</span><div><strong>{courses.length}</strong><small>Khóa học</small></div></article>
            <article><span className="amber" aria-hidden="true">📝</span><div><strong>{exams.length}</strong><small>Đề thi</small></div></article>
            <article className="admin-overview-wide"><span className="green" aria-hidden="true">✓</span><div><strong>Dữ liệu trực tuyến</strong><small>Đăng nhập và phân quyền qua Supabase</small></div></article>
          </section>

          {activeTab === 'users' && (
            <section className="admin-panel" aria-labelledby="users-heading">
              <div className="admin-panel-header">
                <div><h2 id="users-heading">Danh sách học viên</h2><p>Chọn một học viên để chỉnh thông tin và khóa học được phép xem.</p></div>
                <div className="admin-actions"><button className="btn-secondary" onClick={handleAddUser}>+ Thêm học viên</button><button className="btn-primary" disabled={isSavingUsers} onClick={handleSaveUsers}>{isSavingUsers ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
              </div>
              {notice && <p className="admin-notice" role="status" aria-live="polite">{notice}</p>}
              <div className="admin-users-workspace">
                <section className="admin-user-directory" aria-label="Danh sách tài khoản">
                  <label className="admin-search"><span aria-hidden="true">⌕</span><span className="sr-only">Tìm học viên</span><input name="user-search" type="search" autoComplete="off" placeholder="Tìm tên hoặc email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} /></label>
                  <div className="admin-user-directory-list">
                    {filteredUsers.map(user => <button key={user.id} className={selectedUserId === user.id ? 'active' : ''} onClick={() => setSelectedUserId(user.id)}><span className="admin-user-avatar" aria-hidden="true">{(user.name || '?').charAt(0).toUpperCase()}</span><span><strong>{user.name || 'Học viên mới'}</strong><small>{user.email || 'Chưa có email'}</small></span><em>{user.role === 'admin' ? 'Admin' : `${(user.allowedCourses || []).length} khóa`}</em></button>)}
                    {filteredUsers.length === 0 && <div className="admin-empty-small">Không tìm thấy học viên phù hợp.</div>}
                  </div>
                </section>

                {selectedUser ? <section className="admin-user-editor" aria-labelledby="user-editor-heading">
                  <div className="admin-user-editor-head"><div><p className="admin-eyebrow">HỒ SƠ TÀI KHOẢN</p><h3 id="user-editor-heading">{selectedUser.name || 'Học viên mới'}</h3></div><button className="admin-delete-btn" onClick={() => handleDeleteUser(selectedUser.id)}>Xóa tài khoản</button></div>
                  <div className="admin-form-grid">
                    <label><span>Họ và tên</span><input name="student-name" autoComplete="off" value={selectedUser.name} onChange={e => handleChangeUser(selectedUser.id, 'name', e.target.value)} className="input-field" placeholder="Nhập họ và tên…" /></label>
                    <label><span>Email đăng nhập</span><input name="student-email" type="email" autoComplete="off" spellCheck={false} value={selectedUser.email} onChange={e => handleChangeUser(selectedUser.id, 'email', e.target.value)} className="input-field" placeholder="hocvien@example.com…" /></label>
                    <label><span>Mật khẩu mới</span><input name="student-new-password" type="password" autoComplete="new-password" value={selectedUser.password || ''} placeholder="Để trống nếu không đổi…" onChange={e => handleChangeUser(selectedUser.id, 'password', e.target.value)} className="input-field" /></label>
                    <label><span>Loại tài khoản</span><select name="student-role" value={selectedUser.role} onChange={e => handleChangeUser(selectedUser.id, 'role', e.target.value)} className="input-field"><option value="student">Học sinh</option><option value="admin">Quản trị viên</option></select></label>
                  </div>
                  <div className="admin-course-access">
                    <div className="admin-course-access-title"><div><strong>Quyền truy cập khóa học</strong><p>Chỉ những khóa được chọn mới xuất hiện trong tài khoản học viên.</p></div><span>{selectedUser.role === 'admin' ? 'Toàn quyền' : `${(selectedUser.allowedCourses || []).length}/${courses.length} khóa`}</span></div>
                    {selectedUser.role === 'admin' ? <div className="admin-admin-access"><span aria-hidden="true">✓</span><div><strong>Quản trị viên được xem toàn bộ khóa học</strong><p>Không cần chọn thủ công từng khóa bên dưới.</p></div></div> : <div className="admin-course-checks">{courses.map(course => {
                      const checked = (selectedUser.allowedCourses || []).includes(course.id);
                      return <label key={course.id} className={checked ? 'checked' : ''}><input name={`course-access-${course.id}`} type="checkbox" checked={checked} onChange={e => { const allowed = selectedUser.allowedCourses || []; handleChangeUser(selectedUser.id, 'allowedCourses', e.target.checked ? [...allowed, course.id] : allowed.filter(id => id !== course.id)); }} /><span><strong>{course.title}</strong><small>{course.totalLessons || 0} bài học</small></span></label>;
                    })}</div>}
                  </div>
                </section> : <div className="admin-empty">Chọn một học viên để bắt đầu chỉnh sửa.</div>}
              </div>
            </section>
          )}

          {activeTab === 'courses' && !currentCourse && (
            <section className="admin-panel" aria-labelledby="courses-heading">
              <div className="admin-panel-header"><div><h2 id="courses-heading">Thư viện khóa học</h2><p>Tạo khóa mới và quản lý nội dung từng chương.</p></div><button className="btn-primary" onClick={handleAddCourse}>+ Tạo khóa học</button></div>
              <div className="admin-card-grid">{courses.map((course, index) => <article className="admin-content-card" key={course.id}><div className={`admin-card-cover tone-${index % 4}`}><span aria-hidden="true">📖</span><b>{course.totalLessons || 0} bài</b></div><div className="admin-card-body"><p>KHÓA HỌC #{course.id}</p><h3>{course.title}</h3><div className="admin-card-actions"><button className="btn-secondary" onClick={() => { apiFetch(`/courses/${course.id}`).then(res => res.json()).then(data => setCurrentCourse(data)); }}>Chỉnh sửa nội dung</button><button className="admin-icon-delete" aria-label={`Xóa khóa học ${course.title}`} onClick={() => handleDeleteCourse(course.id)}>Xóa</button></div></div></article>)}</div>
            </section>
          )}

          {activeTab === 'courses' && currentCourse && (
            <section className="admin-panel admin-editor-panel" aria-labelledby="course-editor-heading">
              <div className="admin-panel-header"><div><button className="admin-back" onClick={() => setCurrentCourse(null)}>← Danh sách khóa học</button><h2 id="course-editor-heading">{currentCourse.title}</h2><p>Chỉnh thông tin khóa học, chương và từng bài giảng.</p></div><button className="btn-primary" onClick={async () => { await apiFetch(`/courses/${currentCourse.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentCourse) }); const totalLessons = currentCourse.sections.reduce((total, section) => total + section.items.length, 0); const updatedCourses = courses.map(course => course.id === currentCourse.id ? {...course, title: currentCourse.title, totalLessons} : course); setCourses(updatedCourses); await apiFetch('/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCourses) }); setNotice('Đã lưu nội dung khóa học.'); }}>Lưu nội dung</button></div>
              {notice && <p className="admin-notice" role="status" aria-live="polite">{notice}</p>}
              <div className="admin-form-card"><label><span>Tên khóa học</span><input name="course-title" autoComplete="off" value={currentCourse.title} onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})} className="input-field" placeholder="Nhập tên khóa học…" /></label><label><span>Mô tả ngắn</span><textarea name="course-description" autoComplete="off" value={currentCourse.desc} onChange={e => setCurrentCourse({...currentCourse, desc: e.target.value})} className="input-field" placeholder="Mô tả nội dung khóa học…" rows={3} /></label></div>
              <div className="admin-guide"><div className="admin-guide-title"><span aria-hidden="true">💡</span><div><strong>Thêm bài học đúng cách</strong><p>Mỗi bài cần có tên rõ ràng và liên kết nhúng hợp lệ.</p></div></div><ol className="admin-guide-steps"><li><b>1</b><span><strong>Chọn định dạng</strong><small>Video hoặc PDF</small></span></li><li><b>2</b><span><strong>Đặt tên bài học</strong><small>Ngắn gọn, dễ tìm</small></span></li><li><b>3</b><span><strong>Dán liên kết nhúng</strong><small>YouTube hoặc Google Drive</small></span></li></ol><p className="admin-guide-note">🔒 Không đặt tài liệu cần bảo mật ở chế độ công khai trên Google Drive.</p></div>
              <div className="admin-sections">{currentCourse.sections.map((section, sectionIndex) => <article className="admin-section-card" key={section.id}><div className="admin-section-head"><span>Chương {sectionIndex + 1}</span><input aria-label={`Tên chương ${sectionIndex + 1}`} name={`section-${section.id}`} autoComplete="off" value={section.title} onChange={e => { const sections = currentCourse.sections.map((item, index) => index === sectionIndex ? {...item, title: e.target.value} : item); setCurrentCourse({...currentCourse, sections}); }} className="input-field" placeholder="Tên chương…" /><b>{section.items.length} bài</b></div><div className="admin-lessons">{section.items.map((item, itemIndex) => <div className="admin-lesson-row" key={item.id}><span className="admin-lesson-number">{itemIndex + 1}</span><select aria-label={`Loại bài ${itemIndex + 1}`} name={`lesson-type-${item.id}`} value={item.type} onChange={e => { const sections = currentCourse.sections.map((sec, secIndex) => secIndex === sectionIndex ? {...sec, items: sec.items.map((lesson, lessonIndex) => lessonIndex === itemIndex ? {...lesson, type: e.target.value} : lesson)} : sec); setCurrentCourse({...currentCourse, sections}); }} className="input-field"><option value="video">Video</option><option value="pdf">PDF</option></select><input aria-label={`Tên bài ${itemIndex + 1}`} name={`lesson-title-${item.id}`} autoComplete="off" value={item.title} onChange={e => { const sections = currentCourse.sections.map((sec, secIndex) => secIndex === sectionIndex ? {...sec, items: sec.items.map((lesson, lessonIndex) => lessonIndex === itemIndex ? {...lesson, title: e.target.value} : lesson)} : sec); setCurrentCourse({...currentCourse, sections}); }} className="input-field" placeholder="Tên bài học…" /><input aria-label={`Liên kết bài ${itemIndex + 1}`} name={`lesson-url-${item.id}`} type="url" autoComplete="off" spellCheck={false} value={item.url} onChange={e => { const sections = currentCourse.sections.map((sec, secIndex) => secIndex === sectionIndex ? {...sec, items: sec.items.map((lesson, lessonIndex) => lessonIndex === itemIndex ? {...lesson, url: e.target.value} : lesson)} : sec); setCurrentCourse({...currentCourse, sections}); }} className="input-field" placeholder="https://…" /><button className="admin-icon-delete" onClick={() => { if (confirm('Xóa bài này?')) { const sections = currentCourse.sections.map((sec, secIndex) => secIndex === sectionIndex ? {...sec, items: sec.items.filter((_, lessonIndex) => lessonIndex !== itemIndex)} : sec); setCurrentCourse({...currentCourse, sections}); } }}>Xóa</button></div>)}<button className="admin-add-row" onClick={() => { const sections = currentCourse.sections.map((sec, index) => index === sectionIndex ? {...sec, items: [...sec.items, { id: `item-${Date.now()}`, title: 'Bài học mới', type: 'video', url: '' }]} : sec); setCurrentCourse({...currentCourse, sections}); }}>+ Thêm bài học</button></div></article>)}</div>
              <button className="admin-add-section" onClick={() => setCurrentCourse({...currentCourse, sections: [...currentCourse.sections, { id: `sec-${Date.now()}`, title: 'Chương mới', items: [] }]})}>+ Thêm chương mới</button>
            </section>
          )}

          {activeTab === 'exams' && !currentExam && (
            <section className="admin-panel" aria-labelledby="exams-heading"><div className="admin-panel-header"><div><h2 id="exams-heading">Ngân hàng đề thi</h2><p>Tải trực tiếp file JSON hoặc Markdown lên Supabase.</p></div><button className="btn-primary" onClick={handleAddExam}>+ Tạo đề thi</button></div><div className="admin-card-grid">{exams.map((exam, index) => <article className="admin-content-card" key={exam.id}><div className={`admin-card-cover exam tone-${index % 4}`}><span aria-hidden="true">📝</span><b>{exam.data ? 'JSON' : exam.markdownContent ? 'MD' : 'Trống'}</b></div><div className="admin-card-body"><p>ĐỀ THI #{exam.id}</p><h3>{exam.title}</h3><small>{exam.fileName || (exam.data ? 'Đề JSON đã sẵn sàng' : exam.markdownContent ? 'Đề Markdown đã sẵn sàng' : 'Chưa có nội dung')}</small><div className="admin-card-actions"><button className="btn-secondary" onClick={() => setCurrentExam(exam)}>Chỉnh sửa đề</button><button className="admin-icon-delete" onClick={() => handleDeleteExam(exam.id)}>Xóa</button></div></div></article>)}</div></section>
          )}

          {activeTab === 'exams' && currentExam && (
            <section className="admin-panel admin-editor-panel" aria-labelledby="exam-editor-heading"><div className="admin-panel-header"><div><button className="admin-back" onClick={() => setCurrentExam(null)}>← Ngân hàng đề</button><h2 id="exam-editor-heading">{currentExam.title}</h2><p>Cập nhật tên và nội dung đề thi.</p></div><button className="btn-primary" onClick={async () => { const newExams = exams.map(exam => exam.id === currentExam.id ? currentExam : exam); setExams(newExams); await handleSaveExams(newExams); setNotice('Đã lưu đề thi.'); }}>Lưu đề thi</button></div>{notice && <p className="admin-notice" role="status" aria-live="polite">{notice}</p>}<div className="admin-guide"><div className="admin-guide-title"><span aria-hidden="true">📤</span><div><strong>Tải đề thi trong 3 bước</strong><p>File được lưu trực tiếp vào database, không cần đưa lên GitHub.</p></div></div><ol className="admin-guide-steps"><li><b>1</b><span><strong>Chuẩn bị file</strong><small>JSON tương tác hoặc Markdown</small></span></li><li><b>2</b><span><strong>Chọn file từ máy</strong><small>Dung lượng tối đa 2 MB</small></span></li><li><b>3</b><span><strong>Lưu đề thi</strong><small>Học viên thấy ngay</small></span></li></ol><p className="admin-guide-note">✓ JSON hỗ trợ chấm điểm tự động · Markdown phù hợp để đọc hoặc in.</p></div><div className="admin-exam-form"><label><span>Tên đề thi</span><input name="exam-title" autoComplete="off" value={currentExam.title} onChange={e => setCurrentExam({...currentExam, title: e.target.value})} className="input-field" placeholder="Nhập tên đề thi…" /></label><div className="admin-upload-zone"><label htmlFor="exam-file"><strong>Chọn file đề thi</strong><span>Chấp nhận .json hoặc .md, tối đa 2 MB</span></label><input id="exam-file" name="exam-file" type="file" accept=".json,.md,application/json,text/markdown" onChange={e => handleExamFile(e.target.files?.[0])} /><p>{currentExam.fileName ? `Đã chọn: ${currentExam.fileName}` : currentExam.data ? 'Đề JSON hiện tại đã sẵn sàng.' : currentExam.markdownContent ? 'Đề Markdown hiện tại đã sẵn sàng.' : 'Chưa chọn file.'}</p></div></div></section>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
