import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
} from './pages';

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
            <Route index element={<DashboardPage />} />
            <Route path="/agenda/*" element={<AppointmentsPage />} />
            <Route path="/financeiro/*" element={<FinancePage />} />
            <Route path="/estoque/*" element={<ProductsPage />} />
            <Route path="/clientes/*" element={<ClientsPage />} />
            <Route path="/equipe/*" element={<TeamPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/assinatura" element={<SubscriptionPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;