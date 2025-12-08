import { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  User,
  Scissors,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  { id: '1', clientName: 'Maria Silva', clientPhone: '11999998888', service: 'Corte + Escova', professionalName: 'Ana Costa', date: '2024-01-15', time: '09:00', duration: 60, price: 120, status: 'confirmed' },
  { id: '2', clientName: 'Julia Santos', clientPhone: '11999996666', service: 'Coloracao', professionalName: 'Ana Costa', date: '2024-01-15', time: '10:30', duration: 120, price: 280, status: 'pending' },
  { id: '3', clientName: 'Carla Lima', clientPhone: '11999995555', service: 'Manicure + Pedicure', professionalName: 'Patricia Souza', date: '2024-01-15', time: '14:00', duration: 90, price: 80, status: 'confirmed' },
  { id: '4', clientName: 'Fernanda Oliveira', clientPhone: '11999994444', service: 'Hidratacao', professionalName: 'Ana Costa', date: '2024-01-15', time: '16:00', duration: 60, price: 150, status: 'confirmed' },
  { id: '5', clientName: 'Camila Rodrigues', clientPhone: '11999992222', service: 'Corte Masculino', professionalName: 'Roberto Silva', date: '2024-01-16', time: '09:00', duration: 30, price: 50, status: 'pending' },
  { id: '6', clientName: 'Beatriz Almeida', clientPhone: '11999991111', service: 'Escova Progressiva', professionalName: 'Ana Costa', date: '2024-01-16', time: '10:00', duration: 180, price: 350, status: 'confirmed' },
  { id: '7', clientName: 'Patricia Souza', clientPhone: '11999993333', service: 'Corte + Barba', professionalName: 'Roberto Silva', date: '2024-01-17', time: '11:00', duration: 45, price: 70, status: 'confirmed' },
  { id: '8', clientName: 'Maria Silva', clientPhone: '11999998888', service: 'Retoque Raiz', professionalName: 'Ana Costa', date: '2024-01-17', time: '15:00', duration: 90, price: 180, status: 'pending' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  // LÓGICA DE ROTEAMENTO: Verifica se a URL é /novo
  const isNewAppointmentRoute = window.location.pathname.endsWith('/novo');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    return addDays(start, i);
  });

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesDate = apt.date === format(selectedDate, 'yyyy-MM-dd');
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const pendingCount = mockAppointments.filter((apt) => apt.status === 'pending').length;

  // Função temporária de Agendamento
  const handleSaveAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Novo Agendamento registrado com sucesso!');
    window.location.href = '/agenda'; // CORRIGIDO: era /agendamento
  }

  // ------------------------------------------------------------------
  // >>>>>> LÓGICA DE RENDERIZAÇÃO DE FORMULÁRIO (NOVA) <<<<
  // ------------------------------------------------------------------

  if (isNewAppointmentRoute) {
    return (
      <div className="p-6">
        <a href="/agenda" className="text-primary-600 mb-4 flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          Voltar para Agenda
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Agendamento</h1>

        <div className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto">
          <form className="space-y-4" onSubmit={handleSaveAppointment}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Selecione um cliente</option>
                <option value="1">Maria Silva - (11) 99999-8888</option>
                <option value="2">Ana Costa - (11) 99999-7777</option>
                <option value="3">Julia Santos - (11) 99999-6666</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servico</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Selecione um servico</option>
                <option value="1">Corte Feminino - R$ 80,00 (45 min)</option>
                <option value="2">Corte + Escova - R$ 120,00 (60 min)</option>
                <option value="3">Coloracao - R$ 280,00 (120 min)</option>
                <option value="4">Manicure + Pedicure - R$ 80,00 (90 min)</option>
                <option value="5">Hidratacao - R$ 150,00 (60 min)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Selecione um profissional</option>
                <option value="1">Ana Costa</option>
                <option value="2">Patricia Souza</option>
                <option value="3">Roberto Silva</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  defaultValue={format(selectedDate, 'yyyy-MM-dd')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observacoes (opcional)
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Adicione observacoes sobre o atendimento..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <a href="/agenda"
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center"
              >
                Cancelar
              </a>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Agendar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // >>>>>> LÓGICA DE RENDERIZAÇÃO DE LISTA (ORIGINAL) <<<<
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 mt-1">Gerencie seus agendamentos</p>
        </div>
        <a href="/agenda/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </a>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
              <p className="text-sm text-gray-500">Agendamentos Hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pendentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredAppointments.reduce((sum, apt) => sum + apt.price, 0)
                )}
              </p>
              <p className="text-sm text-gray-500">Receita do Dia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Calendario
              </button>
            </div>
          </div>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayAppointments = mockAppointments.filter(
              (apt) => apt.date === format(day, 'yyyy-MM-dd')
            ).length;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : isToday
                    ? 'bg-primary-50 text-primary-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className={`text-xs font-medium ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                  {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
                </p>
                <p className={`text-lg font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </p>
                {dayAppointments > 0 && (
                  <p className={`text-xs mt-1 ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                    {dayAppointments} agend.
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Filtrar:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['all', 'confirmed', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filterStatus === status ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                {/* Time */}
                <div className="w-20 text-center">
                  <p className="text-lg font-bold text-gray-900">{appointment.time}</p>
                  <p className="text-xs text-gray-500">{appointment.duration} min</p>
                </div>

                {/* Divider */}
                <div className="w-1 h-16 bg-primary-500 rounded-full" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{appointment.clientName}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Scissors className="w-4 h-4" />
                      {appointment.service}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {appointment.professionalName}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(appointment.price)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {appointment.status === 'pending' && (
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirmar">
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum agendamento para este dia</p>
            <a href="/agenda/novo"
              className="mt-4 text-primary-600 font-medium hover:text-primary-700"
            >
              + Criar agendamento
            </a>
          </div>
        )}
      </div>
    </div>
  );
}