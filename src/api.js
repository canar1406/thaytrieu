import { supabase, isSupabaseConfigured } from './supabase';

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' }
});
const result = ({ data, error }, transform = value => value) => error
  ? jsonResponse({ error: error.message }, error.status || 400)
  : jsonResponse(transform(data));
const requireClient = () => {
  if (!isSupabaseConfigured) throw new Error('Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.');
};

async function currentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('id,email,name,role').eq('id', user.id).single();
  if (!data) return null;
  const { data: enrollments } = await supabase.from('course_enrollments').select('course_id').eq('user_id', user.id);
  return { ...data, allowedCourses: (enrollments || []).map(e => String(e.course_id)) };
}

export const getToken = () => isSupabaseConfigured;

export async function apiFetch(path, options = {}) {
  try { requireClient(); } catch (error) { return jsonResponse({ error: error.message, message: error.message }, 503); }
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : undefined;

  if (path === '/login' && method === 'POST') {
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) return jsonResponse({ success: false, message: 'Email hoặc mật khẩu không chính xác.' }, 401);
    const user = await currentProfile();
    return jsonResponse({ success: true, token: data.session.access_token, user });
  }
  if (path === '/logout' && method === 'POST') { await supabase.auth.signOut(); return jsonResponse({ success: true }); }
  if (path === '/me') {
    const user = await currentProfile();
    return user ? jsonResponse({ user }) : jsonResponse({ error: 'Chưa đăng nhập.' }, 401);
  }
  if (path === '/catalog') {
    return result(await supabase.from('course_catalog').select('id,title,description,section_count'), rows => rows.map(r => ({ ...r, desc: r.description })));
  }
  if (path === '/courses' && method === 'GET') {
    return result(await supabase.from('courses').select('id,title,description,content'), rows => rows.map(r => ({
      id: String(r.id), title: r.title, desc: r.description,
      totalLessons: (r.content?.sections || []).reduce((n, s) => n + (s.items?.length || 0), 0)
    })));
  }
  const courseMatch = path.match(/^\/courses\/(\d+)$/);
  if (courseMatch && method === 'GET') {
    return result(await supabase.from('courses').select('id,title,description,content').eq('id', courseMatch[1]).single(), r => ({
      ...(r.content || {}), id: String(r.id), title: r.title, desc: r.description
    }));
  }
  if (path === '/courses' && method === 'POST') {
    const rows = body.map(c => ({ id: Number(c.id), title: c.title, description: c.desc || '' }));
    return result(await supabase.from('courses').upsert(rows), () => ({ success: true }));
  }
  if (courseMatch && method === 'POST') {
    const { id, title, desc, ...content } = body;
    return result(await supabase.from('courses').upsert({ id: Number(courseMatch[1]), title, description: desc || '', content }), () => ({ success: true }));
  }
  if (courseMatch && method === 'DELETE') return result(await supabase.from('courses').delete().eq('id', courseMatch[1]), () => ({ success: true }));

  if (path === '/users' && method === 'GET') {
    const profiles = await supabase.from('profiles').select('id,email,name,role');
    if (profiles.error) return result(profiles);
    const enrollments = await supabase.from('course_enrollments').select('user_id,course_id');
    return result(enrollments, rows => profiles.data.map(p => ({ ...p, password: '', allowedCourses: rows.filter(e => e.user_id === p.id).map(e => String(e.course_id)) })));
  }
  if (path === '/users' && method === 'POST') {
    const response = await supabase.functions.invoke('admin-users', { body: { users: body } });
    return result(response, data => data);
  }
  if (path === '/exams' && method === 'GET') return result(await supabase.from('exams').select('id,title,payload'), rows => rows.map(r => ({ id: r.id, title: r.title, ...r.payload })));
  if (path === '/exams' && method === 'POST') {
    return result(await supabase.from('exams').upsert(body.map(({ id, title, ...payload }) => ({ id: String(id), title, payload }))), () => ({ success: true }));
  }
  if (path === '/github-push') return jsonResponse({ success: true, message: 'Supabase cập nhật trực tiếp; không cần Git push.' });
  return jsonResponse({ error: 'API không tồn tại.' }, 404);
}
