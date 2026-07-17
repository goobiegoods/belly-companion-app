import pg from 'pg';
const { Client } = pg;
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL env var is required. Set it before running, e.g.:');
  console.error('   DATABASE_URL=postgresql://... node scripts/check-admin.mjs');
  process.exit(1);
}
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const { rows } = await client.query(`
  SELECT u.id, u.email, u.email_confirmed_at, p.onboarding_completed, r.role
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  WHERE u.email = 'orelfitch@gmail.com'
`);
console.log('Admin user check:', JSON.stringify(rows, null, 2));
if (rows.length === 0) {
  console.log('❌ User not found');
} else if (!rows[0].role) {
  console.log('❌ No admin role — fixing now...');
  await client.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`, [rows[0].id]);
  console.log('✅ Admin role added');
} else {
  console.log('✅ User exists with role:', rows[0].role);
}
await client.end();
