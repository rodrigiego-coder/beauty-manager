import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardList, CreditCard, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  onMoreClick: () => void;
}

const mobileNavItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Comandas', href: '/comandas', icon: ClipboardList },
  { name: 'Caixa', href: '/caixa', icon: CreditCard },
];

export function BottomNav({ onMoreClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-2 ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        ))}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 h-full py-2 text-gray-500"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-xs mt-1">Mais</span>
        </button>
      </div>
    </nav>
  );
}
