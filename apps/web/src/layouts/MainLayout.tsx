import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { SupportModeBanner } from '../components/SupportModeBanner';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const userInitials = user ? getInitials(user.name) : 'RV';
  const userName = user?.name || 'Usuario';
  const userRole = user ? getRoleLabel(user.role) : 'Administrador';

  return (
    <div className="min-h-screen bg-gray-50">
      <SupportModeBanner />
      <Sidebar />

      <div className="pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div></div>
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

                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
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

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}