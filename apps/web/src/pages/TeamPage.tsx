import { useState } from 'react';
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
  ChevronLeft, // ADICIONADO PARA O BOTÃO VOLTAR
} from 'lucide-react';

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

const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Costa',
    email: 'ana@salao.com',
    phone: '11999997777',
    role: 'STYLIST',
    commissionRate: '50.00',
    workSchedule: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '09:00-14:00',
      sunday: null,
    },
    specialties: 'Coloracao, Corte Feminino, Hidratacao',
    active: true,
  },
  {
    id: '2',
    name: 'Patricia Souza',
    email: 'patricia@salao.com',
    phone: '11999996666',
    role: 'STYLIST',
    commissionRate: '45.00',
    workSchedule: {
      monday: '10:00-19:00',
      tuesday: '10:00-19:00',
      wednesday: null,
      thursday: '10:00-19:00',
      friday: '10:00-19:00',
      saturday: '10:00-16:00',
      sunday: null,
    },
    specialties: 'Manicure, Pedicure, Design de Unhas',
    active: true,
  },
  {
    id: '3',
    name: 'Roberto Silva',
    email: 'roberto@salao.com',
    phone: '11999995555',
    role: 'STYLIST',
    commissionRate: '55.00',
    workSchedule: {
      monday: '08:00-17:00',
      tuesday: '08:00-17:00',
      wednesday: '08:00-17:00',
      thursday: '08:00-17:00',
      friday: '08:00-17:00',
      saturday: '08:00-12:00',
      sunday: null,
    },
    specialties: 'Corte Masculino, Barba, Pigmentacao',
    active: true,
  },
  {
    id: '4',
    name: 'Mariana Lima',
    email: 'mariana@salao.com',
    phone: '11999994444',
    role: 'RECEPTIONIST',
    commissionRate: '0.00',
    workSchedule: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00',
      saturday: '08:00-14:00',
      sunday: null,
    },
    specialties: null,
    active: true,
  },
  {
    id: '5',
    name: 'Rodrigo Viana',
    email: 'rodrigo@salao.com',
    phone: '11999998888',
    role: 'OWNER',
    commissionRate: '0.00',
    workSchedule: null,
    specialties: null,
    active: true,
  },
];

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
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STYLIST' as UserRole,
    commissionRate: '',
    specialties: '',
    workSchedule: {} as WorkSchedule,
  });

  // LÓGICA DE ROTEAMENTO: Verifica se a URL é /novo
  const isNewMemberRoute = window.location.pathname.endsWith('/novo');

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stylists = team.filter((m) => m.role === 'STYLIST' && m.active).length;
  const totalCommission = team
    .filter((m) => m.role === 'STYLIST')
    .reduce((sum, m) => sum + parseFloat(m.commissionRate), 0);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      commissionRate: member.commissionRate,
      specialties: member.specialties || '',
      workSchedule: member.workSchedule || {},
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STYLIST',
      commissionRate: '50.00',
      specialties: '',
      workSchedule: {},
    });
    setShowModal(true);
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

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      setTeam(team.filter((m) => m.id !== id));
    }
  };
  
  // Função temporária de salvamento
  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(editingMember ? 'Membro editado com sucesso!' : 'Novo membro adicionado com sucesso!');
    window.location.href = '/equipe'; // Volta para a lista principal
  }


  // ------------------------------------------------------------------
  // >>>>>> LÓGICA DE RENDERIZAÇÃO DE FORMULÁRIO (NOVA) <<<<<<
  // ------------------------------------------------------------------

  if (isNewMemberRoute || showModal) { // Usa showModal para manter o fluxo original do botão "Novo Membro"
    return (
      <div className="p-6">
        {/* Usamos a rota direta para voltar, se estiver em /equipe/novo */}
        {isNewMemberRoute && (
          <a href="/equipe" className="text-primary-600 mb-4 flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            Voltar para Lista
          </a>
        )}
        <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 ${isNewMemberRoute ? '' : 'fixed inset-0 z-50 overflow-y-auto'}`}>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingMember ? 'Editar Membro' : 'Novo Membro'}
            </h3>
            {/* Se não for rota direta, mantém o X para fechar o Modal */}
            {!isNewMemberRoute && (
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <form className="space-y-6" onSubmit={handleSaveMember}>
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Nome do profissional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funcao
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
                  Email
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

            {/* Commission (only for stylists) */}
            {formData.role === 'STYLIST' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Comissao (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Porcentagem do valor do servico que o profissional recebe
                </p>
              </div>
            )}

            {/* Specialties (only for stylists) */}
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

            {/* Work schedule */}
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
                      placeholder="09:00-18:00 ou Folga"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formato: HH:MM-HH:MM. Deixe vazio para dias de folga.
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
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                {editingMember ? 'Salvar Alteracoes' : 'Adicionar Membro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // >>>>>> LÓGICA DE RENDERIZAÇÃO DE LISTA (ORIGINAL) <<<<<<
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-500 mt-1">Gerencie profissionais e comissoes</p>
        </div>
        <a href="/equipe/novo" // Mudamos o onClick para a rota direta
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Membro
        </a>
      </div>

      {/* Stats cards */}
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

      {/* Search */}
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

      {/* Team table */}
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
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
                          .join('')}
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
                      <span className="font-bold text-emerald-600">{parseFloat(member.commissionRate).toFixed(0)}%</span>
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
    </div>
  );
}