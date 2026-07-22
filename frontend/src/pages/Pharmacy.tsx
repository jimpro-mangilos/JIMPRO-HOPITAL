import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import { formatDate, formatCurrency } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pill, AlertTriangle, Package } from 'lucide-react';

export default function Pharmacy() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [stockAdjust, setStockAdjust] = useState<{ id: string; name: string; quantity: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () =>
      fetch('/api/pharmacy/medications')
        .then((r) => r.json())
        .then((d) => d.data || d.medications || [])
        .catch(() => []),
  });

  const { data: stocks } = useQuery({
    queryKey: ['pharmacy-stocks'],
    queryFn: () =>
      fetch('/api/pharmacy/stock')
        .then((r) => r.json())
        .then((d) => d.data || d.stocks || [])
        .catch(() => []),
  });

  const [form, setForm] = useState({
    name: '',
    genericName: '',
    category: '',
    form: '',
    dosageUnit: '',
    unitPrice: '',
    description: '',
  });

  const [adjQty, setAdjQty] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch('/api/pharmacy/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, unitPrice: parseFloat(data.unitPrice) || 0 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast({ title: 'Médicament ajouté', variant: 'success' });
      setIsCreateOpen(false);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      fetch(`/api/pharmacy/stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-stocks'] });
      toast({ title: 'Stock mis à jour', variant: 'success' });
      setStockAdjust(null);
    },
    onError: () => toast({ title: 'Erreur', variant: 'error' }),
  });

  const filtered = (medications || []).filter((m: any) => {
    if (!search) return true;
    const name = `${m.name} ${m.genericName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getStockFor = (medId: string) => {
    if (!stocks) return null;
    const stockItems = stocks.filter((s: any) => s.medicationId === medId);
    const total = stockItems.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
    const minReorder = stockItems[0]?.reorderLevel || 10;
    return { total, minReorder, items: stockItems };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacie</h1>
          <p className="text-gray-500 mt-1">Gestion des médicaments et stocks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau médicament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Ajouter un médicament</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label required>Nom</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom commercial" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nom générique</Label>
                  <Input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} placeholder="DCI" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Analgésique..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Forme</Label>
                  <Select value={form.form} onValueChange={(v) => setForm({ ...form, form: v })}>
                    <SelectTrigger placeholder="Forme" />
                    <SelectContent>
                      {['comprimé', 'sirop', 'injection', 'gélule', 'crème', 'pommade', 'suppositoire', 'collyre'].map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Unité</Label>
                  <Input value={form.dosageUnit} onChange={(e) => setForm({ ...form, dosageUnit: e.target.value })} placeholder="mg, ml..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Prix unitaire (CDF)</Label>
                <Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate(form)} loading={createMutation.isPending}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher un médicament..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucun médicament trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médicament</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Forme</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m: any) => {
                  const stock = getStockFor(m.id);
                  const isLow = stock && stock.total <= stock.minReorder;
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary-500" />
                          <div>
                            <p className="font-medium">{m.name}</p>
                            {m.genericName && <p className="text-xs text-gray-400">{m.genericName}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{m.category || '—'}</TableCell>
                      <TableCell className="text-gray-500">{m.form || '—'}</TableCell>
                      <TableCell>{formatCurrency(m.unitPrice || 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn('font-semibold', isLow ? 'text-red-600' : 'text-green-600')}>
                            {stock?.total ?? '—'}
                          </span>
                          {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setStockAdjust({ id: m.id, name: m.name, quantity: stock?.total || 0 })}>
                          Ajuster stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={!!stockAdjust} onOpenChange={(v) => { if (!v) setStockAdjust(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajuster le stock — {stockAdjust?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Quantité actuelle: {stockAdjust?.quantity}</Label>
              <Input type="number" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} placeholder="Nouvelle quantité" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStockAdjust(null)}>Annuler</Button>
              <Button onClick={() => stockAdjust && stockMutation.mutate({ id: stockAdjust.id, quantity: parseInt(adjQty) || 0 })}>
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

