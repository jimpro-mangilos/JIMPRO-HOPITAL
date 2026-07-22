import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultations as consultationsApi, patients as patientsApi, staff as staffApi } from '@/lib/supabase-api';
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
import { formatDateTime } from '@/lib/format';
import { CONSULTATION_STATUS } from '@/lib/constants';
import { Plus, ClipboardList, User, Stethoscope, Search } from 'lucide-react';

export default function Consultations() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const { data } = await consultationsApi.list();
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

  const { data: doctors } = useQuery({
    queryKey: ['staff', 'doctors'],
    queryFn: async () => {
      const { data } = await staffApi.getDoctors();
      return data || [];
    },
  });

  const [form, setForm] = useState({
    patientId: '',
    staffId: '',
    symptoms: '',
    diagnosis: '',
    diagnosisCode: '',
    treatment: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      await consultationsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast({ title: 'Consultation créée', variant: 'success' });
      setIsCreateOpen(false);
      setForm({ patientId: '', staffId: '', symptoms: '', diagnosis: '', diagnosisCode: '', treatment: '', notes: '' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de créer la consultation', variant: 'error' }),
  });

  const filtered = (consultations || []).filter((c: any) => {
    if (!search) return true;
    const name = `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500 mt-1">Gestion des consultations médicales</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle consultation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label required>Patient</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
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
                <Select value={form.staffId} onValueChange={(v) => setForm({ ...form, staffId: v })}>
                  <SelectTrigger placeholder="Sélectionner un médecin..." />
                  <SelectContent>
                    {(doctors || []).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Symptômes</Label>
                <Textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={2} placeholder="Décrire les symptômes..." />
              </div>
              <div className="space-y-1.5">
                <Label>Diagnostic</Label>
                <Textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows={2} placeholder="Diagnostic..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Code CIM-10</Label>
                  <Input value={form.diagnosisCode} onChange={(e) => setForm({ ...form, diagnosisCode: e.target.value })} placeholder="Ex: J45" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Traitement prescrit</Label>
                <Textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} rows={2} placeholder="Traitement..." />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate(form)} loading={createMutation.isPending}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune consultation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c: any) => (
                <div key={c.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {c.patient?.firstName} {c.patient?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dr. {c.staff?.firstName} {c.staff?.lastName} — {formatDateTime(c.date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={c.status === 'TERMINE' ? 'success' : c.status === 'ANNULE' ? 'destructive' : 'warning'}>
                      {CONSULTATION_STATUS[c.status] || c.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {c.symptoms && (
                      <div>
                        <span className="text-gray-500">Symptômes:</span>
                        <p className="text-gray-700 truncate">{c.symptoms}</p>
                      </div>
                    )}
                    {c.diagnosis && (
                      <div>
                        <span className="text-gray-500">Diagnostic:</span>
                        <p className="text-gray-700 truncate">{c.diagnosis} {c.diagnosisCode && <Badge variant="outline" className="text-xs">{c.diagnosisCode}</Badge>}</p>
                      </div>
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
