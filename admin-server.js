import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'public', 'data');
const coursesPath = path.join(dataPath, 'courses');

// Helpers
const readJson = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
};
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJson(path.join(dataPath, 'users.json')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user && user.role === 'admin') {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu, hoặc bạn không có quyền Admin.' });
  }
});

// Users
app.get('/api/users', (req, res) => {
  res.json(readJson(path.join(dataPath, 'users.json')) || []);
});
app.post('/api/users', (req, res) => {
  writeJson(path.join(dataPath, 'users.json'), req.body);
  res.json({ success: true });
});

// Courses
app.get('/api/courses', (req, res) => {
  res.json(readJson(path.join(coursesPath, 'course-list.json')) || []);
});
app.post('/api/courses', (req, res) => {
  writeJson(path.join(coursesPath, 'course-list.json'), req.body);
  res.json({ success: true });
});

// Single Course Detail
app.get('/api/courses/:id', (req, res) => {
  const courseId = req.params.id;
  const data = readJson(path.join(coursesPath, `course-${courseId}.json`));
  if (data) res.json(data);
  else res.status(404).json({ error: 'Not found' });
});
app.post('/api/courses/:id', (req, res) => {
  const courseId = req.params.id;
  writeJson(path.join(coursesPath, `course-${courseId}.json`), req.body);
  res.json({ success: true });
});

// Delete Course
app.delete('/api/courses/:id', (req, res) => {
  const courseId = req.params.id;
  const filePath = path.join(coursesPath, `course-${courseId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

// Exams
app.get('/api/exams', (req, res) => {
  res.json(readJson(path.join(dataPath, 'exams.json')) || []);
});
app.post('/api/exams', (req, res) => {
  writeJson(path.join(dataPath, 'exams.json'), req.body);
  res.json({ success: true });
});

// Github Push
app.post('/api/github-push', (req, res) => {
  console.log('Starting GitHub Push...');
  exec('git add . && (git commit -m "Admin Update Data" || true) && git push', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Admin Server is running on http://localhost:${PORT}`);
});
