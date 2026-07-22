import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billing as billingApi, patients as patientsApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { INVOICE_STATUS, INVOICE_STATUS_COLORS, PAYMENT_METHODS } from '@/lib/constants';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Receipt, DollarSign, Printer } from 'lucide-react';

export default function Billing() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: async () => {
      const { data } = await billingApi.invoices.list(statusFilter || undefined);
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
    lines: [{ description: '', quantity: 1, unitPrice: 0, category: 'Consultation' }],
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'ESPECES' });

  const createMutation = useMutation({
    mutationFn: async () => {
      await billingApi.invoices.create({
        ...form,
        lines: form.lines.map((l) => ({ ...l, amount: l.quantity * l.unitPrice })),
        totalAmount: form.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Facture créée', variant: 'success' });
      setIsCreateOpen(false);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount, method }: { id: string; amount: number; method: string }) =>
      billingApi.invoices.recordPayment(id, amount, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Paiement enregistré', variant: 'success' });
      setPaymentDialog(null);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: '', quantity: 1, unitPrice: 0, category: 'Consultation' }] });
  const removeLine = (i: number) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const filtered = (invoices || []).filter((inv: any) => {
    if (!search) return true;
    const name = `${inv.patient?.firstName || ''} ${inv.patient?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
  });

  const totalRevenue = (invoices || []).reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = (invoices || []).reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
  const totalOutstanding = totalRevenue - totalPaid;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
          <p className="text-gray-500 mt-1">Gestion des factures et paiements</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Lignes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>+ Ligne</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {form.lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end p-2 rounded bg-gray-50">
                      <div className="col-span-4">
                        <Input value={l.description} onChange={(e) => {
                          const lines = [...form.lines];
                          lines[i].description = e.target.value;
                          setForm({ ...form, lines });
                        }} placeholder="Description" size-sm />
                      </div>
                      <div className="col-span-2">
                        <Select value={l.category} onValueChange={(v) => {
                          const lines = [...form.lines];
                          lines[i].category = v;
                          setForm({ ...form, lines });
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Consultation', 'Médicament', 'Analyse', 'Imagerie', 'Hospitalisation', 'Acte'].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={l.quantity} onChange={(e) => {
                          const lines = [...form.lines];
                          lines[i].quantity = parseInt(e.target.value) || 0;
                          setForm({ ...form, lines });
                        }} placeholder="Qté" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={l.unitPrice} onChange={(e) => {
                          const lines = [...form.lines];
                          lines[i].unitPrice = parseFloat(e.target.value) || 0;
                          setForm({ ...form, lines });
                        }} placeholder="Prix" />
                      </div>
                      <div className="col-span-1 text-right text-sm font-medium">
                        {formatCurrency(l.quantity * l.unitPrice)}
                      </div>
                      <div className="col-span-1">
                        {form.lines.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeLine(i)} className="h-6 w-6 text-red-500">×</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 text-lg font-bold">
                  Total: {formatCurrency(form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Créer la facture</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total facturé</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total payé</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Restant dû</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
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
                {Object.entries(INVOICE_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune facture</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.patient?.firstName} {inv.patient?.lastName}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(inv.issuedAt)}</TableCell>
                    <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge className={INVOICE_STATUS_COLORS[inv.status]}>{INVOICE_STATUS[inv.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(inv.status === 'EMISE' || inv.status === 'PARTIELLE' || inv.status === 'BROUILLON') && (
                        <Button size="sm" variant="outline" onClick={() => { setPaymentDialog(inv); setPaymentForm({ amount: String(inv.totalAmount - inv.paidAmount), method: 'ESPECES' }); }}>
                          <DollarSign className="mr-1 h-3 w-3" />
                          Paiement
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

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={(v) => { if (!v) setPaymentDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Facture: <strong>{paymentDialog?.invoiceNumber}</strong></p>
            <p className="text-sm text-gray-600">Restant dû: <strong>{paymentDialog ? formatCurrency(paymentDialog.totalAmount - paymentDialog.paidAmount) : ''}</strong></p>
            <div className="space-y-1.5">
              <Label>Montant</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Méthode</Label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v })}>
                <SelectTrigger />
                <SelectContent>
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setPaymentDialog(null)}>Annuler</Button>
              <Button onClick={() => paymentDialog && paymentMutation.mutate({ id: paymentDialog.id, amount: parseFloat(paymentForm.amount) || 0, method: paymentForm.method })} loading={paymentMutation.isPending}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
