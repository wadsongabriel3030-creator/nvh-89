import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Allow admin OR mini_admin to delete accounts
    const { data: callerRoles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const callerRoleSet = new Set((callerRoles ?? []).map((r: any) => r.role));
    const isAdminOrMini = callerRoleSet.has('admin') || callerRoleSet.has('mini_admin');

    if (!isAdminOrMini) {
      return new Response(JSON.stringify({ error: 'Solo administradores y mini-administradores' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'user_id requerido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (user_id === userData.user.id) {
      return new Response(JSON.stringify({ error: 'No puede eliminarse a sí mismo' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // If caller is mini_admin (not admin), prevent deleting admin or other mini_admins
    if (!callerRoleSet.has('admin')) {
      const { data: targetRoles } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', user_id);
      const targetRoleSet = new Set((targetRoles ?? []).map((r: any) => r.role));
      if (targetRoleSet.has('admin') || targetRoleSet.has('mini_admin')) {
        return new Response(JSON.stringify({ error: 'No tiene permisos para eliminar este usuario' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
