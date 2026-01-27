import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  UserCheck,
  DollarSign,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Loader2,
  Mail,
  Phone,
  Percent,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

interface SalonService {
  id: number;
  name: string;
  category: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
  commissionRate: string;
  specialties: string | null;
  active: boolean;
  createdAt: string;
  stats: {
    appointmentsThisMonth: number;
    revenueThisMonth: number;
    pendingCommissions: number;
    pendingCommissionsCount: number;
  };
}

interface TeamSummary {
  totalActive: number;
  totalStylists: number;
  totalManagers: number;
  totalReceptionists: number;
  pendingCommissionsTotal: number;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  OWNER: { label: 'Proprietario', color: 'bg-purple-100 text-purple-700' },
  MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-700' },
  RECEPTIONIST: { label: 'Recepcionista', color: 'bg-green-100 text-green-700' },
  STYLIST: { label: 'Profissional', color: 'bg-pink-100 text-pink-700' },
};

const AVATAR_COLORS = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Services for multi-select
  const [salonServices, setSalonServices] = useState<SalonService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STYLIST' as 'MANAGER' | 'RECEPTIONIST' | 'STYLIST',
    defaultCommission: 50,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, summaryRes, servicesRes] = await Promise.all([
        api.get(`/team?includeInactive=${showInactive}`),
        api.get('/team/summary'),
        api.get('/services'),
      ]);
      setMembers(membersRes.data);
      setSummary(summaryRes.data);
      setSalonServices(servicesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados da equipe' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalido';
    }

    if (formData.defaultCommission < 0 || formData.defaultCommission > 100) {
      errors.defaultCommission = 'Comissao deve estar entre 0 e 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STYLIST',
      defaultCommission: 50,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = async (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role === 'OWNER' ? 'MANAGER' : member.role,
      defaultCommission: parseFloat(member.commissionRate) * 100,
    });
    setFormErrors({});
    // Load assigned services
    try {
      const res = await api.get(`/team/${member.id}/services`);
      setSelectedServiceIds((res.data || []).map((s: any) => s.serviceId));
    } catch {
      setSelectedServiceIds([]);
    }
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await api.post('/team', formData);
      setMessage({ type: 'success', text: 'Membro adicionado com sucesso!' });
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao adicionar membro';
      setFormErrors({ submit: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !selectedMember) return;

    setIsSaving(true);
    try {
      await Promise.all([
        api.patch(`/team/${selectedMember.id}`, formData),
        api.patch(`/team/${selectedMember.id}/services`, { serviceIds: selectedServiceIds }),
      ]);
      setMessage({ type: 'success', text: 'Membro atualizado com sucesso!' });
      setShowEditModal(false);
      setSelectedMember(null);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao atualizar membro';
      setFormErrors({ submit: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedMember) return;

    setIsSaving(true);
    try {
      await api.delete(`/team/${selectedMember.id}`);
      setMessage({ type: 'success', text: 'Membro desativado com sucesso!' });
      setShowDeleteModal(false);
      setSelectedMember(null);
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao desativar membro' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReactivate = async (member: TeamMember) => {
    try {
      await api.patch(`/team/${member.id}/reactivate`);
      setMessage({ type: 'success', text: 'Membro reativado com sucesso!' });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao reativar membro' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-500 mt-1">Gerencie os profissionais do seu salao</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Membro
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalActive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Profissionais</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalStylists}</p>
              </div>
            </div>
          </div>

          <Link
            to="/comissoes"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Comissoes Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(summary.pendingCommissionsTotal)}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Mostrar inativos</span>
        </label>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro cadastrado</h3>
          <p className="text-gray-500 mb-6">Adicione o primeiro membro da sua equipe</p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar primeiro membro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-xl border border-gray-200 p-6 ${
                !member.active ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${getAvatarColor(
                      member.name
                    )} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        ROLE_LABELS[member.role]?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ROLE_LABELS[member.role]?.label || member.role}
                    </span>
                  </div>
                </div>
                {!member.active && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    Inativo
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {member.email}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Percent className="w-4 h-4 text-gray-400" />
                  Comissao: {(parseFloat(member.commissionRate) * 100).toFixed(0)}%
                </div>
              </div>

              {/* Stats */}
              {member.stats && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Atendimentos (mes)</p>
                      <p className="font-semibold text-gray-900">{member.stats.appointmentsThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Faturamento</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(member.stats.revenueThisMonth)}
                      </p>
                    </div>
                  </div>
                  {member.stats.pendingCommissionsCount > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700">
                        {member.stats.pendingCommissionsCount} comissoes pendentes:{' '}
                        <span className="font-semibold">
                          {formatCurrency(member.stats.pendingCommissions)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {member.active ? (
                  <>
                    {member.role !== 'OWNER' && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(member)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleReactivate(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Novo Membro</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Nome completo"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcao</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'MANAGER' | 'RECEPTIONIST' | 'STYLIST',
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="STYLIST">Profissional</option>
                    <option value="RECEPTIONIST">Recepcionista</option>
                    <option value="MANAGER">Gerente</option>
                  </select>
                </div>

                {formData.role === 'STYLIST' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comissao Padrao (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.defaultCommission}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultCommission: parseInt(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        formErrors.defaultCommission ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.defaultCommission && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.defaultCommission}</p>
                    )}
                  </div>
                )}

                {formErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formErrors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Editar Membro</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcao</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'MANAGER' | 'RECEPTIONIST' | 'STYLIST',
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="STYLIST">Profissional</option>
                    <option value="RECEPTIONIST">Recepcionista</option>
                    <option value="MANAGER">Gerente</option>
                  </select>
                </div>

                {formData.role === 'STYLIST' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comissao Padrao (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.defaultCommission}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultCommission: parseInt(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        formErrors.defaultCommission ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.defaultCommission && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.defaultCommission}</p>
                    )}
                  </div>
                )}

                {/* Especialidades (serviços que o profissional realiza) */}
                {formData.role === 'STYLIST' && salonServices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicos que realiza
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                      {salonServices.map((svc) => (
                        <label key={svc.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedServiceIds.includes(svc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServiceIds([...selectedServiceIds, svc.id]);
                              } else {
                                setSelectedServiceIds(selectedServiceIds.filter((id) => id !== svc.id));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{svc.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Deixe vazio para permitir todos os servicos
                    </p>
                  </div>
                )}

                {formErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formErrors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Desativar membro?</h3>
                <p className="text-gray-600 mb-2">
                  Tem certeza que deseja desativar{' '}
                  <span className="font-medium">{selectedMember.name}</span>?
                </p>
                {selectedMember.stats && selectedMember.stats.pendingCommissionsCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm mb-4">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Este membro possui {selectedMember.stats.pendingCommissionsCount} comissoes
                    pendentes ({formatCurrency(selectedMember.stats.pendingCommissions)})
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  O membro nao podera mais acessar o sistema ate ser reativado.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
