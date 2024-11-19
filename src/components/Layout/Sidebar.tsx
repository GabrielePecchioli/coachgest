import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home,
  Users,
  BarChart3,
  Settings,
  Target,
  Calendar,
  CreditCard,
  UserCircle,
  Building2,
  ChevronDown,
  Cog
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const getMenuItems = () => {
    switch (currentUser?.role) {
      case 'super_admin':
        return [
          { text: 'Dashboard', icon: Home, path: '/admin' },
          { text: 'Gestione Coach', icon: Users, path: '/admin/coaches' },
          { 
            text: 'Impostazioni',
            icon: Cog,
            path: '/admin/settings',
            submenu: [
              { text: 'Abbonamenti', path: '/admin/settings/subscriptions' },
              { text: 'Configurazione Stripe', path: '/admin/settings/stripe' },
            ]
          },
        ];
      case 'coach':
        return [
          { text: 'Dashboard', icon: Home, path: '/coach' },
          { text: 'Coachee', icon: Users, path: '/coach/coachees' },
          { text: 'Team', icon: Building2, path: '/coach/team' },
          { text: 'Calendario', icon: Calendar, path: '/coach/calendar' },
          { text: 'Report', icon: BarChart3, path: '/coach/reports' },
          { 
            text: 'Profilo',
            icon: UserCircle,
            path: '/coach/profile',
            submenu: [
              { text: 'Dati Personali', path: '/coach/profile' },
              { text: 'Dati Fatturazione', path: '/coach/profile/billing' },
            ]
          },
          { 
            text: 'Abbonamento',
            icon: CreditCard,
            path: '/coach/subscription',
            submenu: [
              { text: 'Piano Attivo', path: '/coach/subscription' },
              { text: 'Transazioni', path: '/coach/subscription/transactions' },
            ]
          },
        ];
      case 'coachee':
        return [
          { text: 'Dashboard', icon: Home, path: '/coachee' },
          { text: 'Obiettivi', icon: Target, path: '/coachee/goals' },
          { text: 'Sessioni', icon: Calendar, path: '/coachee/sessions' },
          { text: 'Assessment', icon: BarChart3, path: '/coachee/assessments' },
        ];
      default:
        return [];
    }
  };

  const MenuItem = ({ item }: { item: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = location.pathname === item.path;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    if (hasSubmenu) {
      const isSubmenuActive = item.submenu.some((subItem: any) => location.pathname === subItem.path);
      
      return (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600',
              (isActive || isSubmenuActive) && 'bg-primary-50 text-primary-600'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.text}
            <ChevronDown className={clsx(
              'ml-auto h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </button>
          {isOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {item.submenu.map((subItem: any) => (
                <button
                  key={subItem.path}
                  onClick={() => navigate(subItem.path)}
                  className={clsx(
                    'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                    location.pathname === subItem.path && 'bg-primary-50 text-primary-600'
                  )}
                >
                  {subItem.text}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate(item.path)}
        className={clsx(
          'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600',
          isActive && 'bg-primary-50 text-primary-600'
        )}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.text}
      </button>
    );
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">CoachGest</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {getMenuItems().map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}