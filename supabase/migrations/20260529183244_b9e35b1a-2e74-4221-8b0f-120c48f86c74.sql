
-- Ensure pgcrypto is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Seed admin user directly into auth.users (idempotent)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'silvio@nuevoshechos.com';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'silvio@nuevoshechos.com', extensions.crypt('123456', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Silvio"}'::jsonb,
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'silvio@nuevoshechos.com'),
      'email', admin_id::text, now(), now(), now()
    );
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (admin_id, 'Silvio', 'silvio@nuevoshechos.com')
  ON CONFLICT DO NOTHING;

  -- Ensure admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
