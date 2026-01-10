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
  Loader2,
  FileText,
  Heart,
  X,
  History,
  RotateCcw,
  TrendingUp,
  UserCheck,
  DollarSign,
  Receipt,
  Gift,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import type {
  Client,
  ClientStats,
  ClientHistory,
  CreateClientData,
  UpdateClientData,
} from '../types/client';
import { formatPhone, getInitials, getStatusBadge } from '../types/client';
import { ClientPackagesCard } from '../components/ClientPackagesCard';

export function ClientsPage() {
  // State para dados
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterChurnRisk, setFilterChurnRisk] = useState(false);

  // State para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // State para seleção
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State para formulário
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    phone: '',
    email: '',
    technicalNotes: '',
    preferences: '',
    aiActive: true,
  });

  useEffect(() => {
    loadClients();
    loadStats();
  }, [showInactive]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (showInactive) params.append('includeInactive', 'true');

      const response = await api.get(`/clients?${params.toString()}`);
      setClients(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.response?.data?.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/clients/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const loadHistory = async (clientId: string) => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/clients/${clientId}/history`);
      setClientHistory(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      alert(err.response?.data?.message || 'Erro ao carregar histórico');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChurn = filterChurnRisk ? client.churnRisk : true;
    return matchesSearch && matchesChurn;
  });

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      technicalNotes: '',
      preferences: '',
      aiActive: true,
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone,
      email: client.email || '',
      technicalNotes: client.technicalNotes || '',
      preferences: client.preferences || '',
      aiActive: client.aiActive,
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleOpenHistoryModal = async (client: Client) => {
    setSelectedClient(client);
    setClientHistory(null);
    setShowHistoryModal(true);
    await loadHistory(client.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload: CreateClientData = {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email || undefined,
        technicalNotes: formData.technicalNotes || undefined,
        preferences: formData.preferences || undefined,
        aiActive: formData.aiActive,
      };

      await api.post('/clients', payload);
      await loadClients();
      await loadStats();
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err);
      setError(err.response?.data?.message || 'Erro ao criar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      setSaving(true);
      setError(null);

      const payload: UpdateClientData = {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email || undefined,
        technicalNotes: formData.technicalNotes || undefined,
        preferences: formData.preferences || undefined,
        aiActive: formData.aiActive,
      };

      await api.patch(`/clients/${selectedClient.id}`, payload);
      await loadClients();
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      setSaving(true);
      await api.delete(`/clients/${selectedClient.id}`);
      await loadClients();
      await loadStats();
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Erro ao desativar cliente:', err);
      alert(err.response?.data?.message || 'Erro ao desativar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async (client: Client) => {
    try {
      await api.patch(`/clients/${client.id}/reactivate`);
      await loadClients();
      await loadStats();
    } catch (err: any) {
      console.error('Erro ao reativar cliente:', err);
      alert(err.response?.data?.message || 'Erro ao reativar cliente');
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeClients || 0}</p>
              <p className="text-sm text-gray-500">Clientes Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.newThisMonth || 0}</p>
              <p className="text-sm text-gray-500">Novos Este Mês</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl">
              <UserCheck className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.recurringClients || 0}</p>
              <p className="text-sm text-gray-500">Recorrentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats?.churnRiskCount || 0}</p>
              <p className="text-sm text-gray-500">Risco de Perda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for churn risk */}
      {stats && stats.churnRiskCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Atenção: Clientes em Risco</p>
            <p className="text-sm text-amber-600">
              {stats.churnRiskCount} {stats.churnRiskCount === 1 ? 'cliente não visita' : 'clientes não visitam'} o
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Mostrar inativos</span>
          </label>

          <button
            onClick={() => setFilterChurnRisk(!filterChurnRisk)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              filterChurnRisk
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Risco de Perda
            {filterChurnRisk && stats && (
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.churnRiskCount}
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
                  Visitas
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
              {filteredClients.map((client) => {
                const statusBadge = getStatusBadge(client);
                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      client.churnRisk && client.active ? 'bg-amber-50' : ''
                    } ${!client.active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                            !client.active
                              ? 'bg-gray-400'
                              : client.churnRisk
                              ? 'bg-amber-500'
                              : 'bg-primary-600'
                          }`}
                        >
                          {getInitials(client.name)}
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
                        <span className="text-sm text-gray-400">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{client.totalVisits}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAI(client)}
                        disabled={!client.active}
                        className={`p-2 rounded-lg transition-colors ${
                          client.aiActive
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        } ${!client.active ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                      >
                        {client.churnRisk && client.active && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenHistoryModal(client)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Histórico"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {client.active ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(client)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(client)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReactivate(client)}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Reativar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                onClick={handleOpenCreateModal}
                className="mt-4 text-primary-600 hover:underline font-medium"
              >
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Criar Cliente */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Novo Cliente</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
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
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ex: Cabelo fino, sensível a amônia..."
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
                  placeholder="Ex: Prefere horários pela manhã..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="aiActiveCreate"
                  checked={formData.aiActive}
                  onChange={(e) => setFormData({ ...formData, aiActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="aiActiveCreate" className="text-sm text-gray-700">
                  <span className="font-medium">Ativar Atendimento por IA</span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    O cliente poderá ser atendido automaticamente pelo robô
                  </p>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
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
                  Notas Técnicas
                </label>
                <textarea
                  value={formData.technicalNotes}
                  onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ex: Cabelo fino, sensível a amônia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Preferências
                </label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ex: Prefere horários pela manhã..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="aiActiveEdit"
                  checked={formData.aiActive}
                  onChange={(e) => setFormData({ ...formData, aiActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="aiActiveEdit" className="text-sm text-gray-700">
                  <span className="font-medium">Ativar Atendimento por IA</span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    O cliente poderá ser atendido automaticamente pelo robô
                  </p>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Desativar Cliente
              </h3>

              <p className="text-gray-600 text-center mb-4">
                Tem certeza que deseja desativar o cliente{' '}
                <span className="font-medium">{selectedClient.name}</span>?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-medium">{formatPhone(selectedClient.phone)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Total de visitas:</span>
                  <span className="font-medium">{selectedClient.totalVisits}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Desativação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Histórico do Cliente</h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="font-medium">{selectedClient.name}</span>
                  <span>{formatPhone(selectedClient.phone)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : clientHistory ? (
                <div className="space-y-6">
                  {/* Pacotes Ativos */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Pacotes de Sessões
                    </h3>
                    <ClientPackagesCard
                      clientId={selectedClient.id}
                      clientName={selectedClient.name || undefined}
                    />
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Gasto</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        R$ {clientHistory.totalSpent.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Receipt className="w-5 h-5" />
                        <span className="text-sm font-medium">Ticket Médio</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        R$ {clientHistory.averageTicket.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-violet-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-violet-600 mb-1">
                        <History className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Visitas</span>
                      </div>
                      <p className="text-2xl font-bold text-violet-700">
                        {clientHistory.totalVisits}
                      </p>
                    </div>
                  </div>

                  {/* Lista de comandas */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Últimas Comandas
                    </h3>

                    {clientHistory.commands.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhuma visita registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientHistory.commands.map((command) => (
                          <div
                            key={command.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">
                                  Comanda #{command.cardNumber}
                                </p>
                                <p className="text-gray-500">
                                  {format(new Date(command.openedAt), 'dd/MM/yyyy HH:mm')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  command.status === 'CLOSED'
                                    ? 'bg-green-100 text-green-800'
                                    : command.status === 'OPEN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {command.status === 'CLOSED'
                                  ? 'Fechada'
                                  : command.status === 'OPEN'
                                  ? 'Aberta'
                                  : command.status}
                              </span>

                              <span className="font-semibold text-gray-900">
                                R$ {parseFloat(command.totalNet || '0').toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
