import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Bot,
  BotOff,
  Edit,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  aiActive: boolean;
  lastVisitDate: string | null;
  churnRisk: boolean;
  totalAppointments: number;
}

const mockClients: Client[] = [
  { id: '1', name: 'Maria Silva', phone: '11999998888', email: 'maria@email.com', aiActive: true, lastVisitDate: '2024-01-10', churnRisk: false, totalAppointments: 15 },
  { id: '2', name: 'Ana Costa', phone: '11999997777', email: 'ana@email.com', aiActive: true, lastVisitDate: '2024-01-08', churnRisk: false, totalAppointments: 8 },
  { id: '3', name: 'Julia Santos', phone: '11999996666', email: null, aiActive: false, lastVisitDate: '2023-11-15', churnRisk: true, totalAppointments: 3 },
  { id: '4', name: 'Carla Lima', phone: '11999995555', email: 'carla@email.com', aiActive: true, lastVisitDate: '2024-01-12', churnRisk: false, totalAppointments: 22 },
  { id: '5', name: 'Fernanda Oliveira', phone: '11999994444', email: 'fernanda@email.com', aiActive: true, lastVisitDate: '2023-12-20', churnRisk: true, totalAppointments: 5 },
  { id: '6', name: 'Patricia Souza', phone: '11999993333', email: null, aiActive: false, lastVisitDate: '2024-01-05', churnRisk: false, totalAppointments: 12 },
  { id: '7', name: 'Camila Rodrigues', phone: '11999992222', email: 'camila@email.com', aiActive: true, lastVisitDate: '2024-01-14', churnRisk: false, totalAppointments: 18 },
  { id: '8', name: 'Beatriz Almeida', phone: '11999991111', email: 'beatriz@email.com', aiActive: true, lastVisitDate: '2023-10-10', churnRisk: true, totalAppointments: 2 },
];

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChurnRisk, setFilterChurnRisk] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterChurnRisk ? client.churnRisk : true;
    return matchesSearch && matchesFilter;
  });

  const churnRiskCount = clients.filter((c) => c.churnRisk).length;
  const totalClients = clients.length;
  const activeAIClients = clients.filter((c) => c.aiActive).length;

  const toggleAI = (clientId: string) => {
    setClients(
      clients.map((c) => (c.id === clientId ? { ...c, aiActive: !c.aiActive } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              <p className="text-sm text-gray-500">Total de Clientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Bot className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeAIClients}</p>
              <p className="text-sm text-gray-500">Com IA Ativa</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{churnRiskCount}</p>
              <p className="text-sm text-gray-500">Risco de Churn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for churn risk */}
      {churnRiskCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Atencao: Clientes em Risco</p>
            <p className="text-sm text-amber-600">
              {churnRiskCount} {churnRiskCount === 1 ? 'cliente nao visita' : 'clientes nao visitam'} o
              salao ha mais de 30 dias
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <button
            onClick={() => setFilterChurnRisk(!filterChurnRisk)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              filterChurnRisk
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Risco de Churn
            {filterChurnRisk && (
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                {churnRiskCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ultima Visita
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Atendimentos
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  IA
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    client.churnRisk ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          client.churnRisk ? 'bg-amber-500' : 'bg-primary-600'
                        }`}
                      >
                        {client.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {formatPhone(client.phone)}
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.lastVisitDate ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(client.lastVisitDate), 'dd/MM/yyyy')}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Nunca visitou</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {client.totalAppointments}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAI(client.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        client.aiActive
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={client.aiActive ? 'IA Ativa' : 'IA Pausada'}
                    >
                      {client.aiActive ? (
                        <Bot className="w-5 h-5" />
                      ) : (
                        <BotOff className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {client.churnRisk ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Risco de Churn
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={editingClient?.name || ''}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    defaultValue={editingClient?.phone || ''}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    defaultValue={editingClient?.email || ''}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="aiActive"
                    defaultChecked={editingClient?.aiActive ?? true}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="aiActive" className="text-sm text-gray-700">
                    <span className="font-medium">Ativar Atendimento por IA</span>
                    <p className="text-gray-500 text-xs mt-0.5">
                      O cliente podera ser atendido automaticamente pelo robo
                    </p>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    {editingClient ? 'Salvar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
