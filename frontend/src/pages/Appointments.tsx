import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointments as appointmentsApi, staff as staffApi, patients as patientsApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatTime } from '@/lib/format';
import {
  APPOINTMENT_STATUS, APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPES,
} from '@/lib/constants';
import {
  Plus, Search, CalendarDays, Clock, User, Filter,
} from 'lucide-react';

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', selectedDate, statusFilter, doctorFilter],
    queryFn: async () => {
      const { data, error } = await appointmentsApi.list(selectedDate || undefined, statusFilter || undefined);
      if (error) return [];
      // Client-side filter for doctorFilter since the API doesn't support it directly
      if (doctorFilter && data) return data.filter((a: any) => a.staffId === doctorFilter);
      return data || [];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['staff', 'doctors'],
    queryFn: async () => {
      const { data } = await staffApi.getDoctors();
      return data || [];
    },
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: async () => {
      const { data } = await patientsApi.list(undefined, 1, 200);
      return data || [];
    },
  });

  const [newAppt, setNewAppt] = useState({
    patientId: '',
    staffId: '',
    date: selectedDate,
    startTime: '08:00',
    endTime: '08:30',
    type: 'CONSULTATION',
    reason: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newAppt) => {
      await appointmentsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Rendez-vous créé', variant: 'success' });
      setIsCreateOpen(false);
      setNewAppt({ patientId: '', staffId: '', date: selectedDate, startTime: '08:00', endTime: '08:30', type: 'CONSULTATION', reason: '', notes: '' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous', variant: 'error' }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Statut mis à jour', variant: 'success' });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-gray-500 mt-1">Gestion des rendez-vous</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau rendez-vous</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label required>Patient</Label>
                <Select value={newAppt.patientId} onValueChange={(v) => setNewAppt({ ...newAppt, patientId: v })}>
                  <SelectTrigger placeholder="Rechercher un patient..." />
                  <SelectContent>
                    {(patients || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label required>Médecin</Label>
                <Select value={newAppt.staffId} onValueChange={(v) => setNewAppt({ ...newAppt, staffId: v })}>
                  <SelectTrigger placeholder="Sélectionner un médecin..." />
                  <SelectContent>
                    {(doctors || []).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label required>Date</Label>
                  <Input type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label required>Début</Label>
                  <Input type="time" value={newAppt.startTime} onChange={(e) => setNewAppt({ ...newAppt, startTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label required>Fin</Label>
                  <Input type="time" value={newAppt.endTime} onChange={(e) => setNewAppt({ ...newAppt, endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={newAppt.type} onValueChange={(v) => setNewAppt({ ...newAppt, type: v })}>
                  <SelectTrigger />
                  <SelectContent>
                    {Object.entries(APPOINTMENT_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Motif</Label>
                <Textarea value={newAppt.reason} onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate(newAppt)} loading={createMutation.isPending}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" placeholder="Statut" />
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {Object.entries(APPOINTMENT_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-48" placeholder="Médecin" />
              <SelectContent>
                <SelectItem value="">Tous les médecins</SelectItem>
                {(doctors || []).map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !appointments?.length ? (
            <div className="text-center py-12">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucun rendez-vous</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedDate ? 'Essayez une autre date' : 'Créez un nouveau rendez-vous'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter((a: any) => {
                  if (!search) return true;
                  const fullName = `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.toLowerCase();
                  return fullName.includes(search.toLowerCase());
                })
                .map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary-50 text-primary-700">
                        <span className="text-lg font-bold">{formatDate(a.date, 'dd')}</span>
                        <span className="text-[10px] uppercase">{formatDate(a.date, 'MMM')}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {a.patient?.firstName} {a.patient?.lastName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.startTime} - {a.endTime}</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />Dr. {a.staff?.firstName} {a.staff?.lastName}</span>
                        </div>
                        {a.reason && <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={APPOINTMENT_STATUS_COLORS[a.status]}>
                        {APPOINTMENT_STATUS[a.status] || a.status}
                      </Badge>
                      {a.status === 'PROGRAMME' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: 'CONFIRME' })}>
                          Confirmer
                        </Button>
                      )}
                      {a.status === 'CONFIRME' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: 'EN_COURS' })}>
                          En cours
                        </Button>
                      )}
                      {a.status === 'EN_COURS' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: 'TERMINE' })}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
