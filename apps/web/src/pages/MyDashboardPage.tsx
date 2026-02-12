import { useEffect, useState } from 'react';
import { Calendar, DollarSign, Clock, TrendingUp, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProfessionalAppointment {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

interface ProfessionalPerformance {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
}

interface ProfessionalDashboard {
  todayAppointments: number;
  weekAppointments: number;
  monthRevenue: number;
  pendingCommission: number;
  commissionRate: number;
  upcomingAppointments: ProfessionalAppointment[];
  performance: ProfessionalPerformance;
  professionalName: string;
}

export function MyDashboardPage() {
  const { user } = useAuth();
  const isStylist = user?.role === 'STYLIST';
  const [data, setData] = useState<ProfessionalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/professional');
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não compareceu',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-full">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-500">Olá, {data.professionalName}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isStylist ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        {/* Agendamentos Hoje */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{data.todayAppointments}</p>
              <p className="text-xs text-gray-400">agendamentos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Agendamentos Semana */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900">{data.weekAppointments}</p>
              <p className="text-xs text-gray-400">agendamentos</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Faturamento do Mês — oculto para STYLIST */}
        {!isStylist && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Faturamento (Mês)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.monthRevenue)}</p>
                <p className="text-xs text-gray-400">serviços realizados</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Comissão Pendente */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Comissão ({data.commissionRate}%)</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.pendingCommission)}</p>
              <p className="text-xs text-gray-400">pendente este mês</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Próximos Agendamentos</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.upcomingAppointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum agendamento próximo
              </div>
            ) : (
              data.upcomingAppointments.map((appt) => (
                <div key={appt.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appt.clientName}</p>
                      <p className="text-sm text-gray-500">{appt.serviceName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(appt.date)} às {appt.time}
                      </p>
                      {getStatusBadge(appt.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desempenho do Mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Desempenho do Mês</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total de Agendamentos</span>
              <span className="font-semibold">{data.performance.totalAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Concluídos</span>
              <span className="font-semibold text-green-600">{data.performance.completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancelados</span>
              <span className="font-semibold text-red-600">{data.performance.cancelledAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Não Compareceu</span>
              <span className="font-semibold text-yellow-600">{data.performance.noShowAppointments}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Taxa de Conclusão</span>
                <span className="text-xl font-bold text-purple-600">{data.performance.completionRate}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${data.performance.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyDashboardPage;
