import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Bot,
  BotOff,
  Edit,
  Trash2,
  AlertTriangle,
  UserPlus,
  ChevronLeft,
  Loader2,
  FileText,
  Heart,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

interface Client {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  aiActive: boolean;
  technicalNotes: string | null;
  preferences: string | null;
  lastVisitDate: string | null;
  churnRisk: boolean;
  createdAt: string;
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChurnRisk, setFilterChurnRisk] = useState(false);
  
  // Controle de view
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    technicalNotes: '',
    preferences: '',
    aiActive: true,
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.response?.data?.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterChurnRisk ? client.churnRisk : true;
    return matchesSearch && matchesFilter;
  });

  const churnRiskCount = clients.filter((c) => c.churnRisk).length;
  const totalClients = clients.length;
  const activeAIClients = clients.filter((c) => c.aiActive).length;

  const handleNewClient = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      technicalNotes: '',
      preferences: '',
      aiActive: true,
    });
    setEditingClient(null);
    setView('new');
  };

  const handleEditClient = (client: Client) => {
    setFormData({
      name: client.name || '',
      phone: client.phone,
      email: client.email || '',
      technicalNotes: client.technicalNotes || '',
      preferences: client.preferences || '',
      aiActive: client.aiActive,
    });
    setEditingClient(client);
    setView('edit');
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email || undefined,
        technicalNotes: formData.technicalNotes || undefined,
        preferences: formData.preferences || undefined,
        aiActive: formData.aiActive,
      };

      if (view === 'edit' && editingClient) {
        await api.patch(`/clients/${editingClient.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }

      await loadClients();
      setView('list');
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      setError(err.response?.data?.message || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await api.delete(`/clients/${id}`);
      await loadClients();
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err);
      alert(err.response?.data?.message || 'Erro ao excluir cliente');
    }
  };

  const toggleAI = async (client: Client) => {
    try {
      await api.patch(`/clients/${client.id}/toggle-ai`);
      await loadClients();
    } catch (err: any) {
      console.error('Erro ao alternar IA:', err);
      alert(err.response?.data?.message || 'Erro ao alternar IA');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando clientes...</span>
      </div>
    );
  }

  // Form view (new/edit)
  if (view === 'new' || view === 'edit') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setView('list')}
          className="text-primary-600 flex items-center gap-2 hover:underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar para Lista
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          {view === 'edit' ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl">
          <form className="space-y-4" onSubmit={handleSaveClient}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                Notas Técnicas (tipo de cabelo, alergias, etc.)
              </label>
              <textarea
                value={formData.technicalNotes}
                onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ex: Cabelo fino, sensível a amônia, preferência por produtos veganos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Heart className="w-4 h-4 inline mr-1" />
                Preferências do Cliente
              </label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ex: Prefere horários pela manhã, gosta de café..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="aiActive"
                checked={formData.aiActive}
                onChange={(e) => setFormData({ ...formData, aiActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="aiActive" className="text-sm text-gray-700">
                <span className="font-medium">Ativar Atendimento por IA</span>
                <p className="text-gray-500 text-xs mt-0.5">
                  O cliente poderá ser atendido automaticamente pelo robô
                </p>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {view === 'edit' ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={handleNewClient}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
              <p className="text-sm text-gray-500">Risco de Perda </p>
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
            <p className="font-medium text-amber-800">Atenção: Clientes em Risco</p>
            <p className="text-sm text-amber-600">
              {churnRiskCount} {churnRiskCount === 1 ? 'cliente não visita' : 'clientes não visitam'} o
              salão há mais de 30 dias
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
            Risco de perda
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
                  Última Visita
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  IA
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
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
                          ? client.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                          : '??'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name || 'Sem nome'}</p>
                        {client.technicalNotes && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {client.technicalNotes}
                          </p>
                        )}
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
                    <button
                      onClick={() => toggleAI(client)}
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
                        Risco de perda
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
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
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
            <p className="text-gray-500">
              {clients.length === 0
                ? 'Nenhum cliente cadastrado ainda'
                : 'Nenhum cliente encontrado'}
            </p>
            {clients.length === 0 && (
              <button
                onClick={handleNewClient}
                className="mt-4 text-primary-600 hover:underline font-medium"
              >
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}