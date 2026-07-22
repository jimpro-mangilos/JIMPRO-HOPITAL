import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/format';
import { LAB_STATUS, LAB_STATUS_COLORS, PRIORITY, PRIORITY_COLORS } from '@/lib/constants';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FlaskConical, AlertTriangle, Search } from 'lucide-react';

export default function Laboratory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resultDialog, setResultDialog] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['lab-requests', statusFilter],
    queryFn: () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      return fetch(`/api/laboratory${params}`)
        .then((r) => r.json())
        .then((d) => d.data || d.labRequests || [])
        .catch(() => []);
    },
  });

  const [resultForm, setResultForm] = useState({
    parameter: '',
    value: '',
    unit: '',
    normalMin: '',
    normalMax: '',
  });

  const addResultMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: any }) =>
      fetch(`/api/laboratory/${requestId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          value: parseFloat(data.value),
          normalMin: data.normalMin ? parseFloat(data.normalMin) : undefined,
          normalMax: data.normalMax ? parseFloat(data.normalMax) : undefined,
          isAbnormal: data.normalMin && data.normalMax && (parseFloat(data.value) < parseFloat(data.normalMin) || parseFloat(data.value) > parseFloat(data.normalMax)),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
      toast({ title: 'Résultat ajouté', variant: 'success' });
      setResultForm({ parameter: '', value: '', unit: '', normalMin: '', normalMax: '' });
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/laboratory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
      toast({ title: 'Statut mis à jour', variant: 'success' });
    },
  });

  const filtered = (requests || []).filter((r: any) => {
    if (!search) return true;
    const name = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || r.testType?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laboratoire</h1>
        <p className="text-gray-500 mt-1">Gestion des demandes d'analyses</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44" placeholder="Statut" />
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                {Object.entries(LAB_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune demande d'analyse</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r: any) => (
                <div key={r.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.testType}</span>
                        <Badge className={PRIORITY_COLORS[r.priority]}>{PRIORITY[r.priority]}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {r.patient?.firstName} {r.patient?.lastName} — Demandé le {formatDateTime(r.requestedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={LAB_STATUS_COLORS[r.status]}>{LAB_STATUS[r.status]}</Badge>
                      <Select value={r.status} onValueChange={(v) => updateStatusMutation.mutate({ id: r.id, status: v })}>
                        <SelectTrigger className="w-32 h-8 text-xs" />
                        <SelectContent>
                          {Object.entries(LAB_STATUS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {r.results?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Résultats</p>
                      <div className="space-y-1">
                        {r.results.map((res: any) => (
                          <div key={res.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{res.parameter}</span>
                            <span className={res.isAbnormal ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                              {res.value} {res.unit}
                              {res.normalMin != null && res.normalMax != null && (
                                <span className="text-gray-400 text-xs ml-1">({res.normalMin}-{res.normalMax})</span>
                              )}
                              {res.isAbnormal && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.status !== 'TERMINE' && r.status !== 'VALIDE' && (
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <Button size="sm" variant="outline" onClick={() => setResultDialog(r)}>
                        Ajouter un résultat
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={!!resultDialog} onOpenChange={(v) => { if (!v) setResultDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un résultat — {resultDialog?.testType}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label required>Paramètre</Label>
                <Input value={resultForm.parameter} onChange={(e) => setResultForm({ ...resultForm, parameter: e.target.value })} placeholder="Hémoglobine..." />
              </div>
              <div className="space-y-1.5">
                <Label required>Valeur</Label>
                <Input type="number" step="any" value={resultForm.value} onChange={(e) => setResultForm({ ...resultForm, value: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label required>Unité</Label>
                <Input value={resultForm.unit} onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })} placeholder="g/dL, mmol/L..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min normal</Label>
                <Input type="number" step="any" value={resultForm.normalMin} onChange={(e) => setResultForm({ ...resultForm, normalMin: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Max normal</Label>
                <Input type="number" step="any" value={resultForm.normalMax} onChange={(e) => setResultForm({ ...resultForm, normalMax: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setResultDialog(null)}>Annuler</Button>
              <Button onClick={() => resultDialog && addResultMutation.mutate({ requestId: resultDialog.id, data: resultForm })} loading={addResultMutation.isPending}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
