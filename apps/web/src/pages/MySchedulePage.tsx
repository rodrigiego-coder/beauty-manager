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
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meu Horario</h1>
            <p className="text-sm text-gray-500">Dias e horarios de atendimento</p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`p-3 sm:p-4 border-b border-gray-100 last:border-0 ${
              !day.isWorking ? 'bg-gray-50' : ''
            }`}
          >
            {/* Row 1: Day name + Toggle + Status + Save */}
            <div className="flex items-center gap-3">
              <div className="font-medium text-gray-900 min-w-[70px] text-sm sm:text-base">
                {DAYS[day.dayOfWeek]}
              </div>

              <button
                onClick={() => handleToggle(day.dayOfWeek)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  day.isWorking ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    day.isWorking ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>

              <span className={`text-xs sm:text-sm flex-1 ${day.isWorking ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                {day.isWorking ? 'Trabalho' : 'Folga'}
              </span>

              <button
                onClick={() => handleSave(day)}
                disabled={saving === day.dayOfWeek}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  saved === day.dayOfWeek
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {saving === day.dayOfWeek ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved === day.dayOfWeek ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Salvo
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </>
                )}
              </button>
            </div>

            {/* Row 2: Time inputs (only when working) */}
            {day.isWorking && (
              <div className="flex items-center gap-2 mt-2 pl-[70px] sm:pl-[82px]">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  type="time"
                  value={day.startTime || '08:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                  className="w-[100px] px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-400">ate</span>
                <input
                  type="time"
                  value={day.endTime || '18:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                  className="w-[100px] px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl text-xs sm:text-sm text-blue-700">
        <strong>Dica:</strong> Seus horarios de trabalho serao usados para validar novos
        agendamentos. Clientes nao poderao marcar fora do seu expediente.
      </div>
    </div>
  );
}

export default MySchedulePage;
