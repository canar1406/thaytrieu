const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/CoursePage.jsx');
let srcCode = fs.readFileSync(filePath, 'utf-8');

// 1. Remove coursesDatabase entirely and the helper
srcCode = srcCode.replace(/const coursesDatabase = \{[\s\S]*?\n\};\n\nconst getCourseDataById = \(courseId\) => \{\n  return coursesDatabase\[courseId\] \|\| coursesDatabase\['1'\];\n\};\n/, '');

// 2. Replace the start of CoursePage component
srcCode = srcCode.replace(
  /const CoursePage = \(\) => \{\n  const \{ id \} = useParams\(\);\n  const navigate = useNavigate\(\);\n  \n  const dummyCourseData = getCourseDataById\(id \|\| '1'\);/,
  `const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dummyCourseData, setDummyCourseData] = useState(null);
  const [registeredCoursesList, setRegisteredCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(\`/data/courses/course-\${id || '1'}.json\`).then(r => r.json()),
      fetch(\`/data/courses/course-list.json\`).then(r => r.json())
    ])
    .then(([courseData, courseList]) => {
      setDummyCourseData(courseData);
      setRegisteredCoursesList(courseList);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);`
);

// 3. Add loading state before calculate overall progress
srcCode = srcCode.replace(
  /  \/\/ Calculate overall progress\n  const allItems = dummyCourseData\.sections\.flatMap\(sec => sec\.items\);/,
  `  if (isLoading) {
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
  const allItems = dummyCourseData.sections.flatMap(sec => sec.items);`
);

// 4. Update getDynamicProgress and registeredCoursesList calculation
srcCode = srcCode.replace(
  /  const getDynamicProgress = \(courseId, staticProgress\) => \{\n    if \(courseId === \(id \|\| '1'\)\) return progressPercent;\n    const course = coursesDatabase\[courseId\];\n    if \(\!course \|\| \!course\.sections\) return staticProgress;\n    const all = course\.sections\.flatMap\(sec => sec\.items\);\n    if \(all\.length === 0\) return staticProgress;\n    const saved = localStorage\.getItem\(`completed_\$\{courseId\}`\);\n    if \(\!saved\) return staticProgress;\n    const compSet = new Set\(JSON\.parse\(saved\)\);\n    return Math\.round\(\(compSet\.size \/ all\.length\) \* 100\);\n  \};\n\n  const registeredCoursesList = Object\.entries\(coursesDatabase\)\.map\(\(\[cId, data\]\) => \(\{\n    id: cId,\n    title: data\.title,\n    progress: getDynamicProgress\(cId, data\.progress\)\n  \}\)\);/,
  `  const getDynamicProgress = (courseId, staticProgress, totalLessons) => {
    if (courseId === (id || '1')) return progressPercent;
    if (!totalLessons) return staticProgress;
    const saved = localStorage.getItem(\`completed_\${courseId}\`);
    if (!saved) return staticProgress;
    const compSet = new Set(JSON.parse(saved));
    return Math.round((compSet.size / totalLessons) * 100);
  };

  const dynamicCoursesList = registeredCoursesList.map(course => ({
    ...course,
    progress: getDynamicProgress(course.id, course.progress, course.totalLessons)
  }));`
);

// 5. Replace mapped list with dynamicCoursesList
srcCode = srcCode.replace(
  /\{registeredCoursesList\.map\(course => \(/,
  `{dynamicCoursesList.map(course => (`
);

fs.writeFileSync(filePath, srcCode, 'utf-8');
console.log('CoursePage.jsx updated successfully.');
