import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './ExamPractice.css';
import { apiFetch } from '../api';
import { hasCompleteAnswerKey, hasExamQuestions, parseExamMarkdown } from '../examMarkdownParser';

const MarkdownContent = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={{
      p: ({ node: _node, ...props }) => <span className="md-paragraph" {...props} />
    }}
  >
    {children}
  </ReactMarkdown>
);

const normalizeExamData = source => {
  if (!source) return null;
  const record = Array.isArray(source)
    ? source[0]
    : Array.isArray(source.data)
      ? source.data[0]
      : source;
  return record?.data || record;
};

const hasInteractiveQuestions = hasExamQuestions;

const DEFAULT_EXAM_SETTINGS = {
  duration: 90,
  passingScore: 5,
  viewMode: 'all',
  shuffleQuestions: false,
  shuffleOptions: false,
  showResult: true,
  allowReview: true,
  autoSave: true,
  instructions: ''
};

const shuffled = items => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

const prepareExamData = (source, settings) => {
  const data = structuredClone(source);
  if (settings.shuffleQuestions) {
    data.part1_multipleChoice = shuffled(data.part1_multipleChoice || []);
    data.part2_trueFalse = shuffled(data.part2_trueFalse || []);
    data.part3_shortAnswer = shuffled(data.part3_shortAnswer || []);
  }
  if (settings.shuffleOptions) {
    data.part1_multipleChoice = (data.part1_multipleChoice || []).map(question => ({
      ...question,
      options: shuffled(question.options || [])
    }));
  }
  return data;
};

export default function ExamPractice({ onBackToDashboard, initialExams = null }) {
  const [exams, setExams] = useState(() => initialExams || []);
  const [isLoading, setIsLoading] = useState(!initialExams);
  const [isStarting, setIsStarting] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examError, setExamError] = useState('');
  const [view, setView] = useState('list'); // 'list', 'exam', 'result'
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  
  // State for exam mode
  const [userAnswers, setUserAnswers] = useState({ part1: {}, part2: {}, part3: {} });
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const timerRef = useRef(null);

  const handleSubmitExam = useCallback(async () => {
    clearInterval(timerRef.current);
    if (!selectedExam?.id || isSubmitting) return;
    setIsSubmitting(true);
    setExamError('');
    try {
      const response = await apiFetch(`/exams/${encodeURIComponent(selectedExam.id)}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userAnswers)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể nộp bài.');
      const resultData = normalizeExamData(result.data);
      if (!hasInteractiveQuestions(resultData)) throw new Error('Máy chủ không trả về đáp án hợp lệ.');
      setSelectedExam(current => ({ ...current, data: resultData }));
      localStorage.removeItem(`exam-progress:${selectedExam.id}`);
      setView('result');
    } catch (error) {
      setExamError(error.message || 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, selectedExam, userAnswers]);

  useEffect(() => {
    if (initialExams) return;
    apiFetch('/exams')
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không thể tải danh sách đề thi.');
        setExams(Array.isArray(data) ? data : []);
      })
      .catch(error => setExamError(error.message || 'Không thể tải danh sách đề thi.'))
      .finally(() => setIsLoading(false));
  }, [initialExams]);

  useEffect(() => {
    if (view === 'exam' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [view, timeLeft, handleSubmitExam]);

  const questionSequence = useMemo(() => {
    const data = selectedExam?.data;
    if (!data) return [];
    return [
      ...(data.part1_multipleChoice || []).map(question => ({ part: 'part1', question })),
      ...(data.part2_trueFalse || []).map(question => ({ part: 'part2', question })),
      ...(data.part3_shortAnswer || []).map(question => ({ part: 'part3', question }))
    ];
  }, [selectedExam?.data]);

  const answeredCount = useMemo(() => questionSequence.filter(({ part, question }) => {
    if (part === 'part1') return Boolean(userAnswers.part1[question.id]);
    if (part === 'part2') return Object.keys(userAnswers.part2[question.id] || {}).length > 0;
    return Boolean(userAnswers.part3[question.id]?.trim());
  }).length, [questionSequence, userAnswers]);

  useEffect(() => {
    if (view !== 'exam' || !selectedExam?.id || selectedExam.settings?.autoSave === false) return;
    const saveTimer = setTimeout(() => {
      localStorage.setItem(`exam-progress:${selectedExam.id}`, JSON.stringify({
        answers: userAnswers,
        timeLeft,
        savedAt: Date.now()
      }));
      setSaveStatus('Đã tự động lưu');
    }, 350);
    return () => clearTimeout(saveTimer);
  }, [selectedExam?.id, selectedExam?.settings?.autoSave, timeLeft, userAnswers, view]);

  const [markdownContent, setMarkdownContent] = useState('');

  const startExam = async (exam) => {
    setIsStarting(exam.id);
    setExamError('');
    setSaveStatus('');
    setCurrentQuestionIndex(0);
    setMarkdownContent('');

    try {
      const inlineData = normalizeExamData(exam.data);
      if (hasInteractiveQuestions(inlineData)) {
        const settings = { ...DEFAULT_EXAM_SETTINGS, ...exam.settings, duration: Number(exam.settings?.duration || exam.time || 90) };
        const progressKey = `exam-progress:${exam.id}`;
        let savedProgress = null;
        if (settings.autoSave) {
          try { savedProgress = JSON.parse(localStorage.getItem(progressKey)); } catch { savedProgress = null; }
        }
        setUserAnswers(savedProgress?.answers || { part1: {}, part2: {}, part3: {} });
        setTimeLeft(savedProgress?.timeLeft || settings.duration * 60);
        setSelectedExam({ ...exam, settings, data: prepareExamData(inlineData, settings) });
        if (savedProgress?.answers) setSaveStatus('Đã khôi phục bài làm gần nhất.');
        setView('exam');
      } else if (exam.markdownContent?.trim()) {
        const parsedMarkdown = parseExamMarkdown(exam.markdownContent);
        if (hasCompleteAnswerKey(parsedMarkdown)) {
          throw new Error('Đề này đang ở định dạng cũ. Quản trị viên cần mở đề, chọn lại file Markdown và bấm “Lưu đề thi”.');
        }
        setSelectedExam(exam);
        setMarkdownContent(exam.markdownContent);
        setView('exam');
      } else if (exam.fileUrl) {
        const url = exam.fileUrl.startsWith('/') ? '.' + exam.fileUrl : exam.fileUrl;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Không thể tải file (${res.status}).`);
        if (exam.fileUrl.endsWith('.json')) {
          const fetchedData = await res.json();
          const normalizedData = normalizeExamData(fetchedData);
          if (!hasInteractiveQuestions(normalizedData)) throw new Error('File JSON không có cấu trúc đề thi hợp lệ.');
          setSelectedExam({ ...exam, data: normalizedData });
          setView('exam');
        } else {
          const text = await res.text();
          if (!text.trim()) throw new Error('File đề thi đang trống.');
          setSelectedExam(exam);
          setMarkdownContent(text);
          setView('exam');
        }
      } else {
        throw new Error('Đề thi này chưa có nội dung. Vui lòng báo quản trị viên tải lại file.');
      }
    } catch (error) {
      setSelectedExam(null);
      setExamError(error.message || 'Không thể mở đề thi.');
    } finally {
      setIsStarting('');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedExam(null);
    setExamError('');
    setSaveStatus('');
  };

  const requestSubmitExam = () => {
    const unanswered = Math.max(0, questionSequence.length - answeredCount);
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`)) return;
    handleSubmitExam();
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePart1Select = (qId, optionKey) => {
    if (view === 'result') return;
    setUserAnswers(prev => ({ ...prev, part1: { ...prev.part1, [qId]: optionKey } }));
  };

  const handlePart2Select = (qId, statementId, boolValue) => {
    if (view === 'result') return;
    setUserAnswers(prev => ({
      ...prev,
      part2: {
        ...prev.part2,
        [qId]: { ...prev.part2[qId], [statementId]: boolValue }
      }
    }));
  };

  const handlePart3Change = (qId, value) => {
    if (view === 'result') return;
    setUserAnswers(prev => ({ ...prev, part3: { ...prev.part3, [qId]: value } }));
  };

  // SCORE CALCULATION
  const calculateScore = () => {
    if (!selectedExam) return 0;
    const { data } = selectedExam;
    let score = 0;

    // Part 1: 0.25 points each
    if (data.part1_multipleChoice) {
      data.part1_multipleChoice.forEach(q => {
        const correctOpt = q.options.find(o => o.isCorrect);
        if (correctOpt && userAnswers.part1[q.id] === correctOpt.key) {
          score += 0.25;
        }
      });
    }

    // Part 2: Partial credit per statement
    // 1 correct = 0.1, 2 correct = 0.25, 3 correct = 0.5, 4 correct = 1.0
    if (data.part2_trueFalse) {
      data.part2_trueFalse.forEach(q => {
        let correctCount = 0;
        const userQAnswers = userAnswers.part2[q.id] || {};
        q.statements.forEach(stmt => {
          if (userQAnswers[stmt.id] === stmt.isTrue) {
            correctCount++;
          }
        });
        if (correctCount === 1) score += 0.1;
        else if (correctCount === 2) score += 0.25;
        else if (correctCount === 3) score += 0.5;
        else if (correctCount === 4) score += 1.0;
      });
    }

    // Part 3: 0.5 points each
    if (data.part3_shortAnswer) {
      data.part3_shortAnswer.forEach(q => {
        const userAnswer = (userAnswers.part3[q.id] || "").toString().trim();
        const correctAnswer = (q.correctAnswer || "").toString().trim();
        if (userAnswer && userAnswer === correctAnswer) {
          score += 0.5;
        }
      });
    }

    return Math.min(10, score).toFixed(2);
  };

  // PALETTE LOGIC
  const getQuestionStatus = (part, qId) => {
    if (view === 'exam') {
      if (part === 'part1') return userAnswers.part1[qId] ? 'answered' : 'unanswered';
      if (part === 'part2') {
        const p2ans = userAnswers.part2[qId];
        return p2ans && Object.keys(p2ans).length === selectedExam.data.part2_trueFalse.find(q=>q.id===qId).statements.length ? 'answered' : (p2ans && Object.keys(p2ans).length > 0 ? 'partial' : 'unanswered');
      }
      if (part === 'part3') return userAnswers.part3[qId] && userAnswers.part3[qId].trim() !== '' ? 'answered' : 'unanswered';
    } else if (view === 'result') {
      // In result, we return correct/wrong
      const qData = selectedExam.data;
      if (part === 'part1') {
        const q = qData.part1_multipleChoice.find(x=>x.id===qId);
        const correctOpt = q.options.find(o=>o.isCorrect);
        if (!userAnswers.part1[qId]) return 'wrong';
        return userAnswers.part1[qId] === correctOpt.key ? 'correct' : 'wrong';
      }
      if (part === 'part2') {
        const q = qData.part2_trueFalse.find(x=>x.id===qId);
        const p2ans = userAnswers.part2[qId] || {};
        let correctCount = 0;
        q.statements.forEach(stmt => {
          if (p2ans[stmt.id] === stmt.isTrue) correctCount++;
        });
        if (correctCount === 4) return 'correct';
        if (correctCount > 0) return 'partial-correct';
        return 'wrong';
      }
      if (part === 'part3') {
        const q = qData.part3_shortAnswer.find(x=>x.id===qId);
        const userAnswer = (userAnswers.part3[qId] || "").toString().trim();
        return userAnswer === q.correctAnswer ? 'correct' : 'wrong';
      }
    }
    return 'unanswered';
  };

  const scrollToQuestion = (qId) => {
    if (selectedExam?.settings?.viewMode === 'single' && view === 'exam') {
      const index = questionSequence.findIndex(item => item.question.id === qId);
      if (index >= 0 && (selectedExam.settings?.allowReview !== false || index >= currentQuestionIndex)) {
        setCurrentQuestionIndex(index);
      }
      return;
    }
    const el = document.getElementById(`question-${qId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  if (view === 'list') {
    return (
      <>
        <div className="topbar-wrapper">
          <header className="topbar exam-topbar">
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button aria-label="Quay lại Dashboard" className="topbar-btn" onClick={onBackToDashboard} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '8px' }}>
                 <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <img src="./logo.jpg" alt="" width="28" height="28" className="logo-icon" style={{ borderRadius: '6px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(59,110,244,0.15)' }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Toán Thầy Triều</span>
            </div>
            
            <div className="nav-links" style={{ display: 'flex', gap: '0.5rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <button type="button" className="nav-link-item" onClick={onBackToDashboard} style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--primary-600)', background: 'rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 10px rgba(80,100,200,0.12)' }}>Tổng quan học tập</button>
            </div>

            <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            </div>
          </header>
        </div>
        <div className="exam-practice-container list-view">
          <div className="exam-header-bar">
             <div>
               <p className="exam-eyebrow">LUYỆN TẬP</p>
               <h1>Danh sách đề thi</h1>
               <p>Chọn một đề để bắt đầu làm bài và theo dõi thời gian.</p>
             </div>
          </div>
        {examError && <div className="exam-alert" role="alert">{examError}</div>}
        {isLoading && <div className="exam-state" role="status">Đang tải danh sách đề thi…</div>}
        <div className="exam-grid">
          {exams.map(exam => {
            const inlineData = normalizeExamData(exam.data);
            const parsedMarkdown = exam.markdownContent?.trim() ? parseExamMarkdown(exam.markdownContent) : null;
            const needsMigration = !hasInteractiveQuestions(inlineData) && hasCompleteAnswerKey(parsedMarkdown);
            const examData = inlineData;
            const hasContent = Boolean(hasInteractiveQuestions(examData) || (!needsMigration && exam.markdownContent?.trim()) || exam.fileUrl);
            return (
            <div key={exam.id} className="exam-card">
              <div className="exam-card-content">
                 <h2>{exam.title.replace(/-/g, ' ')}</h2>
                 <p>Thời gian: {exam.settings?.duration || exam.time || 90} phút</p>
                 <p>Cấu trúc: {needsMigration ? 'Đề cũ cần quản trị viên mở và lưu lại' : hasInteractiveQuestions(examData) ? `${examData.part1_multipleChoice?.length || 0} câu trắc nghiệm, ${examData.part2_trueFalse?.length || 0} câu đúng/sai, ${examData.part3_shortAnswer?.length || 0} câu trả lời ngắn` : (exam.markdownContent ? 'Đề đọc dạng Markdown' : exam.fileUrl ? `File: ${exam.fileUrl}` : 'Đang cập nhật')}</p>
                 <button type="button" className="btn-primary" disabled={!hasContent || Boolean(isStarting)} onClick={() => startExam(exam)}>{isStarting === exam.id ? 'Đang mở đề…' : needsMigration ? 'Cần cập nhật đề' : hasContent ? 'Bắt đầu làm bài' : 'Chưa có nội dung'}</button>
              </div>
            </div>
            );
          })}
          {!isLoading && exams.length === 0 && <div className="exam-state">Chưa có đề thi nào được phát hành.</div>}
        </div>
      </div>
    </>
  );
}

  const data = selectedExam?.data || {};
  const isMarkdownOnly = !!markdownContent;
  const settings = { ...DEFAULT_EXAM_SETTINGS, ...selectedExam?.settings };
  const isSingleQuestion = view === 'exam' && settings.viewMode === 'single';
  const activeQuestionId = questionSequence[currentQuestionIndex]?.question.id;
  const showQuestion = question => !isSingleQuestion || question.id === activeQuestionId;
  const hideDetailedResult = view === 'result' && settings.showResult === false;
  const progressPercent = questionSequence.length ? Math.round((answeredCount / questionSequence.length) * 100) : 0;

  return (
    <>
      {/* HEADER INTEGRATED INTO TOPBAR */}
      <div className="topbar-wrapper">
        <header className="topbar exam-topbar">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button aria-label="Quay lại danh sách đề" className="topbar-btn" onClick={handleBackToList} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '8px' }}>
               <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <img src="./logo.jpg" alt="" width="28" height="28" className="logo-icon" style={{ borderRadius: '6px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(59,110,244,0.15)' }} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '16px' }}>Toán Thầy Triều</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 600, borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '16px', WebkitTextFillColor: 'var(--gray-700)' }}>
                {selectedExam.title.replace(/-/g, ' ')}
              </span>
            </span>
          </div>

          <div className="nav-links" style={{ display: 'flex', gap: '0.5rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <button type="button" className="nav-link-item" onClick={handleBackToList} style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--primary-600)', background: 'rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 10px rgba(80,100,200,0.12)' }}>Tổng quan học tập</button>
          </div>

          <div className="topbar-actions header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             {view === 'exam' && !isMarkdownOnly && (
               <div className="timer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--gray-900)', background: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.8)' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className={timeLeft < 300 ? 'text-danger' : ''}>{formatTime(timeLeft)}</span>
               </div>
             )}
             {view === 'exam' ? (
               !isMarkdownOnly && <button className="btn-primary" disabled={isSubmitting} onClick={requestSubmitExam} style={{ margin: 0, padding: '8px 24px', borderRadius: 'var(--radius-full)' }}>{isSubmitting ? 'Đang nộp…' : 'Nộp bài'}</button>
             ) : (
               !isMarkdownOnly && !hideDetailedResult && <div className="score-badge" style={{ background: '#34c759', color: 'white', padding: '8px 20px', borderRadius: 'var(--radius-full)', fontWeight: 700, margin: 0, boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)' }}>Điểm: {calculateScore()}/10</div>
             )}
          </div>
        </header>
      </div>

      <div className={`exam-practice-container ${view}-view`}>
      {examError && <div className="exam-alert" role="alert">{examError}</div>}
      {view === 'exam' && !isMarkdownOnly && (
        <div className="exam-progress-panel">
          <div><span>{saveStatus || 'Bài làm của bạn'}</span><strong>{answeredCount}/{questionSequence.length} câu đã trả lời</strong></div>
          <div className="exam-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
        </div>
      )}
      {view === 'exam' && settings.instructions && <div className="exam-instructions">ℹ {settings.instructions}</div>}

      <div className="exam-layout">
        {/* MAIN CONTENT */}
        <div className="exam-content" style={isMarkdownOnly ? { width: '100%' } : {}}>
          {hideDetailedResult ? (
            <div className="exam-submitted-card">
              <span>✓</span>
              <h2>Đã nộp bài thành công</h2>
              <p>Giáo viên đã tắt chế độ xem điểm và đáp án sau khi nộp.</p>
              <button type="button" className="btn-primary" onClick={handleBackToList}>Về danh sách đề</button>
            </div>
          ) : isMarkdownOnly ? (
            <div style={{ padding: '32px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <MarkdownContent>{markdownContent}</MarkdownContent>
            </div>
          ) : (
            <>
              {/* PART 1 */}
              {data.part1_multipleChoice?.length > 0 && (!isSingleQuestion || data.part1_multipleChoice.some(showQuestion)) && (
            <div className="exam-part">
              <h2 className="part-title">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn</h2>
              <p className="part-desc">Thí sinh trả lời từ câu 1 đến câu {data.part1_multipleChoice.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.</p>
              
              {data.part1_multipleChoice.map((q, idx) => {
                if (!showQuestion(q)) return null;
                const correctOpt = q.options.find(o => o.isCorrect);
                const userAns = userAnswers.part1[q.id];
                const isCorrect = userAns === correctOpt?.key;

                return (
                  <div key={q.id} id={`question-${q.id}`} className={`question-block ${view === 'result' ? (isCorrect ? 'correct-block' : 'wrong-block') : ''}`}>
                    <div className="question-text">
                      <strong>Câu {idx + 1}:</strong> <MarkdownContent>{q.question}</MarkdownContent>
                    </div>
                    <div className="options-grid part1-options">
                      {q.options.map(opt => {
                        let btnClass = 'option-btn';
                        if (userAns === opt.key) btnClass += ' selected';
                        if (view === 'result') {
                           if (opt.isCorrect) btnClass += ' correct-answer';
                           if (userAns === opt.key && !opt.isCorrect) btnClass += ' wrong-answer';
                        }
                        
                        return (
                          <button 
                            key={opt.key} 
                            className={btnClass}
                            onClick={() => handlePart1Select(q.id, opt.key)}
                            disabled={view === 'result'}
                          >
                            <span className="opt-key">{opt.key}.</span> 
                            <MarkdownContent>{opt.text}</MarkdownContent>
                          </button>
                        );
                      })}
                    </div>
                    {view === 'result' && (
                       <div className="explanation-box">
                          <strong>Đáp án đúng: {correctOpt?.key}</strong>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PART 2 */}
          {data.part2_trueFalse?.length > 0 && (!isSingleQuestion || data.part2_trueFalse.some(showQuestion)) && (
            <div className="exam-part">
              <h2 className="part-title">PHẦN II. Câu trắc nghiệm đúng sai</h2>
              <p className="part-desc">Thí sinh trả lời từ câu 1 đến câu {data.part2_trueFalse.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.</p>
              
              {data.part2_trueFalse.map((q, idx) => {
                if (!showQuestion(q)) return null;
                const userAns = userAnswers.part2[q.id] || {};
                
                return (
                  <div key={q.id} id={`question-${q.id}`} className="question-block">
                    <div className="question-text">
                      <strong>Câu {idx + 1}:</strong> <MarkdownContent>{q.question}</MarkdownContent>
                    </div>
                    <div className="statements-list">
                      {q.statements.map(stmt => {
                        const userStmtAns = userAns[stmt.id];
                        let rowClass = 'statement-row';
                        if (view === 'result') {
                          if (userStmtAns === stmt.isTrue) rowClass += ' correct-row';
                          else if (userStmtAns !== undefined) rowClass += ' wrong-row';
                        }

                        return (
                          <div key={stmt.id} className={rowClass}>
                            <div className="stmt-text">
                               <strong>{stmt.id})</strong> <MarkdownContent>{stmt.text}</MarkdownContent>
                            </div>
                            <div className="stmt-actions">
                              <button 
                                className={`tf-btn ${userStmtAns === true ? 'selected-true' : ''}`}
                                onClick={() => handlePart2Select(q.id, stmt.id, true)}
                                disabled={view === 'result'}
                              >Đúng</button>
                              <button 
                                className={`tf-btn ${userStmtAns === false ? 'selected-false' : ''}`}
                                onClick={() => handlePart2Select(q.id, stmt.id, false)}
                                disabled={view === 'result'}
                              >Sai</button>
                            </div>
                            {view === 'result' && (
                               <div className="stmt-result-indicator">
                                  {stmt.isTrue ? <span className="text-success">Đ</span> : <span className="text-danger">S</span>}
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PART 3 */}
          {data.part3_shortAnswer?.length > 0 && (!isSingleQuestion || data.part3_shortAnswer.some(showQuestion)) && (
            <div className="exam-part">
              <h2 className="part-title">PHẦN III. Câu trắc nghiệm trả lời ngắn</h2>
              <p className="part-desc">Thí sinh trả lời từ câu 1 đến câu {data.part3_shortAnswer.length}.</p>
              
              {data.part3_shortAnswer.map((q, idx) => {
                if (!showQuestion(q)) return null;
                const userAns = userAnswers.part3[q.id] || "";
                const isCorrect = userAns.trim() === q.correctAnswer;
                
                return (
                  <div key={q.id} id={`question-${q.id}`} className={`question-block ${view === 'result' ? (isCorrect ? 'correct-block' : 'wrong-block') : ''}`}>
                    <div className="question-text">
                      <strong>Câu {idx + 1}:</strong> <MarkdownContent>{q.question}</MarkdownContent>
                    </div>
                    <div className="short-answer-input">
                      <input 
                        type="text" 
                        aria-label={`Đáp án câu ${idx + 1}`}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="Nhập đáp án…"
                        value={userAns}
                        onChange={(e) => handlePart3Change(q.id, e.target.value)}
                        disabled={view === 'result'}
                      />
                    </div>
                    {view === 'result' && (
                       <div className="explanation-box">
                          <strong>Đáp án đúng: {q.correctAnswer}</strong>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
              )}
              {isSingleQuestion && (
                <div className="exam-question-navigation">
                  <button type="button" disabled={currentQuestionIndex === 0 || settings.allowReview === false} onClick={() => setCurrentQuestionIndex(index => Math.max(0, index - 1))}>← Câu trước</button>
                  <span>Câu {currentQuestionIndex + 1} / {questionSequence.length}</span>
                  {currentQuestionIndex < questionSequence.length - 1
                    ? <button type="button" className="next" onClick={() => setCurrentQuestionIndex(index => Math.min(questionSequence.length - 1, index + 1))}>Câu tiếp →</button>
                    : <button type="button" className="submit" onClick={requestSubmitExam}>Nộp bài</button>}
                </div>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR PALETTE */}
        {!isMarkdownOnly && !hideDetailedResult && (
          <div className="exam-sidebar">
             <div className="palette-card glass">
              <h4>Bảng câu hỏi</h4>
              
              {data.part1_multipleChoice?.length > 0 && (
                <div className="palette-section">
                  <div className="palette-title">Phần I</div>
                  <div className="palette-grid">
                    {data.part1_multipleChoice.map((q, idx) => {
                      const status = getQuestionStatus('part1', q.id);
                      return (
                        <button 
                          key={q.id} 
                          className={`palette-btn status-${status}`}
                          onClick={() => scrollToQuestion(q.id)}
                        >{idx + 1}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.part2_trueFalse?.length > 0 && (
                <div className="palette-section">
                  <div className="palette-title">Phần II</div>
                  <div className="palette-grid">
                    {data.part2_trueFalse.map((q, idx) => {
                      const status = getQuestionStatus('part2', q.id);
                      return (
                        <button 
                          key={q.id} 
                          className={`palette-btn status-${status}`}
                          onClick={() => scrollToQuestion(q.id)}
                        >{idx + 1}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.part3_shortAnswer?.length > 0 && (
                <div className="palette-section">
                  <div className="palette-title">Phần III</div>
                  <div className="palette-grid">
                    {data.part3_shortAnswer.map((q, idx) => {
                      const status = getQuestionStatus('part3', q.id);
                      return (
                        <button 
                          key={q.id} 
                          className={`palette-btn status-${status}`}
                          onClick={() => scrollToQuestion(q.id)}
                        >{idx + 1}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {view === 'exam' && (
                <button className="btn-primary w-100 mt-4" disabled={isSubmitting} onClick={requestSubmitExam}>
                  {isSubmitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              )}
           </div>
        </div>
        )}
      </div>
    </div>
    </>
  );
}
