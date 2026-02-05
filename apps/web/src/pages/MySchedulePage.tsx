import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, User, Check } from 'lucide-react';
import api from '../services/api';

interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string | null;
  endTime: string | null;
}

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export function MySchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data } = await api.get('/schedules/my-schedule');
      setSchedule(data);
    } catch (err) {
      console.error('Erro ao carregar horarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              isWorking: !day.isWorking,
              startTime: !day.isWorking ? '08:00' : null,
              endTime: !day.isWorking ? '18:00' : null,
            }
          : day,
      ),
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day)),
    );
  };

  const handleSave = async (day: ScheduleDay) => {
    setSaving(day.dayOfWeek);
    try {
      // O endpoint usa o ID do usuario logado internamente
      await api.put(`/schedules/professional/me/${day.dayOfWeek}`, {
        dayOfWeek: day.dayOfWeek,
        isWorking: day.isWorking,
        startTime: day.startTime,
        endTime: day.endTime,
      });
      setSaved(day.dayOfWeek);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar horario');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Meu Horário de Trabalho</h1>
            <p className="text-sm md:text-base text-gray-500">Configure seus dias e horários de atendimento</p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex flex-col gap-3 p-4 border-b border-gray-100 last:border-0 md:flex-row md:items-center md:gap-4 ${
              !day.isWorking ? 'bg-gray-50' : ''
            }`}
          >
            {/* Day Name - Top on mobile */}
            <div className="font-medium text-gray-900 text-lg md:text-base md:w-28">{DAYS[day.dayOfWeek]}</div>

            {/* Toggle + Status Row */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => handleToggle(day.dayOfWeek)}
                className={`relative w-14 h-8 md:h-7 rounded-full transition-colors flex-shrink-0 ${
                  day.isWorking ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1.5 md:top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    day.isWorking ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>

              {/* Status */}
              <span className={`text-sm ${day.isWorking ? 'text-emerald-600' : 'text-gray-500'}`}>
                {day.isWorking ? 'Trabalho' : 'Folga'}
              </span>
            </div>

            {/* Time Inputs - Full width on mobile, inline on desktop */}
            {day.isWorking && (
              <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-2 md:w-auto md:flex-1">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
                  <span className="text-xs text-gray-500 w-10 sm:hidden">Início</span>
                  <input
                    type="time"
                    value={day.startTime || '08:00'}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                    className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] md:min-h-0"
                  />
                </div>
                <span className="text-gray-400 flex-shrink-0 hidden sm:block">até</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 w-10 sm:hidden">Fim</span>
                  <input
                    type="time"
                    value={day.endTime || '18:00'}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                    className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] md:min-h-0"
                  />
                </div>
              </div>
            )}

            {/* Save Button - Full width on mobile */}
            <button
              onClick={() => handleSave(day)}
              disabled={saving === day.dayOfWeek}
              className={`w-full md:w-auto px-4 py-3 md:py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] md:min-h-0 ${
                saved === day.dayOfWeek
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {saving === day.dayOfWeek ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved === day.dayOfWeek ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
        <strong>Dica:</strong> Seus horários de trabalho serão usados para validar novos
        agendamentos. Clientes não poderão marcar fora do seu expediente.
      </div>
    </div>
  );
}

export default MySchedulePage;
