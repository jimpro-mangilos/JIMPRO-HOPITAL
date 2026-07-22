import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { ROLES } from '@/lib/constants';
import { getInitials, getFullName } from '@/lib/format';
import { User, Lock, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.staff?.firstName || '',
    lastName: user?.staff?.lastName || '',
    phone: user?.staff?.phone || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user?.staff?.id) throw new Error('No staff profile');
      const { error } = await supabase.from('staff').update({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      }).eq('id', user.staff.id);
      if (error) throw error;
    },
    onSuccess: () => toast({ title: 'Profil mis à jour', variant: 'success' }),
    onError: () => toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil', variant: 'error' }),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const errs: Record<string, string> = {};
      if (!passwordForm.currentPassword) errs.currentPassword = 'Requis';
      if (!passwordForm.newPassword) errs.newPassword = 'Requis';
      if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
      if (passwordForm.newPassword.length < 6) errs.newPassword = 'Minimum 6 caractères';
      setPasswordErrors(errs);
      if (Object.keys(errs).length > 0) throw new Error('Validation');
      const { error } = await supabase.rpc('change_user_password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Mot de passe changé', variant: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      if (err.message !== 'Validation') {
        toast({ title: 'Erreur', description: 'Mot de passe actuel incorrect', variant: 'error' });
      }
    },
  });

  const initials = user?.staff
    ? getInitials(user.staff.firstName, user.staff.lastName)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const userName = user?.staff
    ? getFullName(user.staff.firstName, user.staff.lastName)
    : user?.email || 'Utilisateur';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gestion du profil et des préférences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{userName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                {ROLES[user?.role || ''] || user?.role}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profileForm.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="pt-2">
              <Button onClick={() => updateProfile.mutate()} loading={updateProfile.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>Mettez à jour votre mot de passe de connexion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label required>Mot de passe actuel</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={!!passwordErrors.currentPassword}
              />
              {passwordErrors.currentPassword && <p className="text-xs text-red-500">{passwordErrors.currentPassword}</p>}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label required>Nouveau mot de passe</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={!!passwordErrors.newPassword}
              />
              {passwordErrors.newPassword && <p className="text-xs text-red-500">{passwordErrors.newPassword}</p>}
            </div>
            <div className="space-y-1.5">
              <Label required>Confirmer le mot de passe</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={!!passwordErrors.confirmPassword}
              />
              {passwordErrors.confirmPassword && <p className="text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
            </div>
            <div className="pt-2">
              <Button onClick={() => changePassword.mutate()} loading={changePassword.isPending}>
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
