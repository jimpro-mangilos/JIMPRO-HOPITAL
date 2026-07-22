import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLES } from '@/lib/constants';
import { getInitials, getFullName } from '@/lib/format';
import { Search, Phone, Mail, MapPin, Stethoscope } from 'lucide-react';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  speciality?: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
  user: { email: string; role: string };
}

export default function StaffList() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: () =>
      fetch('/api/staff')
        .then((r) => r.json())
        .then((d) => d.data || d.staff || [])
        .catch(() => []),
  });

  const departments = [...new Set((staff || []).map((s) => s.department).filter(Boolean))] as string[];

  const filtered = (staff || []).filter((s) => {
    if (search) {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      if (!name.includes(search.toLowerCase())) return false;
    }
    if (departmentFilter && s.department !== departmentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
        <p className="text-gray-500 mt-1">Gestion du personnel médical</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un membre du personnel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {departments.map((dept) => (
          <Badge
            key={dept}
            variant={departmentFilter === dept ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setDepartmentFilter(departmentFilter === dept ? '' : dept)}
          >
            {dept}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto mt-3" />
                <Skeleton className="h-4 w-24 mx-auto mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucun membre du personnel trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Avatar size="lg" className="mx-auto">
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg font-bold">
                    {getInitials(s.firstName, s.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-semibold text-gray-900">
                  {getFullName(s.firstName, s.lastName)}
                </h3>
                <p className="text-sm text-primary-600 font-medium">
                  {s.speciality || ROLES[s.user?.role] || '—'}
                </p>
                {s.department && (
                  <Badge variant="secondary" className="mt-2">{s.department}</Badge>
                )}
                <div className="mt-4 space-y-1.5 text-left text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {s.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {s.user?.email}
                  </div>
                  {s.position && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {s.position}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
