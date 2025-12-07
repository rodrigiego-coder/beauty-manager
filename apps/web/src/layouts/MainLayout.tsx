import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Bell } from 'lucide-react';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {/* Breadcrumb or page title will be here */}
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Rodrigo Viana</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  RV
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
