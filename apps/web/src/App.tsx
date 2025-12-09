import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './components';
import { MainLayout } from './layouts/MainLayout';
import {
  DashboardPage,
  ProductsPage,
  FinancePage,
  ReportsPage,
  ClientsPage,
  AppointmentsPage,
  LoginPage,
  TeamPage,
  SettingsPage,
  SubscriptionPage,
  ProfilePage,
  CommandPage,
} from './pages';

type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

// Componente para proteger rotas por role
function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: UserRole[] 
}) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota publica */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            {/* Acesso: Todos */}
            <Route index element={<DashboardPage />} />
            <Route path="/agenda/*" element={<AppointmentsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/comandas/:id" element={<CommandPage />} />

            {/* Acesso: OWNER, MANAGER, RECEPTIONIST */}
            <Route 
              path="/clientes/*" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <ClientsPage />
                </RoleGuard>
              } 
            />

            {/* Acesso: OWNER, MANAGER */}
            <Route 
              path="/financeiro/*" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <FinancePage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/estoque/*" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <ProductsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/equipe/*" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <TeamPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/relatorios" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <ReportsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <SettingsPage />
                </RoleGuard>
              } 
            />

            {/* Acesso: Apenas OWNER */}
            <Route 
              path="/assinatura" 
              element={
                <RoleGuard allowedRoles={['OWNER']}>
                  <SubscriptionPage />
                </RoleGuard>
              } 
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;