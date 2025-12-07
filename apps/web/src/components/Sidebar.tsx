import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Package,
  Users,
  UserCog,
  FileText,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Estoque', href: '/estoque', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Equipe', href: '/equipe', icon: UserCog },
  { name: 'Relatorios', href: '/relatorios', icon: FileText },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'OWNER':
        return 'Proprietario';
      case 'MANAGER':
        return 'Gerente';
      case 'RECEPTIONIST':
        return 'Recepcionista';
      case 'STYLIST':
        return 'Profissional';
      default:
        return 'Usuario';
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Beauty Manager</h1>
          <p className="text-xs text-gray-400">Gestao Inteligente</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full">
          <Settings className="w-5 h-5" />
          Configuracoes
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-400 truncate">{getRoleLabel()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
