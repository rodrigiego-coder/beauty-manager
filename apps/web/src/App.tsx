import { Header, StatsCards, ChatControl, AppointmentsList } from './components';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titulo da pagina */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao painel de controle do seu salao</p>
        </div>

        {/* Cards de estatisticas */}
        <div className="mb-8">
          <StatsCards />
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Controle do Robo */}
          <div className="lg:col-span-1">
            <ChatControl />
          </div>

          {/* Coluna da direita - Agendamentos */}
          <div className="lg:col-span-2">
            <AppointmentsList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6 text-center text-sm text-gray-500">
        <p>Beauty Manager - Gestao Inteligente de Salao de Beleza</p>
      </footer>
    </div>
  );
}

export default App;
