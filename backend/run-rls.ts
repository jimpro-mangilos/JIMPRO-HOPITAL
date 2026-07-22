import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const URL = 'https://xgagzyplhdbvtjcnvmdm.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYWd6eXBsaGRidnRqY252bWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEyNDYwNSwiZXhwIjoyMDk5NzAwNjA1fQ.jc9P2REn80xF15bF1OAiN5Ql02w9VSP2QKS5Ei1eByM';

async function syncAuth() {
  // 1. Delete all existing auth users
  const r = await fetch(`${URL}/auth/v1/admin/users?per_page=100`, { headers: { Authorization: `Bearer ${KEY}`, apikey: KEY } });
  const d = await r.json();
  for (const u of (d.users || [])) {
    await fetch(`${URL}/auth/v1/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${KEY}`, apikey: KEY } });
  }
  console.log('🧹 Auth users nettoyés');

  // 2. Get all public users and create matching auth users
  const publicUsers = await p.user.findMany({ include: { staff: true } });
  for (const u of publicUsers) {
    const res = await fetch(`${URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}`, apikey: KEY },
      body: JSON.stringify({ id: u.id, email: u.email, password: 'Admin@123', email_confirm: true }),
    });
    console.log(`${res.ok ? '✅' : '⚠️'} ${u.email}`);
  }

  console.log('\n✅ Auth synchronisé ! admin@jimpro-hopital.com / Admin@123');
  await p.$disconnect();
}
syncAuth();
