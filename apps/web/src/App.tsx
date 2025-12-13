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
  CashierPage,
  ServicesPage,
  CommissionsPage,
  AdminPage,
  IntegrationsPage,
  AutomationPage,
  RecommendationRulesPage,
  RecommendationStatsPage,
  LoyaltySettingsPage,
  LoyaltyDashboardPage,
  ProductSubscriptionPlansPage,
  SubscriptionDeliveriesPage,
  AvailableSubscriptionsPage,
  UpsellRulesPage,
  CartLinksPage,
  CartLinkPublicPage,
  ReservationsPage,
  ABTestsPage,
} from './pages';
import AlexisConversationsPage from './pages/AlexisConversationsPage';
import AlexisSettingsPage from './pages/AlexisSettingsPage';
import AlexisLogsPage from './pages/AlexisLogsPage';

type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST' | 'SUPER_ADMIN';

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
          {/* Rotas publicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart/:code" element={<CartLinkPublicPage />} />

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
              path="/caixa"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <CashierPage />
                </RoleGuard>
              }
            />
            <Route 
              path="/clientes/*" 
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <ClientsPage />
                </RoleGuard>
              } 
            />

            {/* Acesso: OWNER, MANAGER, RECEPTIONIST */}
            <Route
              path="/servicos"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <ServicesPage />
                </RoleGuard>
              }
            />

            {/* Acesso: OWNER, MANAGER */}
            <Route
              path="/comissoes"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <CommissionsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/financeiro/*"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <FinancePage />
                </RoleGuard>
              }
            />
            <Route
              path="/produtos"
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
            <Route
              path="/integracoes"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'STYLIST']}>
                  <IntegrationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/automacao"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <AutomationPage />
                </RoleGuard>
              }
            />

            {/* Rotas de Recomendações de Produtos */}
            <Route
              path="/recomendacoes/regras"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <RecommendationRulesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/recomendacoes/stats"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <RecommendationStatsPage />
                </RoleGuard>
              }
            />

            {/* Rotas de Fidelidade & Gamificação */}
            <Route
              path="/configuracoes/fidelidade"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <LoyaltySettingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/relatorios/fidelidade"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <LoyaltyDashboardPage />
                </RoleGuard>
              }
            />

            {/* Rotas de Assinaturas de Produtos */}
            <Route
              path="/assinaturas-produtos/planos"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <ProductSubscriptionPlansPage />
                </RoleGuard>
              }
            />
            <Route
              path="/assinaturas-produtos/entregas"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <SubscriptionDeliveriesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/assinaturas-produtos"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST']}>
                  <AvailableSubscriptionsPage />
                </RoleGuard>
              }
            />

            {/* Rotas de Upsell & Vendas (FASE D) */}
            <Route
              path="/upsell/regras"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <UpsellRulesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/cart-links"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <CartLinksPage />
                </RoleGuard>
              }
            />
            <Route
              path="/reservas"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <ReservationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ab-tests"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <ABTestsPage />
                </RoleGuard>
              }
            />

            {/* ALEXIS - IA para WhatsApp & Dashboard */}
            <Route
              path="/alexis"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'RECEPTIONIST']}>
                  <AlexisConversationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/alexis/configuracoes"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <AlexisSettingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/alexis/logs"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <AlexisLogsPage />
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

            {/* Acesso: Apenas SUPER_ADMIN */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                  <AdminPage />
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