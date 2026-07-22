import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_COLORS } from '@/lib/constants';
import {
  Users,
  CalendarDays,
  DollarSign,
  BedDouble,
  Siren,
  FlaskConical,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardStats {
  patientsToday: number;
  appointmentsToday: number;
  revenueToday: number;
  admissionsToday: number;
  emergencyWaiting: number;
  labPending: number;
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  status: string;
  type: string;
  patient: { firstName: string; lastName: string };
  staff: { firstName: string; lastName: string };
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

const defaultStats: DashboardStats = {
  patientsToday: 0,
  appointmentsToday: 0,
  revenueToday: 0,
  admissionsToday: 0,
  emergencyWaiting: 0,
  labPending: 0,
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () =>
      fetch('/api/dashboard/stats')
        .then((r) => r.json())
        .catch(() => defaultStats),
  });

  const { data: recentPatients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['dashboard', 'recent-patients'],
    queryFn: () =>
      fetch('/api/patients?limit=5&sortBy=createdAt&order=desc')
        .then((r) => r.json())
        .then((d) => d.data || d.patients || [])
        .catch(() => []),
  });

  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['dashboard', 'upcoming-appointments'],
    queryFn: () =>
      fetch('/api/appointments?status=PROGRAMME,CONFIRME&limit=5&sortBy=date&order=asc')
        .then((r) => r.json())
        .then((d) => d.data || d.appointments || [])
        .catch(() => []),
  });

  const { data: appointmentChart } = useQuery({
    queryKey: ['dashboard', 'appointment-chart'],
    queryFn: () =>
      fetch('/api/dashboard/appointment-stats?days=7')
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['dashboard', 'revenue-chart'],
    queryFn: () =>
      fetch('/api/dashboard/revenue-stats?days=30')
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
  });

  const s = stats || defaultStats;

  const kpiCards = [
    { label: 'Patients aujourd\'hui', value: s.patientsToday, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rendez-vous', value: s.appointmentsToday, icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Recettes', value: formatCurrency(s.revenueToday), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Admissions', value: s.admissionsToday, icon: BedDouble, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Urgences en attente', value: s.emergencyWaiting, icon: Siren, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Labo en attente', value: s.labPending, icon: FlaskConical, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité de l'hôpital</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-lg p-2', kpi.bg)}>
                  <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : kpi.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendez-vous (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recettes (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patients récents</CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentPatients?.length ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun patient récent</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                      <TableCell className="text-gray-500">{p.phone}</TableCell>
                      <TableCell className="text-gray-500">{formatDate(p.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prochains rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !upcomingAppointments?.length ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun rendez-vous à venir</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-700">
                        <span className="text-lg font-bold">{formatDate(a.date, 'dd')}</span>
                        <span className="text-[10px] uppercase">{formatDate(a.date, 'MMM')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {a.patient?.firstName} {a.patient?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.startTime} — Dr. {a.staff?.firstName} {a.staff?.lastName}
                        </p>
                      </div>
                    </div>
                    <Badge className={APPOINTMENT_STATUS_COLORS[a.status] || ''}>
                      {APPOINTMENT_STATUS[a.status] || a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
