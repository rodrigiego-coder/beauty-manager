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
  CreatePasswordPage,
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
  PaymentMethodsPage,
  PaymentDestinationsPage,
  UsersManagementPage,
  MyPlanPage,
  SalonSchedulePage,
  MySchedulePage,
  MyBlocksPage,
  PackagesPage,
  AccountsReceivablePage,
  StockPage,
} from './pages';
import AlexisConversationsPage from './pages/AlexisConversationsPage';
import AlexisSettingsPage from './pages/AlexisSettingsPage';
import AlexisLogsPage from './pages/AlexisLogsPage';
import { TriagePublicPage } from './pages/public/TriagePublicPage';
import { OnlineBookingPage } from './pages/public/OnlineBookingPage';
import { LandingPage } from './pages/public/LandingPage';
import { SignupPage } from './pages/public/SignupPage';
import { MyDashboardPage } from './pages/MyDashboardPage';
import { CommandsListPage } from './pages/CommandsListPage';

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
          <Route path="/inicio" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/criar-senha" element={<CreatePasswordPage />} />
          <Route path="/cart/:code" element={<CartLinkPublicPage />} />
          <Route path="/pre-avaliacao/:token" element={<TriagePublicPage />} />
          <Route path="/agendar/:salonSlug" element={<OnlineBookingPage />} />

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

            {/* Acesso: Todos - Lista de comandas */}
            <Route path="/comandas" element={<CommandsListPage />} />

            {/* Acesso: STYLIST, MANAGER, OWNER - Dashboard do profissional */}
            <Route
              path="/meu-painel"
              element={
                <RoleGuard allowedRoles={['STYLIST', 'MANAGER', 'OWNER']}>
                  <MyDashboardPage />
                </RoleGuard>
              }
            />

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
            <Route
              path="/pacotes"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <PackagesPage />
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
              path="/financeiro"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <FinancePage />
                </RoleGuard>
              }
            />
            <Route
              path="/financeiro/contas-receber"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <AccountsReceivablePage />
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
              path="/estoque"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <StockPage />
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
              path="/usuarios"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <UsersManagementPage />
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
              path="/configuracoes/formas-pagamento"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <PaymentMethodsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/configuracoes/destinos-pagamento"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <PaymentDestinationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/configuracoes/horarios"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                  <SalonSchedulePage />
                </RoleGuard>
              }
            />

            {/* Horarios e Bloqueios do Profissional */}
            <Route
              path="/meu-horario"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'STYLIST']}>
                  <MySchedulePage />
                </RoleGuard>
              }
            />
            <Route
              path="/meus-bloqueios"
              element={
                <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'STYLIST']}>
                  <MyBlocksPage />
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
            <Route
              path="/meu-plano"
              element={
                <RoleGuard allowedRoles={['OWNER']}>
                  <MyPlanPage />
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