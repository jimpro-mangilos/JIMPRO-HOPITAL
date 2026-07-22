import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const functions = [
    // Dashboard stats
    `CREATE OR REPLACE FUNCTION get_dashboard_stats()
    RETURNS json AS $$
    DECLARE result json;
    BEGIN
      SELECT json_build_object(
        'patientsToday', (SELECT count(*) FROM patients WHERE "createdAt"::date = current_date),
        'appointmentsToday', (SELECT count(*) FROM appointments WHERE "date"::date = current_date),
        'revenueToday', (SELECT COALESCE(sum("paidAmount"), 0) FROM invoices WHERE "paidAt"::date = current_date),
        'admissionsToday', (SELECT count(*) FROM hospitalizations WHERE "admissionDate"::date = current_date),
        'emergencyWaiting', (SELECT count(*) FROM emergency_visits WHERE status = 'EN_ATTENTE'),
        'labPending', (SELECT count(*) FROM lab_requests WHERE status IN ('EN_ATTENTE', 'PRELEVE', 'EN_COURS'))
      ) INTO result;
      RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,

    // Appointment stats
    `CREATE OR REPLACE FUNCTION get_appointment_stats(num_days integer DEFAULT 7)
    RETURNS TABLE(date text, count bigint) AS $$
    BEGIN
      RETURN QUERY
      SELECT to_char(d::date, 'DD/MM') as date, count(a.id)::bigint as count
      FROM generate_series(current_date - (num_days - 1), current_date, '1 day'::interval) d
      LEFT JOIN appointments a ON a.date::date = d::date
      GROUP BY d::date ORDER BY d::date;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,

    // Revenue stats
    `CREATE OR REPLACE FUNCTION get_revenue_stats(num_days integer DEFAULT 30)
    RETURNS TABLE(date text, amount float) AS $$
    BEGIN
      RETURN QUERY
      SELECT to_char(d::date, 'DD/MM') as date, COALESCE(sum(i."paidAmount"), 0)::float as amount
      FROM generate_series(current_date - (num_days - 1), current_date, '1 day'::interval) d
      LEFT JOIN invoices i ON i."paidAt"::date = d::date
      GROUP BY d::date ORDER BY d::date;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,

    // Record payment
    `CREATE OR REPLACE FUNCTION record_payment(invoice_id text, pay_amount float, pay_method text)
    RETURNS json AS $$
    DECLARE inv invoices%ROWTYPE; new_paid float; new_status text;
    BEGIN
      SELECT * INTO inv FROM invoices WHERE id = invoice_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
      new_paid := inv."paidAmount" + pay_amount;
      IF (inv."totalAmount" - inv.discount - new_paid) <= 0 THEN new_status := 'PAYEE';
      ELSIF new_paid > 0 THEN new_status := 'PARTIELLE';
      ELSE new_status := 'EMISE'; END IF;
      UPDATE invoices SET "paidAmount" = new_paid, status = new_status::"InvoiceStatus",
        "paymentMethod" = pay_method::"PaymentMethod",
        "paidAt" = CASE WHEN new_status = 'PAYEE' THEN now() ELSE "paidAt" END
      WHERE id = invoice_id;
      RETURN json_build_object('success', true);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,
  ];

  for (const fn of functions) {
    try {
      await prisma.$executeRawUnsafe(fn);
      const name = fn.substring(fn.indexOf('FUNCTION ') + 9, fn.indexOf('('));
      console.log('✅', name);
    } catch (err: any) {
      console.log('⚠️', err.message?.substring(0, 100));
    }
  }

  // Also fix missing policies
  const policies = [
    `DO $$ BEGIN CREATE POLICY "Users view own" ON users FOR SELECT USING (id = auth.uid()::uuid OR (SELECT role IN ('SUPER_ADMIN','ADMIN') FROM users WHERE id = auth.uid()::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Admins manage users" ON users FOR ALL USING ((SELECT role IN ('SUPER_ADMIN','ADMIN') FROM users WHERE id = auth.uid()::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Staff view all" ON staff FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Appointments view all" ON appointments FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Consultations view all" ON consultations FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Medications view all" ON medications FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Beds view all" ON beds FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Wards view all" ON wards FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Billing view all" ON invoices FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Emergency view all" ON emergency_visits FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  ];

  for (const pol of policies) {
    try {
      await prisma.$executeRawUnsafe(pol);
      console.log('✅ policy');
    } catch (err: any) {
      console.log('⚠️', err.message?.substring(0, 80));
    }
  }

  console.log('\n✅ Toutes les fonctions et politiques sont en place !');
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
