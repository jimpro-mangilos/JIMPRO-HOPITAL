import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { getInitials } from '@/lib/format';
import { ROLES } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Home,
} from 'lucide-react';

const breadcrumbMap: Record<string, string> = {
  '/': 'Tableau de bord',
  '/appointments': 'Rendez-vous',
  '/patients': 'Patients',
  '/staff': 'Personnel',
  '/consultations': 'Consultations',
  '/emergency': 'Urgences',
  '/hospitalization': 'Hospitalisation',
  '/pharmacy': 'Pharmacie',
  '/laboratory': 'Laboratoire',
  '/imaging': 'Imagerie',
  '/billing': 'Facturation',
  '/reports': 'Rapports',
  '/users': 'Utilisateurs',
  '/settings': 'Paramètres',
  '/login': 'Connexion',
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];
  
  if (pathname === '/') {
    return [{ label: 'Tableau de bord', path: '/' }];
  }

  breadcrumbs.push({ label: 'Accueil', path: '/' });

  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    const label = breadcrumbMap[currentPath];
    if (label && currentPath !== '/') {
      breadcrumbs.push({ label, path: currentPath });
    } else if (!label) {
      // For detail pages like /patients/123
      const basePath = parts.length > 1 ? `/${parts[0]}` : currentPath;
      const baseLabel = breadcrumbMap[basePath];
      if (baseLabel && parts.length > 1 && part === parts[parts.length - 1]) {
        breadcrumbs.push({ label: 'Détail', path: currentPath });
      }
    }
  }

  return breadcrumbs;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggle } = useSidebarStore();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.staff
    ? `${user.staff.firstName} ${user.staff.lastName}`
    : user?.email || 'Utilisateur';

  const initials = user?.staff
    ? getInitials(user.staff.firstName, user.staff.lastName)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const roleLabel = user?.role ? ROLES[user.role] || user.role : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
              {index === 0 ? (
                <Home className="h-4 w-4 text-gray-400" />
              ) : null}
              <button
                onClick={() => navigate(crumb.path)}
                className={cn(
                  'hover:text-primary-600 transition-colors',
                  index === breadcrumbs.length - 1
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-500'
                )}
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">{roleLabel}</Badge>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} destructive>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
