import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:e2QrgD9bqE6D082h@db.wmomtsrqmfgdlyhopume.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  const result = await client.query(`
    DO $$
    DECLARE
      v_user_id uuid;
      v_temp_password text := 'BellyAdmin2024!';
    BEGIN
      -- Check if user already exists
      SELECT id INTO v_user_id FROM auth.users WHERE email = 'orelfitch@gmail.com';

      IF v_user_id IS NULL THEN
        -- Create new confirmed user
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
          id, instance_id, aud, role, email,
          encrypted_password,
          email_confirmed_at, created_at, updated_at,
          raw_app_meta_data, raw_user_meta_data,
          is_super_admin, confirmation_token,
          recovery_token, email_change_token_new, email_change
        ) VALUES (
          v_user_id,
          '00000000-0000-0000-0000-000000000000',
          'authenticated', 'authenticated',
          'orelfitch@gmail.com',
          crypt(v_temp_password, gen_salt('bf', 10)),
          now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{}',
          false, '', '', '', ''
        );
        RAISE NOTICE 'Created new user: %', v_user_id;
      ELSE
        -- Update existing user: confirm email + reset password
        UPDATE auth.users
        SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
            encrypted_password = crypt(v_temp_password, gen_salt('bf', 10)),
            updated_at = now()
        WHERE id = v_user_id;
        RAISE NOTICE 'Updated existing user: %', v_user_id;
      END IF;

      -- Ensure profile exists and onboarding is complete
      INSERT INTO public.profiles (user_id, onboarding_completed, first_name, pregnancy_number, has_provider)
      VALUES (v_user_id, true, 'Orel', 1, false)
      ON CONFLICT (user_id) DO UPDATE
        SET onboarding_completed = true,
            first_name = COALESCE(NULLIF(profiles.first_name, ''), 'Orel');

      -- Grant admin role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_user_id, 'admin')
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Admin setup complete for orelfitch@gmail.com';
    END;
    $$;
  `);
  console.log('✅ Admin user created/updated successfully.');
  console.log('   Email:    orelfitch@gmail.com');
  console.log('   Password: BellyAdmin2024!');
  console.log('   Role:     admin');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
