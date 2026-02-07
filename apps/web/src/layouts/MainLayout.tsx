import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { SupportModeBanner } from '../components/SupportModeBanner';
import { ApiRetryBanner } from '../components/ApiRetryBanner';
import {
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  X,
  Sparkles,
  LayoutDashboard,
  Calendar,
  DollarSign,
  Package,
  Users,
  UserCog,
  UsersRound,
  FileText,
  Crown,
  CreditCard,
  Scissors,
  Percent,
  Link2,
  MessageSquare,
  Lightbulb,
  Repeat,
  Truck,
  ShoppingCart,
  Zap,
  FlaskConical,
  ShoppingBag,
  Bot,
  Clock,
  CalendarOff,
  ClipboardList,
  Gift,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Meu Painel', href: '/meu-painel', icon: User, roles: ['STYLIST', 'MANAGER', 'OWNER'] },
  { name: 'Meu Horario', href: '/meu-horario', icon: Clock, roles: ['STYLIST', 'MANAGER', 'OWNER'] },
  { name: 'Meus Bloqueios', href: '/meus-bloqueios', icon: CalendarOff, roles: ['STYLIST', 'MANAGER', 'OWNER'] },
  { name: 'Caixa', href: '/caixa', icon: CreditCard, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Agenda', href: '/agenda', icon: Calendar, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Comandas', href: '/comandas', icon: ClipboardList, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST'] },
  { name: 'Servicos', href: '/servicos', icon: Scissors, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { name: 'Pacotes', href: '/pacotes', icon: Gift, roles: ['OWNER', 'MANAGER'] },
  { name: 'Comissoes', href: '/comissoes', icon: Percent, roles: ['OWNER', 'MANAGER'] },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ['OWNER', 'MANAGER'] },
  { name: 'Produtos', href: '/produtos', icon: Package, roles: ['OWNER', 'MANAGER'] },
  { name: 'Estoque', href: '/estoque', icon: BarChart3, roles: ['OWNER', 'MANAGER'] },
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
  { name: 'Usuarios', href: '/usuarios', icon: UsersRound, roles: ['OWNER', 'MANAGER'] },
  { name: 'Relatorios', href: '/relatorios', icon: FileText, roles: ['OWNER', 'MANAGER'] },
];

const bottomNavigation: NavItem[] = [
  { name: 'Fidelidade', href: '/configuracoes/fidelidade', icon: Crown, roles: ['OWNER', 'MANAGER'] },
  { name: 'Integracoes', href: '/integracoes', icon: Link2, roles: ['OWNER', 'MANAGER', 'STYLIST'] },
  { name: 'Automacao', href: '/automacao', icon: MessageSquare, roles: ['OWNER', 'MANAGER'] },
  { name: 'Horarios Salao', href: '/configuracoes/horarios', icon: Clock, roles: ['OWNER', 'MANAGER'] },
  { name: 'Meu Plano', href: '/meu-plano', icon: Sparkles, roles: ['OWNER'] },
  { name: 'Faturamento', href: '/assinatura', icon: CreditCard, roles: ['OWNER'] },
  { name: 'Configuracoes', href: '/configuracoes', icon: Settings, roles: ['OWNER', 'MANAGER'] },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowMenu(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      OWNER: 'Proprietario',
      MANAGER: 'Gerente',
      RECEPTIONIST: 'Recepcionista',
      STYLIST: 'Profissional',
    };
    return roles[role] || role;
  };

  const handleNavigate = (path: string) => {
    setShowMenu(false);
    navigate(path);
  };

  const handleMobileNavClick = (href: string) => {
    setShowMobileSidebar(false);
    navigate(href);
  };

  const userInitials = user ? getInitials(user.name) : 'RV';
  const userName = user?.name || 'Usuario';
  const userRole = user ? getRoleLabel(user.role) : 'Administrador';

  const userRoleKey = (user?.role || 'STYLIST') as UserRole;
  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRoleKey));
  const filteredBottomNav = bottomNavigation.filter((item) => item.roles.includes(userRoleKey));

  return (
    <div className="min-h-screen bg-gray-50">
      <SupportModeBanner />
      <ApiRetryBanner />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-gray-900 text-white flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Beauty Manager</h1>
                  <p className="text-xs text-gray-400">Gestao Inteligente</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
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

            {/* Bottom navigation */}
            <div className="px-3 py-4 border-t border-gray-800 space-y-1">
              {filteredBottomNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
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
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-400 truncate">{userRole}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Mobile: Show app name */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Beauty Manager</span>
            </div>
            {/* Desktop: Empty space */}
            <div className="hidden md:block"></div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 p-1 pr-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {userInitials}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />

                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          onClick={() => handleNavigate('/perfil')}
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Meu Perfil
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          onClick={() => handleNavigate('/configuracoes')}
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Configuracoes
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {isLoggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - mobile only */}
      <BottomNav onMoreClick={() => setShowMobileSidebar(true)} />
    </div>
  );
}
