import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  RefreshCw,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Check,
  X,
  Play,
  Square,
  FileText,
  Palmtree,
  Briefcase,
  GraduationCap,
  Wrench,
  Coffee,
  UserX,
  Flag,
  CalendarX,
} from 'lucide-react';
import api from '../services/api';

// ==================== TYPES ====================

interface Professional {
  id: string;
  name: string;
  color?: string;
}

interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  professionalId: string;
  professionalName: string;
  serviceId: number | null;
  service: string;
  serviceName: string;
  date: string;
  time: string;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  locationType: string;
  address: string | null;
  status: string;
  confirmationStatus: string;
  confirmedAt: string | null;
  confirmedVia: string | null;
  priority: string;
  color: string | null;
  price: string;
  notes: string | null;
  internalNotes: string | null;
  commandId: string | null;
  noShowCount: number;
  source: string;
}

interface Block {
  id: string;
  professionalId: string;
  professionalName: string;
  type: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  status: string;
}

interface DaySchedule {
  date: string;
  appointments: Appointment[];
  professionals: Professional[];
  blocks: Block[];
}

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  basePrice: string;
  bufferBefore: number;
  bufferAfter: number;
}

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  noShowCount?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

type ViewMode = 'day' | 'week' | 'month';

// ==================== STATUS COLORS ====================

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  SCHEDULED: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  PENDING_CONFIRMATION: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  CONFIRMED: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800' },
  IN_PROGRESS: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
  COMPLETED: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600' },
  CANCELLED: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
  NO_SHOW: { bg: 'bg-red-200', border: 'border-red-400', text: 'text-red-900' },
};

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: '',
  VIP: 'ring-2 ring-purple-400',
  URGENT: 'ring-2 ring-red-500 animate-pulse',
};

const BLOCK_TYPE_ICONS: Record<string, any> = {
  DAY_OFF: Palmtree,
  VACATION: Palmtree,
  SICK_LEAVE: AlertTriangle,
  PERSONAL: User,
  LUNCH: Coffee,
  TRAINING: GraduationCap,
  MAINTENANCE: Wrench,
  OTHER: Briefcase,
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  PENDING_CONFIRMATION: 'Aguardando Confirmação',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em Atendimento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não Compareceu',
};

// ==================== HELPER FUNCTIONS ====================

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const getDayName = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};

const getTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToPixels = (minutes: number, pixelsPerHour: number = 60) => {
  return (minutes / 60) * pixelsPerHour;
};

// ==================== COMPONENT ====================

export function AppointmentsPage() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlocksModal, setShowBlocksModal] = useState(false);
  const [showBlockFormModal, setShowBlockFormModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    professionalId: '',
    serviceId: '',
    service: '',
    date: '',
    time: '',
    duration: 60,
    bufferBefore: 0,
    bufferAfter: 0,
    locationType: 'SALON',
    address: '',
    priority: 'NORMAL',
    price: '',
    notes: '',
    internalNotes: '',
  });

  // Block form state
  const [blockFormData, setBlockFormData] = useState({
    professionalId: '',
    type: 'DAY_OFF',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: true,
    recurring: false,
    recurringPattern: 'WEEKLY',
    recurringDays: [] as number[],
    recurringEndDate: '',
  });

  // Client search
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // ==================== DATA LOADING ====================

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (viewMode === 'day') {
        endpoint = `/appointments/day/${selectedDate}`;
      } else if (viewMode === 'week') {
        // Get start of week
        const date = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek;
        const startOfWeek = new Date(date.setDate(diff));
        endpoint = `/appointments/week/${startOfWeek.toISOString().split('T')[0]}`;
      } else {
        const [year, month] = selectedDate.split('-');
        endpoint = `/appointments/month/${year}/${month}`;
      }

      const response = await api.get(endpoint);
      const data = response.data;

      if (viewMode === 'day') {
        setAppointments(data.appointments || []);
        setProfessionals(data.professionals || []);
        setBlocks(data.blocks || []);
      } else if (viewMode === 'week') {
        const allAppointments: Appointment[] = [];
        const allBlocks: Block[] = [];
        data.days?.forEach((day: DaySchedule) => {
          allAppointments.push(...day.appointments);
          allBlocks.push(...day.blocks);
        });
        setAppointments(allAppointments);
        setProfessionals(data.days?.[0]?.professionals || []);
        setBlocks(allBlocks);
      } else {
        const allAppointments: Appointment[] = [];
        data.days?.forEach((day: any) => {
          allAppointments.push(...day.appointments);
        });
        setAppointments(allAppointments);
      }

      // Load services
      const servicesRes = await api.get('/services');
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar agenda' });
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search clients
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length < 2) {
        setClientResults([]);
        return;
      }
      try {
        const response = await api.get(`/clients?search=${encodeURIComponent(clientSearch)}`);
        setClientResults(response.data?.clients || response.data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [clientSearch]);

  // Load available slots when professional/date selected
  useEffect(() => {
    const loadSlots = async () => {
      if (!formData.professionalId || !formData.date) {
        setAvailableSlots([]);
        return;
      }
      try {
        const serviceQuery = formData.serviceId ? `?serviceId=${formData.serviceId}` : '';
        const response = await api.get(
          `/appointments/availability/${formData.professionalId}/${formData.date}${serviceQuery}`
        );
        setAvailableSlots(response.data || []);
      } catch (error) {
        console.error('Error loading slots:', error);
      }
    };

    loadSlots();
  }, [formData.professionalId, formData.date, formData.serviceId]);

  // ==================== NAVIGATION ====================

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const date = new Date(selectedDate + 'T00:00:00');

    if (direction === 'today') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }

    const offset = direction === 'prev' ? -1 : 1;

    if (viewMode === 'day') {
      date.setDate(date.getDate() + offset);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (offset * 7));
    } else {
      date.setMonth(date.getMonth() + offset);
    }

    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // ==================== EVENT HANDLERS ====================

  const handleTimeSlotClick = (professionalId: string, time: string) => {
    setFormData({
      ...formData,
      professionalId,
      date: selectedDate,
      time,
    });
    setShowCreateModal(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setFormData({
        ...formData,
        serviceId,
        service: service.name,
        duration: service.durationMinutes,
        price: service.basePrice,
        bufferBefore: service.bufferBefore || 0,
        bufferAfter: service.bufferAfter || 0,
      });
    }
  };

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
    });
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setMessage({ type: 'success', text: 'Agendamento criado com sucesso!' });
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao criar agendamento' });
    }
  };

  const handleStatusChange = async (appointmentId: string, action: string) => {
    try {
      let endpoint = '';
      let method: 'post' | 'delete' = 'post';

      switch (action) {
        case 'confirm':
          endpoint = `/appointments/${appointmentId}/confirm`;
          break;
        case 'start':
          endpoint = `/appointments/${appointmentId}/start`;
          break;
        case 'complete':
          endpoint = `/appointments/${appointmentId}/complete`;
          break;
        case 'no-show':
          endpoint = `/appointments/${appointmentId}/no-show`;
          break;
        case 'cancel':
          endpoint = `/appointments/${appointmentId}`;
          method = 'delete';
          break;
        default:
          return;
      }

      if (method === 'delete') {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }

      setMessage({ type: 'success', text: 'Status atualizado com sucesso!' });
      setShowDetailsModal(false);
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao atualizar status' });
    }
  };

  const handleConvertToCommand = async (appointmentId: string) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/convert-to-command`);
      setMessage({ type: 'success', text: 'Comanda criada com sucesso!' });
      setShowDetailsModal(false);
      // Navigate to command page
      window.location.href = `/comandas/${response.data.commandId}`;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao criar comanda' });
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments/blocks', blockFormData);
      setMessage({ type: 'success', text: 'Bloqueio criado com sucesso!' });
      setShowBlockFormModal(false);
      resetBlockForm();
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao criar bloqueio' });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Deseja realmente excluir este bloqueio?')) return;
    try {
      await api.delete(`/appointments/blocks/${blockId}`);
      setMessage({ type: 'success', text: 'Bloqueio excluído!' });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao excluir bloqueio' });
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      professionalId: '',
      serviceId: '',
      service: '',
      date: '',
      time: '',
      duration: 60,
      bufferBefore: 0,
      bufferAfter: 0,
      locationType: 'SALON',
      address: '',
      priority: 'NORMAL',
      price: '',
      notes: '',
      internalNotes: '',
    });
    setClientSearch('');
  };

  const resetBlockForm = () => {
    setBlockFormData({
      professionalId: '',
      type: 'DAY_OFF',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      allDay: true,
      recurring: false,
      recurringPattern: 'WEEKLY',
      recurringDays: [],
      recurringEndDate: '',
    });
  };

  // ==================== FILTERED DATA ====================

  const filteredAppointments = appointments.filter(apt => {
    if (filterProfessional !== 'all' && apt.professionalId !== filterProfessional) {
      return false;
    }
    if (filterStatus !== 'all' && apt.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // ==================== RENDER FUNCTIONS ====================

  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    const pixelsPerHour = 60;

    return (
      <div className="flex overflow-x-auto">
        {/* Time column */}
        <div className="flex-shrink-0 w-16 bg-gray-50 border-r">
          <div className="h-12 border-b" /> {/* Header spacer */}
          {timeSlots.map(time => (
            <div
              key={time}
              className="h-[30px] text-xs text-gray-500 text-right pr-2 border-b border-gray-100"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Professional columns */}
        {professionals.map(professional => {
          const profAppointments = filteredAppointments.filter(
            apt => apt.professionalId === professional.id && apt.date === selectedDate
          );
          const profBlocks = blocks.filter(
            b => b.professionalId === professional.id
          );

          return (
            <div key={professional.id} className="flex-1 min-w-[200px] border-r">
              {/* Header */}
              <div className="h-12 border-b bg-gray-50 px-2 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {professional.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium truncate">{professional.name}</span>
                </div>
              </div>

              {/* Time grid */}
              <div className="relative">
                {timeSlots.map(time => (
                  <div
                    key={time}
                    className="h-[30px] border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleTimeSlotClick(professional.id, time)}
                  />
                ))}

                {/* Render blocks */}
                {profBlocks.map(block => {
                  if (block.allDay) {
                    return (
                      <div
                        key={block.id}
                        className="absolute left-0 right-0 top-0 bg-gray-200 bg-opacity-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.05)_5px,rgba(0,0,0,0.05)_10px)] z-10 pointer-events-none"
                        style={{ height: '100%' }}
                      >
                        <div className="p-1 text-xs text-gray-600 font-medium">
                          {block.title}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Render appointments */}
                {profAppointments.map(apt => {
                  const startMinutes = timeToMinutes(apt.time) - timeToMinutes('06:00');
                  const top = minutesToPixels(startMinutes, pixelsPerHour);
                  const height = minutesToPixels(apt.duration, pixelsPerHour);
                  const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.SCHEDULED;
                  const priorityClass = PRIORITY_COLORS[apt.priority] || '';

                  return (
                    <div
                      key={apt.id}
                      className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border rounded-md p-1 cursor-pointer overflow-hidden ${priorityClass}`}
                      style={{ top: `${top}px`, height: `${Math.max(height, 24)}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(apt);
                      }}
                      title={`${apt.clientName || 'Cliente não informado'} - ${apt.service}\n${apt.time} (${apt.duration}min)`}
                    >
                      <div className="text-xs font-medium truncate">{apt.clientName || 'Cliente'}</div>
                      {height > 30 && (
                        <div className="text-xs text-gray-600 truncate">{apt.service}</div>
                      )}
                      {height > 50 && (
                        <div className="text-xs text-gray-500">{apt.time}</div>
                      )}
                      {apt.priority === 'VIP' && (
                        <Flag className="absolute top-1 right-1 w-3 h-3 text-purple-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek;
    startDate.setDate(diff);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayApts = filteredAppointments.filter(a => a.date === day);
          const isToday = day === new Date().toISOString().split('T')[0];
          const isSelected = day === selectedDate;

          return (
            <div
              key={day}
              className={`border rounded-lg overflow-hidden ${isToday ? 'border-blue-500' : ''} ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
            >
              <div
                className={`p-2 text-center cursor-pointer hover:bg-gray-100 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
              >
                <div className="text-xs text-gray-500 uppercase">{getDayName(day)}</div>
                <div className={`text-lg font-medium ${isToday ? 'text-blue-600' : ''}`}>
                  {new Date(day + 'T00:00:00').getDate()}
                </div>
              </div>
              <div className="p-1 space-y-1 max-h-[300px] overflow-y-auto">
                {dayApts.slice(0, 5).map(apt => {
                  const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.SCHEDULED;
                  return (
                    <div
                      key={apt.id}
                      className={`p-1 rounded text-xs ${colors.bg} ${colors.text} cursor-pointer truncate`}
                      onClick={() => handleAppointmentClick(apt)}
                    >
                      <span className="font-medium">{apt.time}</span> {apt.clientName?.split(' ')[0] || 'Cliente'}
                    </div>
                  );
                })}
                {dayApts.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayApts.length - 5} mais
                  </div>
                )}
                {dayApts.length === 0 && (
                  <div className="text-xs text-gray-400 text-center p-2">Sem agendamentos</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const [year, month] = selectedDate.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: { date: string | null; day: number | null }[] = [];

    // Add padding for days before first day of month
    for (let i = 0; i < startPadding; i++) {
      cells.push({ date: null, day: null });
    }

    // Add days of month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ date: dateStr, day });
    }

    // Add padding to complete grid
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, day: null });
    }

    return (
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell.date) {
              return <div key={index} className="h-24 bg-gray-50 rounded" />;
            }

            const dayApts = filteredAppointments.filter(a => a.date === cell.date);
            const isToday = cell.date === new Date().toISOString().split('T')[0];
            const isPast = new Date(cell.date + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');

            // Calculate occupancy
            let occupancyClass = 'bg-green-50';
            if (dayApts.length > 10) occupancyClass = 'bg-red-50';
            else if (dayApts.length > 5) occupancyClass = 'bg-yellow-50';

            return (
              <div
                key={index}
                className={`h-24 border rounded cursor-pointer hover:border-blue-300 ${isPast ? 'opacity-60' : ''} ${isToday ? 'border-blue-500 border-2' : ''} ${occupancyClass}`}
                onClick={() => {
                  setSelectedDate(cell.date!);
                  setViewMode('day');
                }}
              >
                <div className={`text-sm font-medium p-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {cell.day}
                </div>
                <div className="px-1">
                  {dayApts.length > 0 && (
                    <div className="text-xs text-gray-600">
                      {dayApts.length} agend.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==================== MODALS ====================

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Novo Agendamento</h2>
          <button onClick={() => { setShowCreateModal(false); resetForm(); }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Client Section */}
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <div className="relative">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Buscar cliente..."
              />
              {showClientDropdown && clientResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clientResults.map(client => (
                    <div
                      key={client.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                      {(client.noShowCount || 0) > 0 && (
                        <div className="text-xs text-red-500">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {client.noShowCount} no-shows
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Walk-in client fields */}
          {!formData.clientId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Service */}
          <div>
            <label className="block text-sm font-medium mb-1">Serviço *</label>
            <select
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione um serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.durationMinutes}min - R$ {parseFloat(service.basePrice).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Professional */}
          <div>
            <label className="block text-sm font-medium mb-1">Profissional *</label>
            <select
              value={formData.professionalId}
              onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione um profissional</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecione</option>
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <option
                      key={slot.time}
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time} {!slot.available ? `(${slot.reason})` : ''}
                    </option>
                  ))
                ) : (
                  getTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duração (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
                min="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$)</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Local</label>
            <div className="flex gap-4">
              {['SALON', 'HOME', 'ONLINE'].map(loc => (
                <label key={loc} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="locationType"
                    value={loc}
                    checked={formData.locationType === loc}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                  />
                  {loc === 'SALON' ? 'Salão' : loc === 'HOME' ? 'Domicílio' : 'Online'}
                </label>
              ))}
            </div>
          </div>

          {formData.locationType === 'HOME' && (
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-1">Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="NORMAL">Normal</option>
              <option value="VIP">VIP</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas internas (só equipe vê)</label>
            <textarea
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDetailsModal = () => {
    if (!selectedAppointment) return null;
    const apt = selectedAppointment;
    const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.SCHEDULED;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${colors.bg} ${colors.text}`}>
                {STATUS_LABELS[apt.status]}
              </span>
              <h2 className="font-semibold">{apt.service}</h2>
            </div>
            <button onClick={() => setShowDetailsModal(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Client info */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">{apt.clientName || 'Cliente não informado'}</div>
                {apt.clientPhone && (
                  <a href={`tel:${apt.clientPhone}`} className="text-sm text-blue-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {apt.clientPhone}
                  </a>
                )}
                {apt.clientEmail && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {apt.clientEmail}
                  </div>
                )}
                {apt.noShowCount > 0 && (
                  <div className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {apt.noShowCount} não comparecimento(s)
                  </div>
                )}
              </div>
            </div>

            {/* Professional */}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {apt.professionalName?.charAt(0)}
              </div>
              <span>{apt.professionalName}</span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{formatDate(apt.date)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{apt.time} - {apt.endTime} ({apt.duration} min)</span>
            </div>

            {/* Location */}
            {apt.locationType !== 'SALON' && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{apt.locationType === 'HOME' ? 'Domicílio' : 'Online'} {apt.address && `- ${apt.address}`}</span>
              </div>
            )}

            {/* Price */}
            <div className="text-lg font-semibold">
              R$ {parseFloat(apt.price || '0').toFixed(2)}
            </div>

            {/* Notes */}
            {apt.notes && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {apt.notes}
              </div>
            )}

            {/* Status Timeline */}
            <div className="flex items-center justify-between py-2">
              {['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map((status, idx) => {
                const isActive = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].indexOf(apt.status) >= idx;
                const isCurrent = apt.status === status;
                return (
                  <div key={status} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200'} ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                      {idx + 1}
                    </div>
                    {idx < 3 && <div className={`w-8 h-1 ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {apt.status === 'SCHEDULED' && (
                <>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'confirm')}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" /> Confirmar
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${apt.clientPhone?.replace(/\D/g, '')}`, '_blank')}
                    className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </button>
                </>
              )}

              {apt.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatusChange(apt.id, 'start')}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Play className="w-4 h-4" /> Iniciar
                </button>
              )}

              {apt.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'complete')}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Square className="w-4 h-4" /> Finalizar
                  </button>
                  {!apt.commandId && (
                    <button
                      onClick={() => handleConvertToCommand(apt.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FileText className="w-4 h-4" /> Criar Comanda
                    </button>
                  )}
                  {apt.commandId && (
                    <a
                      href={`/comandas/${apt.commandId}`}
                      className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <FileText className="w-4 h-4" /> Ver Comanda
                    </a>
                  )}
                </>
              )}

              {['SCHEDULED', 'CONFIRMED'].includes(apt.status) && (
                <>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'no-show')}
                    className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4" /> Não Compareceu
                  </button>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'cancel')}
                    className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </>
              )}

              {['CANCELLED', 'NO_SHOW'].includes(apt.status) && (
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      clientId: apt.clientId || '',
                      clientName: apt.clientName || '',
                      clientPhone: apt.clientPhone || '',
                      professionalId: apt.professionalId,
                      serviceId: apt.serviceId?.toString() || '',
                      service: apt.service,
                      duration: apt.duration,
                      price: apt.price,
                    });
                    setClientSearch(apt.clientName || '');
                    setShowDetailsModal(false);
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CalendarX className="w-4 h-4" /> Reagendar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlocksModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Folgas e Bloqueios</h2>
          <button onClick={() => setShowBlocksModal(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              setBlockFormData({ ...blockFormData, startDate: selectedDate, endDate: selectedDate });
              setShowBlockFormModal(true);
            }}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Nova Folga
          </button>

          <div className="space-y-3">
            {blocks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum bloqueio encontrado</p>
            ) : (
              blocks.map(block => {
                const Icon = BLOCK_TYPE_ICONS[block.type] || Briefcase;
                return (
                  <div key={block.id} className="border rounded-lg p-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <div className="font-medium">{block.title}</div>
                        <div className="text-sm text-gray-500">{block.professionalName}</div>
                        <div className="text-sm text-gray-500">
                          {formatShortDate(block.startDate)}
                          {block.startDate !== block.endDate && ` - ${formatShortDate(block.endDate)}`}
                          {!block.allDay && block.startTime && ` ${block.startTime} - ${block.endTime}`}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          block.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          block.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {block.status === 'APPROVED' ? 'Aprovado' :
                           block.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockFormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nova Folga/Bloqueio</h2>
          <button onClick={() => { setShowBlockFormModal(false); resetBlockForm(); }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateBlock} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profissional *</label>
            <select
              value={blockFormData.professionalId}
              onChange={(e) => setBlockFormData({ ...blockFormData, professionalId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              value={blockFormData.type}
              onChange={(e) => setBlockFormData({ ...blockFormData, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="DAY_OFF">Folga</option>
              <option value="VACATION">Férias</option>
              <option value="SICK_LEAVE">Atestado Médico</option>
              <option value="PERSONAL">Pessoal</option>
              <option value="LUNCH">Almoço</option>
              <option value="TRAINING">Treinamento</option>
              <option value="MAINTENANCE">Manutenção</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={blockFormData.title}
              onChange={(e) => setBlockFormData({ ...blockFormData, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data Início *</label>
              <input
                type="date"
                value={blockFormData.startDate}
                onChange={(e) => setBlockFormData({ ...blockFormData, startDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim *</label>
              <input
                type="date"
                value={blockFormData.endDate}
                onChange={(e) => setBlockFormData({ ...blockFormData, endDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={blockFormData.allDay}
              onChange={(e) => setBlockFormData({ ...blockFormData, allDay: e.target.checked })}
            />
            <label htmlFor="allDay" className="text-sm">Dia inteiro</label>
          </div>

          {!blockFormData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Horário Início</label>
                <input
                  type="time"
                  value={blockFormData.startTime}
                  onChange={(e) => setBlockFormData({ ...blockFormData, startTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário Fim</label>
                <input
                  type="time"
                  value={blockFormData.endTime}
                  onChange={(e) => setBlockFormData({ ...blockFormData, endTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={blockFormData.description}
              onChange={(e) => setBlockFormData({ ...blockFormData, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => { setShowBlockFormModal(false); resetBlockForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Agenda
            </h1>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('prev')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleNavigate('today')}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Hoje
              </button>
              <button
                onClick={() => handleNavigate('next')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Current date display */}
            <span className="font-medium text-gray-700">
              {viewMode === 'day' && formatDate(selectedDate)}
              {viewMode === 'week' && `Semana de ${formatShortDate(selectedDate)}`}
              {viewMode === 'month' && new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex border rounded overflow-hidden">
              {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm ${viewMode === mode ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>

            {/* Filters */}
            <select
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">Todos os profissionais</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Actions */}
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded"
              title="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowBlocksModal(true)}
              className="flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" /> Folgas
            </button>

            <button
              onClick={() => {
                setFormData({ ...formData, date: selectedDate });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg flex justify-between items-center ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && renderCreateModal()}
      {showDetailsModal && renderDetailsModal()}
      {showBlocksModal && renderBlocksModal()}
      {showBlockFormModal && renderBlockFormModal()}
    </div>
  );
}

export default AppointmentsPage;
