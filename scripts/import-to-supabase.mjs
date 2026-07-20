import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = path.resolve(import.meta.dirname, '..');
const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.');
const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const read = file => JSON.parse(fs.readFileSync(path.join(root, 'private', 'data', file), 'utf8'));

const courseList = read('courses/course-list.json');
for (const item of courseList) {
  const detail = read(`courses/course-${item.id}.json`);
  const { id, title, desc, ...content } = detail;
  const { error } = await db.from('courses').upsert({ id: Number(id), title, description: desc || '', content });
  if (error) throw error;
}

const exams = read('exams.json');
for (const { id, title, ...payload } of exams) {
  const { error } = await db.from('exams').upsert({ id: String(id), title, payload });
  if (error) throw error;
}

const credentials = [];
for (const old of read('users.json')) {
  const password = crypto.randomBytes(9).toString('base64url');
  let authUser = (await db.auth.admin.listUsers()).data.users.find(u => u.email?.toLowerCase() === old.email.toLowerCase());
  if (!authUser) {
    const created = await db.auth.admin.createUser({ email: old.email, password, email_confirm: true, user_metadata: { name: old.name } });
    if (created.error) throw created.error;
    authUser = created.data.user;
    credentials.push({ email: old.email, temporaryPassword: password });
  }
  const { error: profileError } = await db.from('profiles').upsert({ id: authUser.id, email: old.email, name: old.name, role: old.role === 'admin' ? 'admin' : 'student' });
  if (profileError) throw profileError;
  await db.from('course_enrollments').delete().eq('user_id', authUser.id);
  const allowed = (old.allowedCourses || []).map(Number).filter(Number.isInteger);
  if (old.role !== 'admin' && allowed.length) {
    const { error } = await db.from('course_enrollments').insert(allowed.map(course_id => ({ user_id: authUser.id, course_id })));
    if (error) throw error;
  }
}

console.log('Import complete. Temporary credentials for newly-created accounts:');
console.table(credentials);
