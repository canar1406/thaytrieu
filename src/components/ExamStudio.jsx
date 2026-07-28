import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './ExamStudio.css';

const PARTS = [
  { key: 'part1_multipleChoice', label: 'Phần I', name: 'Trắc nghiệm', prefix: 'p1' },
  { key: 'part2_trueFalse', label: 'Phần II', name: 'Đúng / Sai', prefix: 'p2' },
  { key: 'part3_shortAnswer', label: 'Phần III', name: 'Trả lời ngắn', prefix: 'p3' }
];

const DEFAULT_SETTINGS = {
  duration: 90,
  passingScore: 5,
  viewMode: 'all',
  shuffleQuestions: false,
  shuffleOptions: false,
  showResult: true,
  allowReview: true,
  autoSave: true,
  instructions: 'Đọc kỹ câu hỏi, kiểm tra đáp án trước khi nộp bài.'
};

const emptyData = () => ({
  part1_multipleChoice: [],
  part2_trueFalse: [],
  part3_shortAnswer: []
});

const makeId = prefix => `${prefix}_${crypto.randomUUID()}`;

const makeQuestion = part => {
  if (part.key === 'part1_multipleChoice') {
    return {
      id: makeId(part.prefix),
      question: 'Nhập nội dung câu hỏi',
      options: ['A', 'B', 'C', 'D'].map((key, index) => ({
        key,
        text: `Phương án ${key}`,
        isCorrect: index === 0
      }))
    };
  }
  if (part.key === 'part2_trueFalse') {
    return {
      id: makeId(part.prefix),
      question: 'Nhập nội dung câu hỏi',
      statements: ['a', 'b', 'c', 'd'].map(id => ({
        id,
        text: `Mệnh đề ${id})`,
        isTrue: false
      }))
    };
  }
  return {
    id: makeId(part.prefix),
    question: 'Nhập nội dung câu hỏi',
    correctAnswer: ''
  };
};

const Markdown = ({ children }) => (
  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
    {children || ''}
  </ReactMarkdown>
);

function ExamPreview({ exam }) {
  const data = exam.data || emptyData();
  const settings = { ...DEFAULT_SETTINGS, ...exam.settings };
  const total = PARTS.reduce((sum, part) => sum + (data[part.key]?.length || 0), 0);

  return (
    <div className="studio-preview-shell">
      <div className="studio-preview-top">
        <div>
          <span>XEM TRƯỚC GIAO DIỆN HỌC SINH</span>
          <h3>{exam.title || 'Đề thi chưa đặt tên'}</h3>
        </div>
        <div className="studio-preview-meta"><b>◷ {settings.duration} phút</b><b>{total} câu</b></div>
      </div>
      {settings.instructions && <div className="studio-preview-note">ℹ {settings.instructions}</div>}
      <div className="studio-preview-layout">
        <div className="studio-preview-paper">
          {PARTS.map(part => {
            const questions = data[part.key] || [];
            if (!questions.length) return null;
            return (
              <section key={part.key}>
                <header><strong>{part.label}. {part.name}</strong><span>{questions.length} câu</span></header>
                {questions.map((question, index) => (
                  <article key={question.id}>
                    <div className="studio-preview-question"><b>Câu {index + 1}:</b> <Markdown>{question.question}</Markdown></div>
                    {part.key === 'part1_multipleChoice' && (
                      <div className="studio-preview-options">{question.options?.map(option => (
                        <div className={option.isCorrect ? 'answer-key' : ''} key={option.key}><b>{option.key}.</b><Markdown>{option.text}</Markdown>{option.isCorrect && <span>Đáp án</span>}</div>
                      ))}</div>
                    )}
                    {part.key === 'part2_trueFalse' && (
                      <div className="studio-preview-statements">{question.statements?.map(statement => (
                        <div key={statement.id}><span><b>{statement.id})</b> <Markdown>{statement.text}</Markdown></span><em className={statement.isTrue ? 'true' : 'false'}>{statement.isTrue ? 'Đúng' : 'Sai'}</em></div>
                      ))}</div>
                    )}
                    {part.key === 'part3_shortAnswer' && <div className="studio-preview-answer">Đáp án mẫu: <b>{question.correctAnswer || 'Chưa nhập'}</b></div>}
                  </article>
                ))}
              </section>
            );
          })}
          {!total && <div className="studio-preview-empty"><span>📝</span><strong>Chưa có câu hỏi</strong><p>Thêm câu hỏi ở tab Nội dung để xem trước đề thi.</p></div>}
        </div>
        <aside className="studio-preview-palette">
          <strong>Bảng câu hỏi</strong>
          {PARTS.map(part => {
            const questions = data[part.key] || [];
            return questions.length ? <div key={part.key}><span>{part.label}</span><div>{questions.map((question, index) => <b key={question.id}>{index + 1}</b>)}</div></div> : null;
          })}
        </aside>
      </div>
    </div>
  );
}

function QuestionEditor({ part, question, index, onUpdate, onDelete, onDuplicate }) {
  const setField = (field, value) => onUpdate({ ...question, [field]: value });
  return (
    <div className="studio-question-editor">
      <div className="studio-editor-heading">
        <div><span>{part.label} · {part.name}</span><h3>Câu {index + 1}</h3></div>
        <div><button type="button" onClick={onDuplicate}>Nhân bản</button><button type="button" className="danger" onClick={onDelete}>Xóa câu</button></div>
      </div>
      <label className="studio-field">
        <span>Nội dung câu hỏi <small>Hỗ trợ công thức LaTeX bằng dấu $...$</small></span>
        <textarea rows={4} value={question.question || ''} onChange={event => setField('question', event.target.value)} />
      </label>
      <div className="studio-math-preview"><span>Xem nhanh</span><Markdown>{question.question}</Markdown></div>

      {part.key === 'part1_multipleChoice' && (
        <div className="studio-answer-editor">
          <div className="studio-answer-head"><strong>Phương án trả lời</strong><span>Chọn vòng tròn bên trái để đặt đáp án đúng</span></div>
          {question.options?.map((option, optionIndex) => (
            <div className="studio-option-row" key={option.key}>
              <input aria-label={`Đặt ${option.key} là đáp án đúng`} type="radio" name={`correct-${question.id}`} checked={option.isCorrect === true} onChange={() => setField('options', question.options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === optionIndex })))} />
              <b>{option.key}</b>
              <input value={option.text || ''} onChange={event => setField('options', question.options.map((item, itemIndex) => itemIndex === optionIndex ? { ...item, text: event.target.value } : item))} />
            </div>
          ))}
        </div>
      )}

      {part.key === 'part2_trueFalse' && (
        <div className="studio-answer-editor">
          <div className="studio-answer-head"><strong>Các mệnh đề</strong><span>Chỉnh nội dung và đáp án Đúng/Sai</span></div>
          {question.statements?.map((statement, statementIndex) => (
            <div className="studio-statement-row" key={statement.id}>
              <b>{statement.id})</b>
              <input value={statement.text || ''} onChange={event => setField('statements', question.statements.map((item, itemIndex) => itemIndex === statementIndex ? { ...item, text: event.target.value } : item))} />
              <div>
                <button type="button" className={statement.isTrue ? 'selected true' : ''} onClick={() => setField('statements', question.statements.map((item, itemIndex) => itemIndex === statementIndex ? { ...item, isTrue: true } : item))}>Đúng</button>
                <button type="button" className={statement.isTrue === false ? 'selected false' : ''} onClick={() => setField('statements', question.statements.map((item, itemIndex) => itemIndex === statementIndex ? { ...item, isTrue: false } : item))}>Sai</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {part.key === 'part3_shortAnswer' && (
        <label className="studio-field studio-correct-answer">
          <span>Đáp án đúng</span>
          <input value={question.correctAnswer || ''} onChange={event => setField('correctAnswer', event.target.value)} placeholder="Ví dụ: 12" />
        </label>
      )}
    </div>
  );
}

export default function ExamStudio({ exam, onChange, onBack, onSave, onFileSelect, isSaving, notice, error }) {
  const [tab, setTab] = useState('content');
  const [selected, setSelected] = useState(null);
  const data = useMemo(() => ({ ...emptyData(), ...exam.data }), [exam.data]);
  const settings = { ...DEFAULT_SETTINGS, ...exam.settings };
  const total = PARTS.reduce((sum, part) => sum + data[part.key].length, 0);
  const selectedPart = PARTS.find(part => part.key === selected?.partKey);
  const selectedQuestion = selectedPart ? data[selectedPart.key][selected.index] : null;

  useEffect(() => {
    if (selectedQuestion) return;
    const firstPart = PARTS.find(part => data[part.key].length);
    setSelected(firstPart ? { partKey: firstPart.key, index: 0 } : null);
  }, [data, selectedQuestion]);

  const changeData = nextData => onChange({ ...exam, data: nextData });
  const updateSettings = patch => onChange({ ...exam, settings: { ...settings, ...patch }, time: patch.duration ?? settings.duration });

  const addQuestion = part => {
    const nextItems = [...data[part.key], makeQuestion(part)];
    changeData({ ...data, [part.key]: nextItems });
    setSelected({ partKey: part.key, index: nextItems.length - 1 });
    setTab('content');
  };

  const updateQuestion = nextQuestion => {
    changeData({
      ...data,
      [selectedPart.key]: data[selectedPart.key].map((question, index) => index === selected.index ? nextQuestion : question)
    });
  };

  const deleteQuestion = () => {
    if (!confirm(`Xóa câu ${selected.index + 1} của ${selectedPart.label}?`)) return;
    const nextItems = data[selectedPart.key].filter((_, index) => index !== selected.index);
    changeData({ ...data, [selectedPart.key]: nextItems });
    setSelected(nextItems.length ? { partKey: selectedPart.key, index: Math.min(selected.index, nextItems.length - 1) } : null);
  };

  const duplicateQuestion = () => {
    const duplicate = {
      ...structuredClone(selectedQuestion),
      id: makeId(selectedPart.prefix)
    };
    const nextItems = [...data[selectedPart.key]];
    nextItems.splice(selected.index + 1, 0, duplicate);
    changeData({ ...data, [selectedPart.key]: nextItems });
    setSelected({ partKey: selectedPart.key, index: selected.index + 1 });
  };

  return (
    <section className="exam-studio" aria-labelledby="exam-studio-title">
      <header className="exam-studio-header">
        <div>
          <button type="button" className="exam-studio-back" onClick={onBack}>← Ngân hàng đề</button>
          <p>EXAM STUDIO</p>
          <h2 id="exam-studio-title">{exam.title || 'Đề thi mới'}</h2>
        </div>
        <div className="exam-studio-actions">
          <label className="exam-studio-upload">
            <input type="file" accept=".json,.md,application/json,text/markdown" onChange={event => { onFileSelect(event.target.files?.[0]); event.target.value = ''; }} />
            <span>↑ Tải đề từ file</span>
          </label>
          <button type="button" className="btn-primary" disabled={isSaving || !total} onClick={onSave}>{isSaving ? 'Đang lưu…' : 'Lưu & xuất bản'}</button>
        </div>
      </header>

      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-form-error" role="alert">{error}</p>}

      <div className="exam-studio-summary">
        <label><span>Tên đề thi</span><input value={exam.title || ''} onChange={event => onChange({ ...exam, title: event.target.value })} placeholder="Nhập tên đề thi…" /></label>
        <div><span>Tổng câu</span><strong>{total}</strong></div>
        <div><span>Thời gian</span><strong>{settings.duration}′</strong></div>
        <div><span>Loại câu</span><strong>{PARTS.filter(part => data[part.key].length).length}/3</strong></div>
        <div className={total ? 'ready' : ''}><span>Trạng thái</span><strong>{total ? 'Sẵn sàng' : 'Đề trống'}</strong></div>
      </div>

      <nav className="exam-studio-tabs" aria-label="Chức năng chỉnh sửa đề">
        <button type="button" className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>✎ Nội dung</button>
        <button type="button" className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>⚙ Cấu hình</button>
        <button type="button" className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>◉ Xem trước</button>
      </nav>

      {tab === 'content' && (
        <div className="exam-studio-workspace">
          <aside className="exam-studio-outline">
            <div className="studio-outline-title"><strong>Cấu trúc đề</strong><span>{total} câu</span></div>
            {PARTS.map(part => (
              <section key={part.key}>
                <header><div><b>{part.label}</b><span>{part.name}</span></div><button type="button" aria-label={`Thêm câu ${part.name}`} onClick={() => addQuestion(part)}>+</button></header>
                <div>{data[part.key].map((question, index) => (
                  <button type="button" className={selected?.partKey === part.key && selected.index === index ? 'active' : ''} key={question.id} onClick={() => setSelected({ partKey: part.key, index })}>
                    <b>{index + 1}</b><span>{question.question || 'Câu hỏi chưa có nội dung'}</span>
                  </button>
                ))}</div>
              </section>
            ))}
          </aside>
          <main className="exam-studio-canvas">
            {selectedQuestion ? (
              <QuestionEditor part={selectedPart} question={selectedQuestion} index={selected.index} onUpdate={updateQuestion} onDelete={deleteQuestion} onDuplicate={duplicateQuestion} />
            ) : (
              <div className="studio-create-empty">
                <span>✦</span><h3>Tạo đề thi đầu tiên</h3><p>Tải file có sẵn hoặc tự thêm câu hỏi theo từng dạng bên dưới.</p>
                <div>{PARTS.map(part => <button type="button" key={part.key} onClick={() => addQuestion(part)}><b>+ {part.name}</b><small>{part.key === 'part1_multipleChoice' ? '4 phương án, 1 đáp án đúng' : part.key === 'part2_trueFalse' ? '4 mệnh đề Đúng/Sai' : 'Nhập đáp án ngắn để chấm tự động'}</small></button>)}</div>
              </div>
            )}
          </main>
        </div>
      )}

      {tab === 'settings' && (
        <div className="exam-studio-settings">
          <section>
            <div className="studio-settings-heading"><span>◷</span><div><h3>Thời gian & cách làm bài</h3><p>Thiết lập trải nghiệm làm bài cho học sinh.</p></div></div>
            <div className="studio-settings-grid">
              <label><span>Thời gian làm bài (phút)</span><input type="number" min="5" max="300" value={settings.duration} onChange={event => updateSettings({ duration: Math.max(5, Number(event.target.value) || 5) })} /></label>
              <label><span>Điểm đạt</span><input type="number" min="0" max="10" step=".5" value={settings.passingScore} onChange={event => updateSettings({ passingScore: Number(event.target.value) })} /></label>
              <label><span>Kiểu hiển thị</span><select value={settings.viewMode} onChange={event => updateSettings({ viewMode: event.target.value })}><option value="all">Hiện toàn bộ câu hỏi</option><option value="single">Mỗi lần một câu</option></select></label>
            </div>
          </section>
          <section>
            <div className="studio-settings-heading"><span>⇄</span><div><h3>Trộn đề & kết quả</h3><p>Các lựa chọn tương tự luồng thi trực tuyến phổ biến.</p></div></div>
            <div className="studio-toggle-list">
              {[
                ['shuffleQuestions', 'Đảo thứ tự câu hỏi', 'Mỗi học sinh nhận thứ tự câu khác nhau.'],
                ['shuffleOptions', 'Đảo phương án trả lời', 'Chỉ áp dụng cho câu trắc nghiệm A/B/C/D.'],
                ['showResult', 'Cho xem kết quả sau khi nộp', 'Hiện điểm, đáp án đúng và phần làm sai.'],
                ['allowReview', 'Cho phép quay lại câu trước', 'Tắt nếu muốn học sinh làm tuần tự.'],
                ['autoSave', 'Tự động lưu bài trên thiết bị', 'Giúp khôi phục khi tải lại trang hoặc mất mạng ngắn.']
              ].map(([key, title, description]) => (
                <label key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={settings[key]} onChange={event => updateSettings({ [key]: event.target.checked })} /></label>
              ))}
            </div>
          </section>
          <section>
            <div className="studio-settings-heading"><span>i</span><div><h3>Hướng dẫn thí sinh</h3><p>Nội dung xuất hiện trước và trong lúc làm bài.</p></div></div>
            <label className="studio-field"><textarea rows={4} value={settings.instructions} onChange={event => updateSettings({ instructions: event.target.value })} placeholder="Nhập hướng dẫn làm bài…" /></label>
          </section>
        </div>
      )}

      {tab === 'preview' && <ExamPreview exam={{ ...exam, data, settings }} />}
    </section>
  );
}
