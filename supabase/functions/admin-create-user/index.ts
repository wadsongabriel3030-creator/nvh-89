import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Role = 'admin' | 'mini_admin' | 'pastor' | 'leader' | 'server' | 'member';

const UI_TO_DB: Record<string, Role> = {
  admin: 'admin',
  mini_admin: 'mini_admin',
  miniadmin: 'mini_admin',
  pastor: 'pastor',
  lider: 'leader',
  leader: 'leader',
  servidor: 'server',
  server: 'server',
  member: 'member',
  miembro: 'member',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Allow admin OR mini_admin to create accounts
    const { data: callerRoles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const callerRoleSet = new Set((callerRoles ?? []).map((r: any) => r.role));
    const isAdminOrMini = callerRoleSet.has('admin') || callerRoleSet.has('mini_admin');

    if (!isAdminOrMini) {
      return new Response(JSON.stringify({ error: 'Solo administradores y mini-administradores' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim();
    const roleInput = String(body.role ?? 'member').toLowerCase();
    const permissions: string[] = Array.isArray(body.permissions) ? body.permissions : [];
    const memberId: string | null = body.member_id ?? null;
    const role: Role = UI_TO_DB[roleInput] ?? 'member';

    // Validate email domain
    if (!email.endsWith('@nuevoshechos.gt')) {
      return new Response(JSON.stringify({ error: 'Solo se aceptan correos @nuevoshechos.gt' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Email y contraseña (>=6) requeridos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent mini_admin from creating admin accounts
    if (role === 'admin' && !callerRoleSet.has('admin')) {
      return new Response(JSON.stringify({ error: 'Solo el Apóstol puede crear cuentas de Administrador' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Require member_id
    if (!memberId) {
      return new Response(JSON.stringify({ error: 'Debe seleccionar un miembro registrado' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { display_name: name || email.split('@')[0] },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? 'No se pudo crear' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const newId = created.user.id;

    // Replace default 'member' role from trigger with the requested one
    await admin.from('user_roles').delete().eq('user_id', newId);
    await admin.from('user_roles').insert({ user_id: newId, role });

    // Permissions row with member_id
    await admin.from('user_permissions').upsert({
      user_id: newId,
      display_name: name || email.split('@')[0],
      permissions,
      member_id: memberId,
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({ ok: true, user_id: newId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
