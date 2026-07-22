-- ============================================================
-- JIMPRO-HOPITAL — RLS Policies + Functions for Supabase
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid()::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Helper function: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT role IN ('SUPER_ADMIN', 'ADMIN') FROM users WHERE id = auth.uid()::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES — Read access for all authenticated users
-- Write access based on role
-- ============================================================

-- Users
CREATE POLICY "Users view own" ON users FOR SELECT USING (id = auth.uid()::uuid OR is_admin());
CREATE POLICY "Admins manage users" ON users FOR ALL USING (is_admin());
CREATE POLICY "Users update own" ON users FOR UPDATE USING (id = auth.uid()::uuid);

-- Staff
CREATE POLICY "Staff view all" ON staff FOR SELECT USING (true);
CREATE POLICY "Admins manage staff" ON staff FOR ALL USING (is_admin());

-- Patients
CREATE POLICY "Patients view all" ON patients FOR SELECT USING (true);
CREATE POLICY "Staff create patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff update patients" ON patients FOR UPDATE USING (true);
CREATE POLICY "Admins delete patients" ON patients FOR DELETE USING (is_admin());

-- Appointments
CREATE POLICY "Appointments view all" ON appointments FOR SELECT USING (true);
CREATE POLICY "Staff manage appointments" ON appointments FOR ALL USING (true);

-- Consultations
CREATE POLICY "Consultations view all" ON consultations FOR SELECT USING (true);
CREATE POLICY "Staff manage consultations" ON consultations FOR ALL USING (true);

-- Prescriptions
CREATE POLICY "Prescriptions view all" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Staff manage prescriptions" ON prescriptions FOR ALL USING (true);

-- Medications
CREATE POLICY "Medications view all" ON medications FOR SELECT USING (true);
CREATE POLICY "Pharmacy manage medications" ON medications FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'));

-- Pharmacy Stock
CREATE POLICY "Stock view all" ON pharmacy_stock FOR SELECT USING (true);
CREATE POLICY "Pharmacy manage stock" ON pharmacy_stock FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'));

-- Lab Requests
CREATE POLICY "Lab view all" ON lab_requests FOR SELECT USING (true);
CREATE POLICY "Staff manage lab" ON lab_requests FOR ALL USING (true);

-- Lab Results
CREATE POLICY "Lab results view all" ON lab_results FOR SELECT USING (true);
CREATE POLICY "Staff manage lab results" ON lab_results FOR ALL USING (true);

-- Imaging
CREATE POLICY "Imaging view all" ON imaging_requests FOR SELECT USING (true);
CREATE POLICY "Staff manage imaging" ON imaging_requests FOR ALL USING (true);
CREATE POLICY "Imaging results view all" ON imaging_results FOR SELECT USING (true);
CREATE POLICY "Staff manage imaging results" ON imaging_results FOR ALL USING (true);

-- Hospitalization
CREATE POLICY "Beds view all" ON beds FOR SELECT USING (true);
CREATE POLICY "Admins manage beds" ON beds FOR ALL USING (is_admin());
CREATE POLICY "Hospitalizations view all" ON hospitalizations FOR SELECT USING (true);
CREATE POLICY "Staff manage hospitalizations" ON hospitalizations FOR ALL USING (true);

-- Wards / Rooms
CREATE POLICY "Wards view all" ON wards FOR SELECT USING (true);
CREATE POLICY "Rooms view all" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admins manage wards" ON wards FOR ALL USING (is_admin());
CREATE POLICY "Admins manage rooms" ON rooms FOR ALL USING (is_admin());

-- Billing
CREATE POLICY "Billing view all" ON invoices FOR SELECT USING (true);
CREATE POLICY "Billing manage invoices" ON invoices FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'COMPTABLE', 'ACCUEIL'));
CREATE POLICY "Lines view all" ON invoice_lines FOR SELECT USING (true);
CREATE POLICY "Billing manage lines" ON invoice_lines FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'COMPTABLE'));

-- Emergency
CREATE POLICY "Emergency view all" ON emergency_visits FOR SELECT USING (true);
CREATE POLICY "Staff manage emergency" ON emergency_visits FOR ALL USING (true);

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (userId = auth.uid()::uuid);
CREATE POLICY "System manage notifications" ON notifications FOR ALL USING (true);

-- Suppliers
CREATE POLICY "Suppliers view all" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Pharmacy manage suppliers" ON suppliers FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'));

-- ============================================================
-- POSTGRESQL FUNCTIONS (used by supabase-api.ts)
-- ============================================================

-- Dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  result json;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appointment chart data
CREATE OR REPLACE FUNCTION get_appointment_stats(num_days integer DEFAULT 7)
RETURNS TABLE(date text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT to_char(d::date, 'DD/MM') as date, count(a.id)::bigint as count
  FROM generate_series(current_date - (num_days - 1), current_date, '1 day'::interval) d
  LEFT JOIN appointments a ON a.date::date = d::date
  GROUP BY d::date
  ORDER BY d::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revenue chart data
CREATE OR REPLACE FUNCTION get_revenue_stats(num_days integer DEFAULT 30)
RETURNS TABLE(date text, amount float) AS $$
BEGIN
  RETURN QUERY
  SELECT to_char(d::date, 'DD/MM') as date, COALESCE(sum(i."paidAmount"), 0)::float as amount
  FROM generate_series(current_date - (num_days - 1), current_date, '1 day'::interval) d
  LEFT JOIN invoices i ON i."paidAt"::date = d::date
  GROUP BY d::date
  ORDER BY d::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record payment
CREATE OR REPLACE FUNCTION record_payment(invoice_id text, pay_amount float, pay_method text)
RETURNS json AS $$
DECLARE
  inv invoices%ROWTYPE;
  new_paid float;
  new_status text;
BEGIN
  SELECT * INTO inv FROM invoices WHERE id = invoice_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  new_paid := inv."paidAmount" + pay_amount;

  IF (inv."totalAmount" - inv.discount - new_paid) <= 0 THEN
    new_status := 'PAYEE';
  ELSIF new_paid > 0 THEN
    new_status := 'PARTIELLE';
  ELSE
    new_status := 'EMISE';
  END IF;

  UPDATE invoices
  SET "paidAmount" = new_paid,
      status = new_status::"InvoiceStatus",
      "paymentMethod" = pay_method::"PaymentMethod",
      "paidAt" = CASE WHEN new_status = 'PAYEE' THEN now() ELSE "paidAt" END
  WHERE id = invoice_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user with staff (admin function)
CREATE OR REPLACE FUNCTION create_user(
  p_email text,
  p_password text,
  p_role text,
  p_firstname text,
  p_lastname text,
  p_phone text
)
RETURNS json AS $$
DECLARE
  new_user_id text;
BEGIN
  -- Create auth user via Supabase
  new_user_id := (
    SELECT id FROM auth.users
    WHERE email = p_email
    LIMIT 1
  );

  -- Insert into public users
  INSERT INTO users (id, email, "passwordHash", role)
  VALUES (new_user_id, p_email, crypt(p_password, gen_salt('bf')), p_role::"Role");

  -- Insert staff record
  INSERT INTO staff ("userId", "firstName", "lastName", phone)
  VALUES (new_user_id, p_firstname, p_lastname, p_phone);

  RETURN json_build_object('success', true, 'userId', new_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
