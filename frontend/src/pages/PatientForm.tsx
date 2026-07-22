import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patients as patientsApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface PatientFormProps {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  onSuccess: () => void;
}

export default function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const isEdit = !!patient;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
    gender: patient?.gender || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    city: patient?.city || '',
    bloodGroup: patient?.bloodGroup || '',
    allergies: patient?.allergies || '',
    chronicConditions: patient?.chronicConditions || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insuranceNumber: patient?.insuranceNumber || '',
    emergencyContact: patient?.emergencyContact || '',
    emergencyPhone: patient?.emergencyPhone || '',
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Requis';
    if (!form.lastName.trim()) errs.lastName = 'Requis';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Requis';
    if (!form.gender) errs.gender = 'Requis';
    if (!form.phone.trim()) errs.phone = 'Requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (isEdit) {
        const { error } = await patientsApi.update(patient!.id, form);
        if (error) throw new Error((error as any).message || 'Erreur');
      } else {
        const { error } = await patientsApi.create(form);
        if (error) throw new Error((error as any).message || 'Erreur');
      }

      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({ title: isEdit ? 'Patient modifié' : 'Patient créé', variant: 'success' });
      onSuccess();
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Une erreur est survenue', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Identity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Identité</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label required>Prénom</Label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              error={!!errors.firstName}
              placeholder="Prénom"
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label required>Nom</Label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              error={!!errors.lastName}
              placeholder="Nom"
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label required>Date de naissance</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              error={!!errors.dateOfBirth}
            />
            {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
          </div>
          <div className="space-y-1.5">
            <Label required>Genre</Label>
            <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
              <SelectTrigger placeholder="Sélectionner..." />
              <SelectContent>
                {Object.entries(GENDERS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label required>Téléphone</Label>
            <Input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={!!errors.phone}
              placeholder="+237 6XX XXX XXX"
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Adresse</Label>
            <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Adresse" />
          </div>
          <div className="space-y-1.5">
            <Label>Ville</Label>
            <Input value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Ville" />
          </div>
        </div>
      </div>

      {/* Medical */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Médical</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Groupe sanguin</Label>
            <Select value={form.bloodGroup} onValueChange={(v) => updateField('bloodGroup', v)}>
              <SelectTrigger placeholder="Sélectionner..." />
              <SelectContent>
                {Object.entries(BLOOD_GROUPS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Allergies</Label>
            <Input value={form.allergies} onChange={(e) => updateField('allergies', e.target.value)} placeholder="Allergies connues" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Maladies chroniques</Label>
            <Textarea
              value={form.chronicConditions}
              onChange={(e) => updateField('chronicConditions', e.target.value)}
              placeholder="Antécédents médicaux..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Insurance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Assurance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Assurance</Label>
            <Input value={form.insuranceProvider} onChange={(e) => updateField('insuranceProvider', e.target.value)} placeholder="Nom de l'assurance" />
          </div>
          <div className="space-y-1.5">
            <Label>N° d'assurance</Label>
            <Input value={form.insuranceNumber} onChange={(e) => updateField('insuranceNumber', e.target.value)} placeholder="Numéro" />
          </div>
        </div>
      </div>

      {/* Emergency */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact d'urgence</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={form.emergencyContact} onChange={(e) => updateField('emergencyContact', e.target.value)} placeholder="Nom du contact" />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone</Label>
            <Input value={form.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)} placeholder="Téléphone" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Modifier' : 'Créer le patient'}
        </Button>
      </div>
    </form>
  );
}
