import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imaging as imagingApi } from '@/lib/supabase-api';
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
import { formatDateTime } from '@/lib/format';
import { IMAGING_STATUS, IMAGING_STATUS_COLORS, PRIORITY, PRIORITY_COLORS } from '@/lib/constants';
import { Scan, Search } from 'lucide-react';

export default function Imaging() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resultDialog, setResultDialog] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['imaging-requests', statusFilter],
    queryFn: async () => {
      const { data, error } = await imagingApi.requests.list(statusFilter || undefined);
      if (error) return [];
      return data || [];
    },
  });

  const [resultForm, setResultForm] = useState({
    findings: '',
    impression: '',
    reportUrl: '',
  });

  const addResultMutation = useMutation({
    mutationFn: async ({ requestId, data: resultData }: { requestId: string; data: any }) => {
      await imagingApi.requests.addResult({ ...resultData, imagingRequestId: requestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-requests'] });
      toast({ title: 'Résultat enregistré', variant: 'success' });
      setResultDialog(null);
      setResultForm({ findings: '', impression: '', reportUrl: '' });
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      imagingApi.requests.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-requests'] });
      toast({ title: 'Statut mis à jour', variant: 'success' });
    },
  });

  const filtered = (requests || []).filter((r: any) => {
    if (!search) return true;
    const name = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || r.imagingType?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Imagerie</h1>
        <p className="text-gray-500 mt-1">Gestion des demandes d'imagerie médicale</p>
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
                {Object.entries(IMAGING_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Scan className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune demande d'imagerie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r: any) => (
                <div key={r.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.imagingType}</span>
                        {r.bodyPart && <span className="text-sm text-gray-500">— {r.bodyPart}</span>}
                        <Badge className={PRIORITY_COLORS[r.priority]}>{PRIORITY[r.priority]}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {r.patient?.firstName} {r.patient?.lastName} — Demandé le {formatDateTime(r.requestedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={IMAGING_STATUS_COLORS[r.status]}>{IMAGING_STATUS[r.status]}</Badge>
                      <Select value={r.status} onValueChange={(v) => updateStatusMutation.mutate({ id: r.id, status: v })}>
                        <SelectTrigger className="w-32 h-8 text-xs" />
                        <SelectContent>
                          {Object.entries(IMAGING_STATUS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {r.clinicalInfo && <p className="text-sm text-gray-600 mb-2"><strong>Info clinique:</strong> {r.clinicalInfo}</p>}

                  {r.result ? (
                    <div className="bg-blue-50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-medium text-blue-700 mb-1">Résultat</p>
                      {r.result.findings && <p className="text-sm"><strong>Constats:</strong> {r.result.findings}</p>}
                      {r.result.impression && <p className="text-sm"><strong>Impression:</strong> {r.result.impression}</p>}
                    </div>
                  ) : (r.status === 'REALISE' || r.status === 'EN_ATTENTE') && (
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
          <DialogHeader><DialogTitle>Résultat — {resultDialog?.imagingType}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Constats</Label>
              <Textarea value={resultForm.findings} onChange={(e) => setResultForm({ ...resultForm, findings: e.target.value })} rows={3} placeholder="Décrire les constatations..." />
            </div>
            <div className="space-y-1.5">
              <Label>Impression</Label>
              <Textarea value={resultForm.impression} onChange={(e) => setResultForm({ ...resultForm, impression: e.target.value })} rows={2} placeholder="Impression diagnostique..." />
            </div>
            <div className="space-y-1.5">
              <Label>URL du rapport</Label>
              <Input value={resultForm.reportUrl} onChange={(e) => setResultForm({ ...resultForm, reportUrl: e.target.value })} placeholder="https://..." />
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
