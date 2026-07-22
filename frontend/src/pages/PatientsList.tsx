import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patients as patientsApi } from '@/lib/supabase-api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatPhone } from '@/lib/format';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import PatientForm from './PatientForm';
import { Plus, Search, Edit, Eye, UserPlus, Users } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  city: string;
  dateOfBirth: string;
  createdAt: string;
  isActive: boolean;
}

export default function PatientsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const result = await patientsApi.list(search, page, limit);
      return { data: result.data, total: result.count || 0 };
    },
  });

  const patients = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => patientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({ title: 'Patient supprimé', variant: 'success' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de supprimer le patient', variant: 'error' }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Gestion des patients de l'hôpital</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau patient</DialogTitle>
            </DialogHeader>
            <PatientForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un patient..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8">Erreur de chargement des patients</p>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucun patient trouvé</p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un nouveau patient'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p: Patient) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-semibold text-sm">
                            {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                          </div>
                          <div>
                            <p>{p.firstName} {p.lastName}</p>
                            <p className="text-xs text-gray-400">{GENDERS[p.gender] || p.gender}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{formatPhone(p.phone)}</TableCell>
                      <TableCell>
                        {p.bloodGroup ? (
                          <Badge variant="secondary">{BLOOD_GROUPS[p.bloodGroup] || p.bloodGroup}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">{p.city || '—'}</TableCell>
                      <TableCell className="text-gray-500">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/patients/${p.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {total} patient{total > 1 ? 's' : ''} au total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
