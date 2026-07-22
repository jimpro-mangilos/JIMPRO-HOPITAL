import { supabase } from './supabase';

// ============================================================
// Auth helpers
// ============================================================

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  try {
    const { data: userData } = await supabase
      .from('users')
      .select('*, staff(*)')
      .eq('id', data.user.id)
      .single();
    if (userData) return { user: userData, session: data.session };
  } catch (_) {}

  // Fallback
  return { user: { id: data.user.id, email: data.user.email!, role: 'ACCUEIL' }, session: data.session };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

// ============================================================
// Supabase CRUD helpers (PostgREST via supabase-js)
// ============================================================

// --- Patients ---
export const patients = {
  list: (search?: string, page = 1, limit = 20) => {
    let q = supabase.from('patients').select('*', { count: 'exact' });
    if (search) q = q.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,phone.ilike.%${search}%`);
    return q.range((page - 1) * limit, page * limit - 1).order('createdAt', { ascending: false });
  },
  getById: (id: string) => supabase.from('patients').select('*').eq('id', id).single(),
  create: (data: any) => supabase.from('patients').insert(data).select().single(),
  update: (id: string, data: any) => supabase.from('patients').update(data).eq('id', id).select().single(),
  remove: (id: string) => supabase.from('patients').update({ isActive: false }).eq('id', id),
};

// --- Appointments ---
export const appointments = {
  list: (date?: string, status?: string) => {
    let q = supabase.from('appointments').select('*, patient:patients(firstName,lastName), staff:staff(firstName,lastName)');
    if (date) q = q.eq('date', date);
    if (status) q = q.eq('status', status);
    return q.order('startTime', { ascending: true });
  },
  create: (data: any) => supabase.from('appointments').insert(data).select().single(),
  updateStatus: (id: string, status: string) => supabase.from('appointments').update({ status }).eq('id', id),
  getToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return supabase.from('appointments').select('*, patient:patients(firstName,lastName), staff:staff(firstName,lastName)').eq('date', today).order('startTime');
  },
};

// --- Staff ---
export const staff = {
  list: () => supabase.from('staff').select('*').order('lastName'),
  getDoctors: () => supabase.from('staff').select('*').eq('position', 'Médecin').order('lastName'),
};

// --- Consultations ---
export const consultations = {
  list: () => supabase.from('consultations').select('*, patient:patients(firstName,lastName), staff:staff(firstName,lastName)').order('date', { ascending: false }),
  create: (data: any) => supabase.from('consultations').insert(data).select().single(),
};

// --- Prescriptions ---
export const prescriptions = {
  list: () => supabase.from('prescriptions').select('*, medication:medications(name)').order('createdAt', { ascending: false }),
  create: (data: any) => supabase.from('prescriptions').insert(data).select().single(),
  dispense: (id: string) => supabase.from('prescriptions').update({ isDispensed: true, dispensedAt: new Date().toISOString() }).eq('id', id),
};

// --- Pharmacy ---
export const pharmacy = {
  medications: {
    list: () => supabase.from('medications').select('*').order('name'),
    create: (data: any) => supabase.from('medications').insert(data).select().single(),
  },
  stock: {
    list: () => supabase.from('pharmacy_stock').select('*, medication:medications(name)').order('expiryDate', { ascending: true }),
    update: (id: string, quantity: number) => supabase.from('pharmacy_stock').update({ quantity }).eq('id', id),
    lowStock: async () => {
      const { data } = await supabase.from('pharmacy_stock').select('*, medication:medications(name)');
      return { data: (data || []).filter((s: any) => s.quantity <= s.reorderLevel), error: null };
    },
  },
};

// --- Laboratory ---
export const laboratory = {
  requests: {
    list: (status?: string) => {
      let q = supabase.from('lab_requests').select('*, patient:patients(firstName,lastName), results:lab_results(*)').order('requestedAt', { ascending: false });
      if (status) q = q.eq('status', status);
      return q;
    },
    updateStatus: (id: string, status: string) => supabase.from('lab_requests').update({ status }).eq('id', id),
    addResult: (data: any) => supabase.from('lab_results').insert(data).select().single(),
  },
};

// --- Imaging ---
export const imaging = {
  requests: {
    list: (status?: string) => {
      let q = supabase.from('imaging_requests').select('*, patient:patients(firstName,lastName), result:imaging_results(*)').order('requestedAt', { ascending: false });
      if (status) q = q.eq('status', status);
      return q;
    },
    updateStatus: (id: string, status: string) => supabase.from('imaging_requests').update({ status }).eq('id', id),
    addResult: (data: any) => supabase.from('imaging_results').insert(data).select().single(),
  },
};

// --- Hospitalization ---
export const hospitalization = {
  beds: {
    list: () => supabase.from('beds').select('*').order('bedNumber'),
  },
  admissions: {
    list: () => supabase.from('hospitalizations').select('*, patient:patients(firstName,lastName), bed:beds(bedNumber,room:rooms(roomNumber,ward:wards(name)))').eq('status', 'ADMIS').order('admissionDate', { ascending: false }),
    admit: (data: any) => supabase.from('hospitalizations').insert(data).select().single(),
    discharge: (id: string) => supabase.from('hospitalizations').update({ status: 'SORTI', dischargeDate: new Date().toISOString() }).eq('id', id),
  },
};

// --- Emergency ---
export const emergency = {
  visits: {
    list: () => supabase.from('emergency_visits').select('*, patient:patients(firstName,lastName), assignedStaff:staff(firstName,lastName)').in('status', ['EN_ATTENTE', 'EN_TRIAGE', 'EN_TRAITEMENT', 'EN_OBSERVATION']).order('arrivalTime'),
    create: (data: any) => supabase.from('emergency_visits').insert(data).select().single(),
    updateStatus: (id: string, status: string) => supabase.from('emergency_visits').update({ status }).eq('id', id),
  },
};

// --- Billing ---
export const billing = {
  invoices: {
    list: (status?: string) => {
      let q = supabase.from('invoices').select('*, patient:patients(firstName,lastName), lines:invoice_lines(*)').order('issuedAt', { ascending: false });
      if (status) q = q.eq('status', status);
      return q;
    },
    create: (data: any) => supabase.from('invoices').insert(data).select().single(),
    recordPayment: (id: string, amount: number, method: string) => {
      return supabase.rpc('record_payment', { invoice_id: id, pay_amount: amount, pay_method: method });
    },
  },
};

// --- Dashboard ---
export const dashboard = {
  stats: () => supabase.rpc('get_dashboard_stats'),
  appointmentChart: (days = 7) => supabase.rpc('get_appointment_stats', { num_days: days }),
  revenueChart: (days = 30) => supabase.rpc('get_revenue_stats', { num_days: days }),
};

// --- Users (admin) ---
export const users = {
  list: () => supabase.from('users').select('*, staff(*)').order('createdAt', { ascending: false }),
  create: (data: any) => supabase.rpc('create_user', data),
  updateRole: (id: string, role: string) => supabase.from('users').update({ role }).eq('id', id),
};
