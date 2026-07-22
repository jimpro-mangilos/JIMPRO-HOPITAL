import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergency as emergApi, staff as staffApi, patients as patientsApi } from '@/lib/supabase-api';
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
import { TRIAGE_COLORS, TRIAGE_LEVELS, EMERGENCY_STATUS } from '@/lib/constants';
import { Siren, Plus, Heart, Activity, Thermometer } from 'lucide-react';

const triageColors = {
  I: 'border-l-red-600 bg-red-50',
  II: 'border-l-orange-500 bg-orange-50',
  III: 'border-l-yellow-500 bg-yellow-50',
  IV: 'border-l-green-500 bg-green-50',
  V: 'border-l-blue-500 bg-blue-50',
};

const statusColumns: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_TRIAGE: 'En triage',
  EN_TRAITEMENT: 'En traitement',
  EN_OBSERVATION: 'En observation',
};

export default function Emergency() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['emergency-visits'],
    queryFn: async () => {
      const { data } = await emergApi.visits.list();
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

  const [form, setForm] = useState({
    patientId: '',
    triageLevel: 'IV',
    chiefComplaint: '',
    vitals: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await emergApi.visits.create(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-visits'] });
      toast({ title: 'Visite urgente créée', variant: 'success' });
      setIsCreateOpen(false);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      emergApi.visits.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-visits'] });
      toast({ title: 'Statut mis à jour', variant: 'success' });
    },
  });

  const getColumnVisits = (status: string) =>
    (visits || []).filter((v: any) => v.status === status && v.status !== 'SORTI' && v.status !== 'HOSPITALISE' && v.status !== 'TRANSFERE' && v.status !== 'DECEDE');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Urgences</h1>
          <p className="text-gray-500 mt-1">Tableau de bord des urgences</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle arrivée
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nouvelle arrivée urgente</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label required>Patient</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger placeholder="Sélectionner un patient..." />
                  <SelectContent>
                    {(patients || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label required>Niveau de triage</Label>
                <Select value={form.triageLevel} onValueChange={(v) => setForm({ ...form, triageLevel: v })}>
                  <SelectTrigger />
                  <SelectContent>
                    {Object.entries(TRIAGE_LEVELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label required>Motif principal</Label>
                <Textarea value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Signes vitaux (JSON)</Label>
                <Textarea value={form.vitals} onChange={(e) => setForm({ ...form, vitals: e.target.value })} rows={2} placeholder='{"TA":"120/80","FC":72,"T°":37,"SpO2":98}' />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Triage Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statusColumns).map(([status, label]) => {
            const colVisits = getColumnVisits(status);
            return (
              <div key={status} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                  <Badge variant="secondary">{colVisits.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colVisits.map((v: any) => (
                    <div
                      key={v.id}
                      className={cn('p-3 rounded-lg border-l-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow', triageColors[v.triageLevel as keyof typeof triageColors] || 'border-l-gray-300')}
                      onClick={() => setDetailDialog(v)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={TRIAGE_COLORS[v.triageLevel]}>{v.triageLevel}</Badge>
                        <span className="text-xs text-gray-400">{new Date(v.arrivalTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {v.patient?.firstName} {v.patient?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{v.chiefComplaint}</p>
                      {v.vitals && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Heart className="h-3 w-3" />
                          <span>Signes vitaux enregistrés</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {colVisits.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Aucun patient</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={(v) => { if (!v) setDetailDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {detailDialog?.patient?.firstName} {detailDialog?.patient?.lastName}
              <Badge className={cn('ml-2', TRIAGE_COLORS[detailDialog?.triageLevel || ''])}>
                {TRIAGE_LEVELS[detailDialog?.triageLevel || ''] || detailDialog?.triageLevel}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Arrivée:</span> {detailDialog ? formatDateTime(detailDialog.arrivalTime) : ''}</div>
              <div><span className="text-gray-500">Statut:</span> {EMERGENCY_STATUS[detailDialog?.status || ''] || detailDialog?.status}</div>
              <div className="col-span-2"><span className="text-gray-500">Motif:</span> {detailDialog?.chiefComplaint}</div>
              {detailDialog?.vitals && (
                <div className="col-span-2">
                  <span className="text-gray-500">Signes vitaux:</span>
                  <pre className="text-xs mt-1 bg-gray-50 p-2 rounded">{detailDialog.vitals}</pre>
                </div>
              )}
              {detailDialog?.notes && (
                <div className="col-span-2"><span className="text-gray-500">Notes:</span> {detailDialog.notes}</div>
              )}
            </div>
            <div className="border-t pt-4">
              <Label>Changer le statut</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(EMERGENCY_STATUS).map(([k, v]) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={detailDialog?.status === k ? 'default' : 'outline'}
                    onClick={() => {
                      if (detailDialog) {
                        updateStatus.mutate({ id: detailDialog.id, status: k });
                        setDetailDialog(null);
                      }
                    }}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

