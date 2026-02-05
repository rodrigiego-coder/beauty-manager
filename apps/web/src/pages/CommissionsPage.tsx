import { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  X,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Commission {
  id: string;
  salonId: string;
  commandId: string;
  commandItemId: string;
  professionalId: string;
  itemDescription: string;
  itemValue: string;
  commissionPercentage: string;
  commissionValue: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paidAt: string | null;
  paidById: string | null;
  createdAt: string;
  updatedAt: string;
  professionalName?: string;
  commandCode?: string;
  commandCardNumber?: string;
  paidByName?: string;
}

interface CommissionsSummary {
  totalPending: number;
  totalPaidThisMonth: number;
  professionalsWithPending: number;
}

interface ProfessionalSummary {
  professionalId: string;
  professionalName: string;
  totalPending: number;
  totalPaid: number;
  pendingCount: number;
  paidCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

export function CommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionsSummary | null>(null);
  const [professionalSummaries, setProfessionalSummaries] = useState<ProfessionalSummary[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [filterProfessional, setFilterProfessional] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCommissions();
  }, [filterStatus, filterProfessional, filterStartDate, filterEndDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, professionalsRes, teamRes] = await Promise.all([
        api.get('/commissions/summary'),
        api.get('/commissions/by-professional'),
        api.get('/users'),
      ]);

      setSummary(summaryRes.data);
      setProfessionalSummaries(professionalsRes.data);
      // Inclui STYLIST e qualquer usuário com isProfessional=true (ex: OWNER que também atende)
      setTeam(teamRes.data.filter((m: TeamMember) => m.active && (m.role === 'STYLIST' || (m as any).isProfessional === true)));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados de comissoes' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommissions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterProfessional) params.append('professionalId', filterProfessional);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const { data } = await api.get(`/commissions?${params.toString()}`);
      setCommissions(data);
    } catch (error) {
      console.error('Erro ao carregar comissoes:', error);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pendente</span>;
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Pago</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelado</span>;
      default:
        return null;
    }
  };

  const handleSelectAll = () => {
    if (selectedCommissions.length === commissions.filter(c => c.status === 'PENDING').length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(commissions.filter(c => c.status === 'PENDING').map(c => c.id));
    }
  };

  const handleSelectCommission = (id: string) => {
    if (selectedCommissions.includes(id)) {
      setSelectedCommissions(selectedCommissions.filter(cid => cid !== id));
    } else {
      setSelectedCommissions([...selectedCommissions, id]);
    }
  };

  const handlePaySelected = async () => {
    if (selectedCommissions.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma comissao para pagar' });
      return;
    }

    setIsPaying(true);
    setMessage(null);

    try {
      const { data } = await api.post('/commissions/pay', {
        commissionIds: selectedCommissions,
      });

      setMessage({ type: 'success', text: `${data.paid} comissoes pagas totalizando ${formatCurrency(data.total)}` });
      setSelectedCommissions([]);
      setShowPayModal(false);
      loadData();
      loadCommissions();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao pagar comissoes' });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayProfessional = async () => {
    if (!selectedProfessional) return;

    setIsPaying(true);
    setMessage(null);

    try {
      const payload: { professionalId: string; startDate?: string; endDate?: string } = {
        professionalId: selectedProfessional.professionalId,
      };
      if (filterStartDate) payload.startDate = filterStartDate;
      if (filterEndDate) payload.endDate = filterEndDate;

      const { data } = await api.post('/commissions/pay-professional', payload);

      setMessage({ type: 'success', text: `${data.paid} comissoes pagas para ${selectedProfessional.professionalName} totalizando ${formatCurrency(data.total)}` });
      setSelectedProfessional(null);
      setShowPayModal(false);
      loadData();
      loadCommissions();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao pagar comissoes do profissional' });
    } finally {
      setIsPaying(false);
    }
  };

  const openPayProfessionalModal = (prof: ProfessionalSummary) => {
    setSelectedProfessional(prof);
    setShowPayModal(true);
  };

  const clearFilters = () => {
    setFilterStatus('PENDING');
    setFilterProfessional('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const canManageCommissions = user?.role === 'OWNER' || user?.role === 'MANAGER';

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
          <h1 className="text-2xl font-bold text-gray-900">Comissoes</h1>
          <p className="text-gray-500 mt-1">Gerencie pagamentos de comissoes aos profissionais</p>
        </div>
        {canManageCommissions && selectedCommissions.length > 0 && (
          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <DollarSign className="w-5 h-5" />
            Pagar Selecionados ({selectedCommissions.length})
          </button>
        )}
      </div>

      {/* Mensagem */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalPending || 0)}</p>
              <p className="text-sm text-gray-500">Total Pendente</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalPaidThisMonth || 0)}</p>
              <p className="text-sm text-gray-500">Pago este Mes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary?.professionalsWithPending || 0}</p>
              <p className="text-sm text-gray-500">Profissionais com Pendencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo por Profissional */}
      {professionalSummaries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Profissional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionalSummaries.map((prof) => (
              <div
                key={prof.professionalId}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{prof.professionalName}</span>
                  {prof.totalPending > 0 && canManageCommissions && (
                    <button
                      onClick={() => openPayProfessionalModal(prof)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Pagar Tudo
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Pendente</p>
                    <p className="font-semibold text-amber-600">{formatCurrency(prof.totalPending)}</p>
                    <p className="text-xs text-gray-400">{prof.pendingCount} itens</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pago</p>
                    <p className="font-semibold text-green-600">{formatCurrency(prof.totalPaid)}</p>
                    <p className="text-xs text-gray-400">{prof.paidCount} itens</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilterStatus('PAID')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'PAID'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pagas
            </button>
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === ''
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Professional filter */}
          <div className="relative">
            <select
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white"
            >
              <option value="">Todos Profissionais</option>
              {team.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Toggle more filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {/* Clear filters */}
          {(filterProfessional || filterStartDate || filterEndDate) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {/* Date filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data Inicio</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data Fim</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabela de comissoes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {canManageCommissions && filterStatus === 'PENDING' && (
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCommissions.length === commissions.filter(c => c.status === 'PENDING').length && commissions.filter(c => c.status === 'PENDING').length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Servico
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Comanda
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valor Servico
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  %
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Comissao
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                  {canManageCommissions && filterStatus === 'PENDING' && (
                    <td className="px-4 py-4">
                      {commission.status === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedCommissions.includes(commission.id)}
                          onChange={() => handleSelectCommission(commission.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{commission.professionalName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{commission.itemDescription}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="text-gray-900">{commission.commandCode}</span>
                      <span className="text-gray-400 ml-2">(Cartao {commission.commandCardNumber})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-700">{formatCurrency(commission.itemValue)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">{parseFloat(commission.commissionPercentage).toFixed(0)}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-primary-600">{formatCurrency(commission.commissionValue)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(commission.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(commission.createdAt)}
                      {commission.paidAt && (
                        <div className="text-xs text-green-600 mt-0.5">
                          Pago em {formatDate(commission.paidAt)}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {commissions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma comissao encontrada</p>
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProfessional ? 'Pagar Comissoes do Profissional' : 'Confirmar Pagamento'}
              </h3>
              <button
                onClick={() => { setShowPayModal(false); setSelectedProfessional(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProfessional ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Profissional</p>
                  <p className="font-semibold text-gray-900">{selectedProfessional.professionalName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Total a Pagar</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedProfessional.totalPending)}</p>
                  <p className="text-xs text-gray-400 mt-1">{selectedProfessional.pendingCount} comissoes pendentes</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700">
                    Esta acao ira marcar todas as comissoes pendentes deste profissional como pagas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Comissoes Selecionadas</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCommissions.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Total a Pagar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      commissions
                        .filter(c => selectedCommissions.includes(c.id))
                        .reduce((sum, c) => sum + parseFloat(c.commissionValue), 0)
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowPayModal(false); setSelectedProfessional(null); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={selectedProfessional ? handlePayProfessional : handlePaySelected}
                disabled={isPaying}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
