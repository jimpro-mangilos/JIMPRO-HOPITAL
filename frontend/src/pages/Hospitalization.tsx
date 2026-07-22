import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalization as hospApi, patients as patientsApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { BED_STATUS, BED_STATUS_COLORS, HOSP_STATUS, HOSP_STATUS_COLORS } from '@/lib/constants';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { BedDouble, Building2, Search } from 'lucide-react';

export default function Hospitalization() {
  const [search, setSearch] = useState('');
  const [admitDialog, setAdmitDialog] = useState(false);
  const [dischargeDialog, setDischargeDialog] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: beds, isLoading: bedsLoading } = useQuery({
    queryKey: ['beds'],
    queryFn: async () => {
      const { data } = await hospApi.beds.list();
      return data || [];
    },
  });

  const { data: hospitalizations, isLoading: hospLoading } = useQuery({
    queryKey: ['hospitalizations'],
    queryFn: async () => {
      const { data } = await hospApi.admissions.list();
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

  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    bedId: '',
    reason: '',
    diagnosis: '',
    notes: '',
  });

  const admitMutation = useMutation({
    mutationFn: async (data: typeof admitForm) => {
      await hospApi.admissions.admit(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalizations'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast({ title: 'Admission enregistrée', variant: 'success' });
      setAdmitDialog(false);
      setAdmitForm({ patientId: '', bedId: '', reason: '', diagnosis: '', notes: '' });
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const dischargeMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => hospApi.admissions.discharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalizations'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast({ title: 'Sortie enregistrée', variant: 'success' });
      setDischargeDialog(null);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const availableBeds = (beds || []).filter((b: any) => b.status === 'DISPONIBLE');
  const occupiedBeds = (beds || []).filter((b: any) => b.status === 'OCCUPE');
  const maintenanceBeds = (beds || []).filter((b: any) => b.status === 'MAINTENANCE');

  const bedColor = (status: string) => {
    switch (status) {
      case 'DISPONIBLE': return 'bg-green-100 border-green-400 text-green-700';
      case 'OCCUPE': return 'bg-red-100 border-red-400 text-red-700';
      case 'MAINTENANCE': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'RESERVE': return 'bg-blue-100 border-blue-400 text-blue-700';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const bedDot = (status: string) => {
    switch (status) {
      case 'DISPONIBLE': return 'bg-green-500';
      case 'OCCUPE': return 'bg-red-500';
      case 'MAINTENANCE': return 'bg-yellow-500';
      case 'RESERVE': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const filtered = (hospitalizations || []).filter((h: any) => {
    if (!search) return true;
    const name = `${h.patient?.firstName || ''} ${h.patient?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitalisation</h1>
          <p className="text-gray-500 mt-1">Gestion des lits et admissions</p>
        </div>
        <Button onClick={() => setAdmitDialog(true)}>
          <BedDouble className="mr-2 h-4 w-4" />
          Nouvelle admission
        </Button>
      </div>

      {/* Bed Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Disponibles</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{availableBeds.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Occupés</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{occupiedBeds.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-yellow-600">Maintenance</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{maintenanceBeds.length}</p></CardContent>
        </Card>
      </div>

      {/* Bed Grid */}
      <Card>
        <CardHeader><CardTitle className="text-base">État des lits</CardTitle></CardHeader>
        <CardContent>
          {bedsLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {(beds || []).map((b: any) => (
                <div key={b.id} className={cn('flex flex-col items-center justify-center p-3 rounded-lg border-2', bedColor(b.status))}>
                  <div className={cn('w-3 h-3 rounded-full mb-1', bedDot(b.status))} />
                  <span className="text-xs font-semibold">{b.bedNumber}</span>
                  <span className="text-[10px]">{BED_STATUS[b.status]}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospitalizations List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Admissions en cours</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hospLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-gray-500">Aucune admission en cours</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lit</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.patient?.firstName} {h.patient?.lastName}</TableCell>
                    <TableCell>{h.bed?.bedNumber} ({h.bed?.room?.roomNumber})</TableCell>
                    <TableCell className="text-gray-500">{formatDateTime(h.admissionDate)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-500">{h.reason}</TableCell>
                    <TableCell>
                      <Badge className={HOSP_STATUS_COLORS[h.status]}>{HOSP_STATUS[h.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {h.status === 'ADMIS' && (
                        <Button size="sm" variant="outline" onClick={() => setDischargeDialog(h)}>
                          Sortir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Admit Dialog */}
      <Dialog open={admitDialog} onOpenChange={setAdmitDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle admission</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label required>Patient</Label>
              <Select value={admitForm.patientId} onValueChange={(v) => setAdmitForm({ ...admitForm, patientId: v })}>
                <SelectTrigger placeholder="Sélectionner un patient..." />
                <SelectContent>
                  {(patients || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label required>Lit</Label>
              <Select value={admitForm.bedId} onValueChange={(v) => setAdmitForm({ ...admitForm, bedId: v })}>
                <SelectTrigger placeholder="Sélectionner un lit..." />
                <SelectContent>
                  {availableBeds.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.bedNumber} — {b.room?.roomNumber} ({b.room?.ward?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label required>Motif d'admission</Label>
              <Textarea value={admitForm.reason} onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Diagnostic</Label>
              <Input value={admitForm.diagnosis} onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={admitForm.notes} onChange={(e) => setAdmitForm({ ...admitForm, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAdmitDialog(false)}>Annuler</Button>
              <Button onClick={() => admitMutation.mutate(admitForm)} loading={admitMutation.isPending}>
                Admettre
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={!!dischargeDialog} onOpenChange={(v) => { if (!v) setDischargeDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmer la sortie</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Confirmer la sortie de <strong>{dischargeDialog?.patient?.firstName} {dischargeDialog?.patient?.lastName}</strong> du lit <strong>{dischargeDialog?.bed?.bedNumber}</strong> ?
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDischargeDialog(null)}>Annuler</Button>
              <Button onClick={() => dischargeMutation.mutate({ id: dischargeDialog.id })} loading={dischargeMutation.isPending}>
                Confirmer la sortie
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

