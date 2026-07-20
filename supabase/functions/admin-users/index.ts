import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async req => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const authHeader = req.headers.get('Authorization') || '';
    const callerClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: callerProfile } = await service.from('profiles').select('role').eq('id', caller.id).single();
    if (callerProfile?.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });

    const { users } = await req.json();
    if (!Array.isArray(users) || users.length > 1000) throw new Error('Invalid users payload');
    const keepIds = new Set<string>([caller.id]);

    for (const input of users) {
      const email = String(input.email || '').trim().toLowerCase();
      const name = String(input.name || '').trim().slice(0, 100);
      const role = input.role === 'admin' ? 'admin' : 'student';
      let id = String(input.id || '');
      if (id.startsWith('new-')) {
        if (!email || String(input.password || '').length < 8) throw new Error(`Tài khoản ${email || 'mới'} cần mật khẩu tối thiểu 8 ký tự`);
        const created = await service.auth.admin.createUser({ email, password: String(input.password), email_confirm: true, user_metadata: { name } });
        if (created.error) throw created.error;
        id = created.data.user.id;
      } else {
        const attrs: Record<string, unknown> = { email, user_metadata: { name } };
        if (input.password) attrs.password = String(input.password);
        const updated = await service.auth.admin.updateUserById(id, attrs);
        if (updated.error) throw updated.error;
      }
      keepIds.add(id);
      const profile = await service.from('profiles').upsert({ id, email, name, role });
      if (profile.error) throw profile.error;
      await service.from('course_enrollments').delete().eq('user_id', id);
      const courseIds = [...new Set((input.allowedCourses || []).map(Number).filter(Number.isInteger))];
      if (role === 'student' && courseIds.length) {
        const enrolled = await service.from('course_enrollments').insert(courseIds.map(course_id => ({ user_id: id, course_id })));
        if (enrolled.error) throw enrolled.error;
      }
    }

    const { data: existing } = await service.from('profiles').select('id');
    for (const profile of existing || []) {
      if (!keepIds.has(profile.id)) await service.auth.admin.deleteUser(profile.id);
    }
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
  }
});
