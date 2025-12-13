import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Package,
  Users,
  UserCog,
  FileText,
  Settings,
  LogOut,
  Crown,
  CreditCard,
  Scissors,
  Percent,
  Link2,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Repeat,
  Truck,
  ShoppingCart,
  Zap,
  FlaskConical,
  ShoppingBag,
  Bot,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[]; // Roles que podem ver este item
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Caixa', href: '/caixa', icon: CreditCard, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Agenda', href: '/agenda', icon: Calendar, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Servicos', href: '/servicos', icon: Scissors, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Comissoes', href: '/comissoes', icon: Percent, roles: ['OWNER', 'MANAGER'] },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ['OWNER', 'MANAGER'] },
  { name: 'Produtos', href: '/produtos', icon: Package, roles: ['OWNER', 'MANAGER'] },
  { name: 'Assinaturas', href: '/assinaturas-produtos', icon: Repeat, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Entregas', href: '/assinaturas-produtos/entregas', icon: Truck, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Reservas', href: '/reservas', icon: ShoppingBag, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Links Carrinho', href: '/cart-links', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Upsell', href: '/upsell/regras', icon: Zap, roles: ['OWNER', 'MANAGER'] },
  { name: 'Testes A/B', href: '/ab-tests', icon: FlaskConical, roles: ['OWNER', 'MANAGER'] },
  { name: 'ALEXIS IA', href: '/alexis', icon: Bot, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Recomendacoes', href: '/recomendacoes/regras', icon: Lightbulb, roles: ['OWNER', 'MANAGER'] },
  { name: 'Clientes', href: '/clientes', icon: Users, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Equipe', href: '/equipe', icon: UserCog, roles: ['OWNER', 'MANAGER'] },
  { name: 'Relatorios', href: '/relatorios', icon: FileText, roles: ['OWNER', 'MANAGER'] },
];

const bottomNavigation: NavItem[] = [
  { name: 'Fidelidade', href: '/configuracoes/fidelidade', icon: Crown, roles: ['OWNER', 'MANAGER'] },
  { name: 'Integracoes', href: '/integracoes', icon: Link2, roles: ['OWNER', 'MANAGER', 'STYLIST'] },
  { name: 'Automacao', href: '/automacao', icon: MessageSquare, roles: ['OWNER', 'MANAGER'] },
  { name: 'Assinatura', href: '/assinatura', icon: CreditCard, roles: ['OWNER'] },
  { name: 'Configuracoes', href: '/configuracoes', icon: Settings, roles: ['OWNER', 'MANAGER'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCashStatus = async () => {
      try {
        const response = await api.get('/cash-registers/current');
        setCashOpen(response.data !== null && response.data !== '');
      } catch {
        setCashOpen(false);
      }
    };

    checkCashStatus();
    // Verificar a cada 30 segundos
    const interval = setInterval(checkCashStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Filtra itens de navegação baseado no role do usuário
  const userRole = (user?.role || 'STYLIST') as UserRole;
  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole));
  const filteredBottomNav = bottomNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Beauty Manager</h1>
          <p className="text-xs text-gray-400">Gestao Inteligente</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => (
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
            {item.name === 'Caixa' && cashOpen !== null && (
              <span
                className={`ml-auto w-2.5 h-2.5 rounded-full ${
                  cashOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={cashOpen ? 'Caixa aberto' : 'Caixa fechado'}
              />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        {filteredBottomNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>

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