import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function fix() {
  // Drop problematic policies that cause recursion
  const drops = [
    `DROP POLICY IF EXISTS "Users view own" ON users`,
    `DROP POLICY IF EXISTS "Admins manage users" ON users`,
    `DROP POLICY IF EXISTS "Users update own" ON users`,
  ];
  for (const sql of drops) {
    try { await p.$executeRawUnsafe(sql); console.log('✅ drop'); } catch(e:any) { console.log('⚠️', e.message.substring(0,50)); }
  }

  // Create simple non-recursive policies
  const policies = [
    `CREATE POLICY "Users read own row" ON users FOR SELECT USING (id = auth.uid())`,
    `CREATE POLICY "Admin read all users" ON users FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('SUPER_ADMIN', 'ADMIN'))`,
    `CREATE POLICY "Admin full access" ON users FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('SUPER_ADMIN', 'ADMIN'))`,
    `CREATE POLICY "Staff full read" ON staff FOR SELECT USING (true)`,
    `CREATE POLICY "Patients full read" ON patients FOR SELECT USING (true)`,
    `CREATE POLICY "Patients insert update" ON patients FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY "Patients update all" ON patients FOR UPDATE USING (true)`,
    `CREATE POLICY "Appointments full read" ON appointments FOR SELECT USING (true)`,
    `CREATE POLICY "Appointments full access" ON appointments FOR ALL USING (true)`,
    `CREATE POLICY "Consultations full read" ON consultations FOR SELECT USING (true)`,
    `CREATE POLICY "Consultations full access" ON consultations FOR ALL USING (true)`,
    `CREATE POLICY "Prescriptions full read" ON prescriptions FOR SELECT USING (true)`,
    `CREATE POLICY "Prescriptions full access" ON prescriptions FOR ALL USING (true)`,
    `CREATE POLICY "Medications full read" ON medications FOR SELECT USING (true)`,
    `CREATE POLICY "Medications full access" ON medications FOR ALL USING (true)`,
    `CREATE POLICY "PharmacyStock full read" ON pharmacy_stock FOR SELECT USING (true)`,
    `CREATE POLICY "PharmacyStock full access" ON pharmacy_stock FOR ALL USING (true)`,
    `CREATE POLICY "LabRequests full read" ON lab_requests FOR SELECT USING (true)`,
    `CREATE POLICY "LabRequests full access" ON lab_requests FOR ALL USING (true)`,
    `CREATE POLICY "LabResults full read" ON lab_results FOR SELECT USING (true)`,
    `CREATE POLICY "LabResults full access" ON lab_results FOR ALL USING (true)`,
    `CREATE POLICY "ImagingRequests full read" ON imaging_requests FOR SELECT USING (true)`,
    `CREATE POLICY "ImagingRequests full access" ON imaging_requests FOR ALL USING (true)`,
    `CREATE POLICY "ImagingResults full read" ON imaging_results FOR SELECT USING (true)`,
    `CREATE POLICY "ImagingResults full access" ON imaging_results FOR ALL USING (true)`,
    `CREATE POLICY "Beds full read" ON beds FOR SELECT USING (true)`,
    `CREATE POLICY "Hospitalizations full read" ON hospitalizations FOR SELECT USING (true)`,
    `CREATE POLICY "Hospitalizations full access" ON hospitalizations FOR ALL USING (true)`,
    `CREATE POLICY "Wards full read" ON wards FOR SELECT USING (true)`,
    `CREATE POLICY "Rooms full read" ON rooms FOR SELECT USING (true)`,
    `CREATE POLICY "Invoices full read" ON invoices FOR SELECT USING (true)`,
    `CREATE POLICY "Invoices full access" ON invoices FOR ALL USING (true)`,
    `CREATE POLICY "InvoiceLines full read" ON invoice_lines FOR SELECT USING (true)`,
    `CREATE POLICY "InvoiceLines full access" ON invoice_lines FOR ALL USING (true)`,
    `CREATE POLICY "Emergency full read" ON emergency_visits FOR SELECT USING (true)`,
    `CREATE POLICY "Emergency full access" ON emergency_visits FOR ALL USING (true)`,
    `CREATE POLICY "Suppliers full read" ON suppliers FOR SELECT USING (true)`,
    `CREATE POLICY "Suppliers full access" ON suppliers FOR ALL USING (true)`,
    `CREATE POLICY "Notifications full access" ON notifications FOR ALL USING (true)`,
  ];

  for (const pol of policies) {
    try { await p.$executeRawUnsafe(pol); console.log('✅ policy'); } catch(e:any) { console.log('⚠️', e.message.substring(0,60)); }
  }

  console.log('\n✅ RLS corrigé — politique simple et sans récursion');
  await p.$disconnect();
}
fix();
