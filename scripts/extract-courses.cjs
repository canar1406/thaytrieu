const fs = require('fs');
const path = require('path');

const srcCode = fs.readFileSync(path.join(__dirname, '../src/pages/CoursePage.jsx'), 'utf-8');

const match = srcCode.match(/const coursesDatabase = (\{[\s\S]*?\n\});\n\nconst getCourseDataById/);
if (match && match[1]) {
  const code = match[1];
  let coursesDatabase;
  eval(`coursesDatabase = ${code}`);

  const outputDir = path.join(__dirname, '../public/data/courses');
  
  const courseList = Object.entries(coursesDatabase).map(([id, data]) => ({
    id,
    title: data.title,
    progress: data.progress,
    totalLessons: data.totalLessons
  }));
  
  fs.writeFileSync(
    path.join(outputDir, `course-list.json`),
    JSON.stringify(courseList, null, 2)
  );
  console.log(`Extracted course-list.json`);
}
