import { Calendar, ClipboardList, Users, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface BottomNavigationProps {
  onMenuClick: () => void;
}

export function BottomNavigation({ onMenuClick }: BottomNavigationProps) {
  const navItems = [
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/comandas', icon: ClipboardList, label: 'Comandas' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}

        {/* Botão Menu */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
