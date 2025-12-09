import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Clock,
  DollarSign,
  Star,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

interface WorkSchedule {
  [key: string]: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  commissionRate: string;
  workSchedule: WorkSchedule | null;
  specialties: string | null;
  active: boolean;
}

const weekDays = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terca' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const roleLabels: Record<UserRole, string> = {
  OWNER: 'Proprietario',
  MANAGER: 'Gerente',
  RECEPTIONIST: 'Recepcionista',
  STYLIST: 'Profissional',
};

const roleColors: Record<UserRole, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  RECEPTIONIST: 'bg-amber-100 text-amber-700',
  STYLIST: 'bg-emerald-100 text-emerald-700',
};

export function TeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STYLIST' as UserRole,
    commissionRate: '50',
    specialties: '',
    password: '',
    workSchedule: {} as WorkSchedule,
  });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data } = await api.get('/users');
      setTeam(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar equipe' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stylists = team.filter((m) => m.role === 'STYLIST' && m.active).length;
  const totalCommission = team
    .filter((m) => m.role === 'STYLIST')
    .reduce((sum, m) => sum + parseFloat(m.commissionRate || '0') * 100, 0);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    // Converte de decimal (0.50) para porcentagem (50) no formulario
    const commissionPercent = (parseFloat(member.commissionRate || '0') * 100).toFixed(0);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      commissionRate: commissionPercent,
      specialties: member.specialties || '',
      password: '',
      workSchedule: member.workSchedule || {},
    });
    setShowModal(true);
    setMessage(null);
  };

  const openNewModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STYLIST',
      commissionRate: '50',
      specialties: '',
      password: '',
      workSchedule: {},
    });
    setShowModal(true);
    setMessage(null);
  };

  const handleScheduleChange = (day: string, value: string) => {
    setFormData({
      ...formData,
      workSchedule: {
        ...formData.workSchedule,
        [day]: value || null,
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setTeam(team.filter((m) => m.id !== id));
      setMessage({ type: 'success', text: 'Membro removido com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao remover membro' });
    }
  };

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Converte comissao de porcentagem para decimal (40% -> 0.40)
      const commissionDecimal = formData.role === 'STYLIST' 
        ? (parseFloat(formData.commissionRate) / 100).toFixed(2)
        : '0.00';

      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        role: formData.role,
        commissionRate: commissionDecimal,
        specialties: formData.role === 'STYLIST' ? formData.specialties : null,
        workSchedule: formData.workSchedule,
        salonId: user?.salonId,
      };

      if (editingMember) {
        const { data } = await api.patch(`/users/${editingMember.id}`, payload);
        setTeam(team.map((m) => (m.id === editingMember.id ? data : m)));
        setMessage({ type: 'success', text: 'Membro atualizado com sucesso!' });
        setShowModal(false);
      } else {
        if (!formData.password || formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Senha deve ter no minimo 6 caracteres' });
          setIsSaving(false);
          return;
        }
        const { data } = await api.post('/users', { ...payload, password: formData.password });
        setTeam([...team, data]);
        setMessage({ type: 'success', text: 'Membro adicionado com sucesso!' });
        setShowModal(false);
      }
    } catch (error: any) {
      let errorMsg = error.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
      }
      if (typeof errorMsg === 'object') {
        errorMsg = JSON.stringify(errorMsg);
      }
      // Traducoes de erros comuns
      if (errorMsg) {
        errorMsg = errorMsg
          .replace(/salonId must be a string/gi, 'Erro interno: salonId ausente')
          .replace(/SalonId e obrigatorio/gi, 'Erro interno: salonId ausente')
          .replace(/Taxa de comissao deve ser no maximo 1/gi, 'Taxa de comissao invalida')
          .replace(/email must be an email/gi, 'Email invalido')
          .replace(/password must be longer than or equal to 6 characters/gi, 'Senha deve ter no minimo 6 caracteres')
          .replace(/email already exists/gi, 'Este email ja esta cadastrado');
      }
      setMessage({ type: 'error', text: errorMsg || 'Erro ao salvar membro' });
    } finally {
      setIsSaving(false);
    }
  };

  const canManageTeam = user?.role === 'OWNER' || user?.role === 'MANAGER';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-500 mt-1">Gerencie profissionais e comissoes</p>
        </div>
        {canManageTeam && (
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo Membro
          </button>
        )}
      </div>

      {/* Mensagem */}
      {message && !showModal && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Cards de estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{team.length}</p>
              <p className="text-sm text-gray-500">Total de Membros</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stylists}</p>
              <p className="text-sm text-gray-500">Profissionais Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(totalCommission / stylists || 0).toFixed(0)}%</p>
              <p className="text-sm text-gray-500">Comissao Media</p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Tabela da equipe */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Funcao
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Comissao
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                {canManageTeam && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acoes
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeam.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {formatPhone(member.phone)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                      {roleLabels[member.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.role === 'STYLIST' ? (
                      <span className="font-bold text-emerald-600">{(parseFloat(member.commissionRate || '0') * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.workSchedule ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {Object.values(member.workSchedule).filter(Boolean).length} dias/semana
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.specialties ? (
                      <div className="flex flex-wrap gap-1">
                        {member.specialties.split(', ').slice(0, 2).map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {spec}
                          </span>
                        ))}
                        {member.specialties.split(', ').length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{member.specialties.split(', ').length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  {canManageTeam && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {member.role !== 'OWNER' && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMember ? 'Editar Membro' : 'Novo Membro'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSaveMember}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Nome do profissional"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Funcao *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="STYLIST">Profissional</option>
                    <option value="RECEPTIONIST">Recepcionista</option>
                    <option value="MANAGER">Gerente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {!editingMember && '*'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="email@exemplo.com"
                    required={!editingMember}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Senha para novos membros */}
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Minimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {/* Comissao (apenas para profissionais) */}
              {formData.role === 'STYLIST' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Comissao
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Porcentagem que o profissional recebe por servico (ex: 50 = 50%)
                  </p>
                </div>
              )}

              {/* Especialidades (apenas para profissionais) */}
              {formData.role === 'STYLIST' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidades
                  </label>
                  <input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Corte, Coloracao, Hidratacao (separados por virgula)"
                  />
                </div>
              )}

              {/* Horario de trabalho */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Horario de Trabalho
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {weekDays.map((day) => (
                    <div key={day.key} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600">{day.label}</span>
                      <input
                        type="text"
                        value={formData.workSchedule[day.key] || ''}
                        onChange={(e) => handleScheduleChange(day.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                        placeholder="09:00-18:00 ou vazio para folga"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formato: 09:00-18:00. Deixe vazio para dias de folga.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMember ? 'Salvar Alteracoes' : 'Adicionar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}