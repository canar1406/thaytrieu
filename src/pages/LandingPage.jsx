import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import './LandingPage.css';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
);
gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ────────── DATA ────────── */
const COURSES = [
  { icon: '📐', title: 'Đại Số & Giải Tích', desc: 'Nền tảng vững từ hàm số, giới hạn, đạo hàm đến tích phân. Phương pháp giải thông minh, bài tập từ cơ bản đến nâng cao.' },
  { icon: '🔷', title: 'Hình Học Không Gian', desc: 'Chinh phục khối đa diện và hình tròn xoay. Rèn tư duy 3D qua sơ đồ trực quan và bài toán thực tế hấp dẫn.' },
  { icon: '🎲', title: 'Tổ Hợp & Xác Suất', desc: 'Thành thạo tổ hợp, xác suất – dạng bài thường gặp nhất trong đề THPT. Kỹ thuật giải nhanh, chính xác.' },
  { icon: '〰️', title: 'Lượng Giác', desc: 'Công thức lượng giác, phương trình và bất phương trình. Kỹ thuật biến đổi thông minh giúp giải bài nhanh hơn.' },
  { icon: '✍️', title: 'Bài Tập Có Chữa', desc: 'Mỗi buổi học có bài tập về nhà được chữa chi tiết từng bước. Hỏi bài thoải mái 24/7 qua Zalo.' },
  { icon: '🗓️', title: 'Lịch Học Linh Hoạt', desc: 'Sắp xếp lịch theo thời gian của học sinh. Hỗ trợ học online hoặc trực tiếp đều được đảm bảo chất lượng.' },
];

const COMMITS = [
  { icon: '📈', text: 'Cam kết cải thiện điểm số ít nhất 1.5–2 điểm sau 3 tháng học chăm chỉ' },
  { icon: '🎯', text: 'Minh bạch học phí từ đầu, không phát sinh chi phí ẩn trong quá trình học' },
  { icon: '💬', text: 'Hỗ trợ hỏi bài qua Zalo 24/7, kể cả buổi tối và cuối tuần' },
  { icon: '📋', text: 'Lộ trình học tập cá nhân hóa, phù hợp với mục tiêu và năng lực từng học sinh' },
];

const TIMELINE = [
  {
    year: '2023',
    items: [
      { icon: '🥇', text: <><strong>Thủ khoa</strong> đầu vào Chuyên Toán Long An (10đ Toán thường, 8đ Toán chuyên)</> },
    ],
  },
  {
    year: '2024',
    items: [
      { icon: '🥈', text: <><strong>Giải Nhì</strong> kỳ thi HSG cấp Tỉnh Long An</> },
      { icon: '🥉', text: <><strong>Huy chương Đồng</strong> Olympic 30/4 khu vực miền Nam</> },
      { icon: '🏟️', text: <>Tham gia <strong>Đội tuyển HSG Quốc Gia</strong> môn Toán</> },
    ],
  },
  {
    year: '2025',
    items: [
      { icon: '🥈', text: <><strong>Giải Nhì</strong> HSG cấp Tỉnh Long An</> },
      { icon: '🥇', text: <><strong>Giải Nhất</strong> Olympic Miền Trung – Tây Nguyên mở rộng</> },
      { icon: '👑', text: <><strong>Thủ Khoa (39/40)</strong> kỳ thi chọn HSG dự thi Quốc Gia</> },
      { icon: '🌏', text: <><strong>Giải Aluminium Compass</strong> – Kỳ thi Hình Học Quốc Tế Iran (IGO)</> },
      { icon: '🏅', text: <><strong>Giải Ba</strong> kỳ thi HSG Quốc Gia môn Toán</> },
      { icon: '🎓', text: <><strong>Tuyển thẳng</strong> ĐH Sư Phạm Hà Nội & ĐH Sư Phạm TP.HCM</> },
      { icon: '📝', text: <><strong>9,5 điểm</strong> môn Toán kỳ thi Tốt nghiệp THPT Quốc Gia</> },
    ],
  },
];

/* ── Radar Chart: thầy Triều's skill profile ── */
const radarData = {
  labels: ['Đại Số', 'Hình Học', 'Giải Tích', 'Tổ Hợp', 'Lượng Giác', 'Số Phức'],
  datasets: [
    {
      label: 'Năng lực giảng dạy',
      data: [95, 98, 92, 90, 88, 85],
      backgroundColor: 'rgba(59,110,244,0.12)',
      borderColor: 'rgba(59,110,244,0.8)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59,110,244,1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const radarOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: {
    r: {
      min: 60, max: 100,
      ticks: { display: false, stepSize: 10 },
      grid: { color: 'rgba(99,113,183,0.15)' },
      angleLines: { color: 'rgba(99,113,183,0.12)' },
      pointLabels: {
        font: { size: 11, family: 'Inter', weight: '600' },
        color: '#374151',
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      titleColor: '#111827', bodyColor: '#374151',
      borderColor: 'rgba(59,110,244,0.2)', borderWidth: 1,
      cornerRadius: 10, padding: 10,
      callbacks: { label: (ctx) => ` ${ctx.raw}/100` },
    },
  },
};

/* ── Bar Chart: học viên tăng điểm ── */
const barData = {
  labels: ['Học viên A', 'Học viên B', 'Học viên C', 'Học viên D', 'Học viên E'],
  datasets: [
    {
      label: 'Điểm ban đầu',
      data: [5.5, 6.0, 5.0, 6.5, 5.5],
      backgroundColor: 'rgba(99,113,183,0.25)',
      borderRadius: 8, borderSkipped: false,
    },
    {
      label: 'Điểm sau khi học',
      data: [8.5, 8.0, 7.5, 9.0, 8.0],
      backgroundColor: 'rgba(59,110,244,0.75)',
      borderRadius: 8, borderSkipped: false,
    },
  ],
};

const barOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 11, family: 'Inter' }, color: '#374151', boxWidth: 12, borderRadius: 4, useBorderRadius: true },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      titleColor: '#111827', bodyColor: '#374151',
      borderColor: 'rgba(59,110,244,0.2)', borderWidth: 1,
      cornerRadius: 10, padding: 10,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6b7280' } },
    y: {
      min: 0, max: 10,
      grid: { color: 'rgba(99,113,183,0.1)' },
      ticks: { font: { size: 11 }, color: '#6b7280', callback: (v) => `${v}đ` },
    },
  },
};

/* ────────────────────────── COMPONENT ────────────────────────── */
const LandingPage = () => {
  const rootRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const isLoggedIn = !!localStorage.getItem('user');

  useGSAP(() => {
    // ── Navbar drop-in
    gsap.fromTo('.navbar',
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );

    // ── Hero LEFT: Staggered entrance matching reference
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
    heroTl
      .fromTo('.hero-eyebrow',
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45 })
      .fromTo('.hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
      .fromTo('.hero-desc',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
      .fromTo('.stat-pill',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.1 }, '-=0.25')
      .fromTo('.hero-cta-row .btn',
        { y: 14, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.12 }, '-=0.25');

    // ── Hero RIGHT: Portrait slides from right, badges pop in
    gsap.fromTo('.teacher-portrait-card .portrait-frame',
      { x: 55, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)', delay: 0.2 }
    );

    gsap.fromTo('.badge-top-left, .badge-mid-left',
      { x: -35, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.6, stagger: 0.15 }
    );
    gsap.fromTo('.badge-bottom-right',
      { x: 35, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.7 }
    );

    // Smooth float for portrait (after entrance)
    gsap.to('.teacher-portrait-card .portrait-frame', {
      y: -14,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.2
    });

    // ── Scroll reveals with clearProps so CSS hover works after
    const ST = { once: true };
    const cp = 'transform,opacity'; // clearProps value

    gsap.utils.toArray('.sr').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 96%', ...ST },
        y: 50, opacity: 0, duration: 1, ease: 'expo.out',
        onComplete() { gsap.set(el, { clearProps: cp }); },
      });
    });
    gsap.utils.toArray('.sr-l').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 96%', ...ST },
        x: -50, opacity: 0, duration: 1, ease: 'expo.out',
        onComplete() { gsap.set(el, { clearProps: cp }); },
      });
    });
    gsap.utils.toArray('.sr-r').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 96%', ...ST },
        x: 50, opacity: 0, duration: 1, ease: 'expo.out',
        onComplete() { gsap.set(el, { clearProps: cp }); },
      });
    });

    // Stagger grid items (từ trái qua phải, từ dưới lên)
    gsap.utils.toArray('.sr-stagger').forEach((parent) => {
      const children = parent.querySelectorAll('.sr-child');
      gsap.from(children, {
        scrollTrigger: { trigger: parent, start: 'top 96%', ...ST },
        y: 50, x: -30, opacity: 0, scale: 0.9,
        duration: 0.85, ease: 'back.out(1.5)', stagger: 0.12,
        onComplete() { gsap.set(children, { clearProps: 'all' }); },
      });
    });

    ScrollTrigger.refresh();
  }, { scope: rootRef });

  const scrollToRegister = () => {
    document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Uncomment + fill credentials from https://emailjs.com:
    // const SERVICE_ID='YOUR_SERVICE_ID', TEMPLATE_ID='YOUR_TEMPLATE_ID', PUBLIC_KEY='YOUR_PUBLIC_KEY';
    // await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      formRef.current?.reset();
    }, 1400);
  };

  return (
    <div className="lp-root" ref={rootRef}>
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

      {/* ═══ NAVBAR ═══ */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="nav-logo">
            <img src="./logo.jpg" alt="Toán Thầy Triều" className="logo-icon" />
            <span>Toán Thầy Triều</span>
          </div>
          <div className="nav-links">
            <a href="#courses-section" className="nav-link-item">Khóa học</a>
            <a href="#teacher-section" className="nav-link-item">Giáo viên</a>
            <a href="#register-section" className="nav-link-item">Đăng ký</a>
          </div>
          {isLoggedIn
            ? <button className="btn btn-glass" onClick={() => navigate('/dashboard')}>Vào học →</button>
            : <button className="btn btn-glass" onClick={() => navigate('/login')}>Đăng nhập →</button>
          }
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* LEFT */}
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="live-dot" />
                Đang nhận học viên mới · Mùa hè 2025
              </div>
              <h1 className="hero-title">
                Chinh phục môn Toán<br />
                <span className="grad">từ nền tảng<br />đến đỉnh cao</span>
              </h1>
              <p className="hero-desc">
                Học cùng thầy <strong>Phạm Liêu Hoàng Triều</strong> - thủ khoa đầu vào chuyên Toán, giải Ba kì thi HSG quốc gia Toán 2026. Lộ trình cá nhân hoá phù hợp, giải đáp thắc mắc 24/7. Bí quyết độc quyền để đập tan nỗi sợ những con số qua tư duy của một thủ khoa.
              </p>
              <div className="hero-stats">
                <div className="stat-pill"><strong>9.5</strong><span>Điểm Toán THPT</span></div>
                <div className="stat-pill"><strong>39/40</strong><span>Thủ Khoa HSG QG</span></div>
                <div className="stat-pill"><strong>+2–3đ</strong><span>Học viên tăng TB</span></div>
              </div>
              <div className="hero-cta-row">
                <button className="btn btn-primary" onClick={scrollToRegister}>🚀 Đăng ký học thử</button>
                <a href="#teacher-section" className="btn btn-glass">Tìm hiểu thêm</a>
              </div>
            </div>

            {/* RIGHT: TEACHER PORTRAIT */}
            <div className="hero-right">
              {/*
                teacher-portrait-card has padding: 24px 36px
                so badges sit inside the padded area and never clip
              */}
              <div className="teacher-portrait-card">
                {/* Badge 1 – top right */}
                <div className="card-badge-float badge-top-right fire-badge">
                  <span className="badge-icon">🏆</span>
                  <div className="badge-label" style={{ color: '#b91c1c' }}>Giải Ba HSG QG<span style={{ color: '#ea580c', fontWeight: 600 }}>Toán 2025</span></div>
                </div>
                {/* Badge 2 – mid left */}
                <div className="card-badge-float badge-mid-left blue-glow-badge">
                  <span className="badge-icon">👑</span>
                  <div className="badge-label" style={{ color: '#0369a1' }}>Thủ Khoa<span>39/40 điểm</span></div>
                </div>
                {/* Badge 3 – bottom right */}
                <div className="card-badge-float badge-bottom-right blue-glow-badge">
                  <span className="badge-icon">🌍</span>
                  <div className="badge-label" style={{ color: '#0369a1' }}>IGO Iran<span>Aluminium Compass</span></div>
                </div>

                {/* Portrait frame */}
                <div className="portrait-frame">
                  <img src="./avt.jpg" alt="Thầy Phạm Liêu Hoàng Triều" className="portrait-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COURSES ═══ */}
      <section id="courses-section" className="section-pad">
        <div className="container">
          <div className="section-head sr">
            <div className="section-tag">Nội dung khóa học</div>
            <h2>Học đúng · Học đủ · <span className="grad">Học hiệu quả</span></h2>
            <p>Chương trình bám sát cấu trúc đề thi THPT Quốc Gia và HSG, đảm bảo nắm vững lý thuyết và thành thạo kỹ năng làm bài.</p>
          </div>
          <div className="courses-grid sr-stagger">
            {COURSES.map((c, i) => (
              <div key={i} className="course-card sr-child">
                <div className="course-card-icon">{c.icon}</div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEACHER ═══ */}
      <section id="teacher-section" className="section-pad">
        <div className="container">
          <div className="section-head sr">
            <div className="section-tag">Về giáo viên</div>
            <h2>Thầy <span className="grad-warm">Phạm Liêu Hoàng Triều</span></h2>
          </div>
          <div className="teacher-layout">
            {/* Bio + Timeline */}
            <div className="sr-l">

              <div className="timeline">
                {TIMELINE.map((group) => (
                  <div key={group.year} className="tl-year-group">
                    <div className="tl-year">
                      <span className="tl-year-label">{group.year}</span>
                      <span className="tl-year-line" />
                    </div>
                    <div className="tl-items">
                      {group.items.map((item, j) => (
                        <div key={j} className="tl-item">
                          <span className="tl-item-icon">{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts + Score table */}
            <div className="teacher-right-panel sr-r">
              {/* Radar chart */}
              <div className="radar-card">
                <h4>🕸️ Năng lực chuyên môn</h4>
                <div className="chart-wrap">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>

              {/* Bar chart removed per user request */}

              {/* Score table */}
              <div className="score-glass">
                <h4>🏆 Bảng thành tích chi tiết</h4>
                <table className="score-table">
                  <thead>
                    <tr><th>Kỳ thi</th><th>Hạng mục</th><th>Kết quả</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>THPT Quốc Gia</td><td>Môn Toán</td><td className="score-hi">9,5 / 10</td></tr>
                    <tr><td>HSG Tỉnh Long An</td><td>Vòng chọn tỉnh</td><td className="score-hi">Giải Nhì</td></tr>
                    <tr><td>Olympic 30/4</td><td>Khu vực Miền Nam</td><td className="score-hi">HCĐ</td></tr>
                    <tr><td>Olympic MTTNY</td><td>Mở rộng</td><td className="score-hi">Giải Nhất</td></tr>
                    <tr><td>HSG Quốc Gia (sơ bộ)</td><td>Thủ Khoa</td><td className="score-hi">39 / 40</td></tr>
                    <tr><td>HSG Quốc Gia (QG)</td><td>Chung kết</td><td className="score-hi">Giải Ba</td></tr>
                    <tr><td>IGO Iran</td><td>Hình Học QT</td><td className="score-hi">Aluminium</td></tr>
                    <tr><td>ĐH Sư Phạm</td><td>Tuyển thẳng 2 trường</td><td className="score-hi">HN & TP.HCM</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Quote Block Moved Below */}
              <div className="teacher-quote-block">
                <p>"Là một sinh viên ngành Sư Phạm Toán với niềm đam mê với những con số, mình mong muốn được truyền kinh nghiệm và kỹ năng tư duy độc lập đến các học sinh đam mê Toán."</p>
                <cite>— Phạm Liêu Hoàng Triều</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMMITMENTS ═══ */}
      <section className="section-pad">
        <div className="container">
          <div className="section-head sr">
            <div className="section-tag">Cam kết</div>
            <h2>Điều thầy Triều <span className="grad">cam kết</span> với học sinh</h2>
          </div>
          <div className="commit-grid sr-stagger">
            {COMMITS.map((c, i) => (
              <div key={i} className="commit-card sr-child">
                <div className="commit-icon">{c.icon}</div>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTER ═══ */}
      <section id="register-section" className="section-pad register-section-bg">
        <div className="container">
          <div className="register-grid">
            <div className="register-info sr-l">
              <div className="section-tag">Đăng ký học</div>
              <h2>Bắt đầu hành trình<br /><span className="grad">chinh phục Toán</span></h2>
              <p>Điền thông tin bên cạnh — thầy Triều sẽ liên hệ lại trong vòng <strong>24 giờ</strong> để trao đổi về lộ trình học phù hợp, hoàn toàn miễn phí.</p>
              <div className="contact-chips">
                <div className="contact-chip">📞 <span>Zalo: <a href="tel:0949243630">0949 243 630</a></span></div>
                <div className="contact-chip">✉️ <span>Email: <a href="mailto:phamlieuhoangtrieu@gmail.com">phamlieuhoangtrieu@gmail.com</a></span></div>
                <div className="contact-chip">🏫 <span>Cựu HS K23 Chuyên Trần Văn Giàu, Long An</span></div>
              </div>
            </div>

            <div className="form-box sr-r">
              {submitSuccess ? (
                <div className="success-panel">
                  <div className="success-icon">🎉</div>
                  <h3>Đăng ký thành công!</h3>
                  <p>Thầy Triều sẽ liên hệ với bạn sớm nhất có thể qua Zalo hoặc Email.</p>
                  <button className="btn btn-outline" onClick={() => setSubmitSuccess(false)}>
                    Đăng ký thêm học sinh
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit}>
                  <h3>Thông tin đăng ký học thử</h3>
                  <div className="form-row-2">
                    <div className="input-group">
                      <label>Họ và tên *</label>
                      <input name="user_name" type="text" className="form-control" required placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="input-group">
                      <label>Số điện thoại (Zalo) *</label>
                      <input name="user_phone" type="tel" className="form-control" required placeholder="0901 234 567" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input name="user_email" type="email" className="form-control" placeholder="email@gmail.com" />
                  </div>
                  <div className="input-group">
                    <label>Khóa học quan tâm *</label>
                    <select name="user_course" className="form-control" required>
                      <option value="">-- Chọn khóa học --</option>
                      <option value="thpt">Toán THPT Quốc Gia (lớp 10–12)</option>
                      <option value="chuyen">Toán Chuyên / HSG (lớp 6–12)</option>
                      <option value="other">Tư vấn thêm</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Ghi chú thêm</label>
                    <textarea name="user_message" className="form-control" rows="3"
                      placeholder="Mục tiêu điểm số, khó khăn hiện tại, thời gian rảnh..." />
                  </div>
                  <button type="submit" className="btn btn-primary submit-btn-full" disabled={isSubmitting}>
                    {isSubmitting ? '⏳ Đang gửi...' : '🚀 Gửi đăng ký'}
                  </button>
                  <p className="form-privacy">🔒 Thông tin được bảo mật, chỉ dùng để liên hệ học tập.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-copy">
            © 2025 Phạm Liêu Hoàng Triều · All rights reserved.<br />
            <span className="footer-credit">
              Designed & Developed by <a href="https://home.heavietnam.com/" target="_blank" rel="noopener noreferrer">Heavn</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
