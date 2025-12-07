import { Calendar, Clock, Scissors } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
}

// Dados mockados para visualizacao
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    service: 'Corte + Escova',
    date: '2025-12-07',
    time: '14:00',
    status: 'confirmed',
  },
  {
    id: '2',
    clientName: 'Ana Santos',
    service: 'Coloracao',
    date: '2025-12-07',
    time: '15:30',
    status: 'confirmed',
  },
  {
    id: '3',
    clientName: 'Julia Costa',
    service: 'Manicure + Pedicure',
    date: '2025-12-07',
    time: '16:00',
    status: 'pending',
  },
  {
    id: '4',
    clientName: 'Carla Oliveira',
    service: 'Escova Progressiva',
    date: '2025-12-08',
    time: '09:00',
    status: 'confirmed',
  },
  {
    id: '5',
    clientName: 'Fernanda Lima',
    service: 'Corte Feminino',
    date: '2025-12-08',
    time: '10:30',
    status: 'confirmed',
  },
];

const statusConfig = {
  confirmed: {
    label: 'Confirmado',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pendente',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Concluido',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) {
    return 'Hoje';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Amanha';
  }

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function AppointmentsList() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Proximos Agendamentos</h2>
            <p className="text-sm text-gray-500">{mockAppointments.length} agendamentos</p>
          </div>
        </div>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver todos
        </button>
      </div>

      <div className="space-y-3">
        {mockAppointments.map((appointment) => {
          const status = statusConfig[appointment.status];

          return (
            <div
              key={appointment.id}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {appointment.clientName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {appointment.clientName}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5" />
                        {appointment.service}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data/Hora */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(appointment.date)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {appointment.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mockAppointments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
}
