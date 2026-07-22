import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xgagzyplhdbvtjcnvmdm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYWd6eXBsaGRidnRqY252bWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjQ2MDUsImV4cCI6MjA5OTcwMDYwNX0.cBMNvqyNAdtPd_kMMSZpJZS-2LpJZNw8lOvES5daI-E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
