import { useQuery } from '@tanstack/react-query';
import { dashboard as dashApi } from '@/lib/supabase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import {
  Download, TrendingUp, Users, CalendarDays, DollarSign, FileText,
} from 'lucide-react';

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: async () => {
      const { data, error } = await dashApi.stats();
      if (error) return {};
      return (data as any)?.[0] || {};
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: async () => {
      const { data, error } = await dashApi.revenueChart(30);
      if (error) return [];
      return data || [];
    },
  });

  const { data: appointmentData } = useQuery({
    queryKey: ['reports', 'appointments'],
    queryFn: async () => {
      const { data, error } = await dashApi.appointmentChart(30);
      if (error) return [];
      return data || [];
    },
  });

  const { data: patientStats } = useQuery({
    queryKey: ['reports', 'patients'],
    queryFn: async () => {
      // No dedicated patient-stats API; return empty for now
      return [];
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500 mt-1">Statistiques et rapports de l'hôpital</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3"><DollarSign className="h-6 w-6 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Recettes aujourd'hui</p>
                  <p className="text-xl font-bold">{formatCurrency(stats?.revenueToday || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-50 p-3"><Users className="h-6 w-6 text-green-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Patients aujourd'hui</p>
                  <p className="text-xl font-bold">{stats?.patientsToday || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-purple-50 p-3"><CalendarDays className="h-6 w-6 text-purple-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Rendez-vous</p>
                  <p className="text-xl font-bold">{stats?.appointmentsToday || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-orange-50 p-3"><TrendingUp className="h-6 w-6 text-orange-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Admissions</p>
                  <p className="text-xl font-bold">{stats?.admissionsToday || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Évolution des recettes (30 jours)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Rendez-vous par jour (30 jours)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Stats */}
          {patientStats && patientStats.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Répartition par groupe sanguin</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={patientStats} dataKey="count" nameKey="group" cx="50%" cy="50%" outerRadius={120} label>
                        {patientStats.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
