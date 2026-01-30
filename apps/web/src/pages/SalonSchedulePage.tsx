import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, Building2, Check } from 'lucide-react';
import api from '../services/api';

interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export function SalonSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data } = await api.get('/schedules/salon');
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
              isOpen: !day.isOpen,
              openTime: !day.isOpen ? '08:00' : null,
              closeTime: !day.isOpen ? '19:00' : null,
            }
          : day,
      ),
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day)),
    );
  };

  const handleSave = async (day: ScheduleDay) => {
    setSaving(day.dayOfWeek);
    try {
      await api.put(`/schedules/salon/${day.dayOfWeek}`, {
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        openTime: day.openTime,
        closeTime: day.closeTime,
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horario de Funcionamento</h1>
            <p className="text-gray-500">Configure os dias e horarios em que o salao esta aberto</p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 ${
              !day.isOpen ? 'bg-gray-50' : ''
            }`}
          >
            {/* Day Name */}
            <div className="w-28 font-medium text-gray-900">{DAYS[day.dayOfWeek]}</div>

            {/* Toggle */}
            <button
              onClick={() => handleToggle(day.dayOfWeek)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                day.isOpen ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  day.isOpen ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>

            {/* Status */}
            <span className={`w-20 text-sm ${day.isOpen ? 'text-emerald-600' : 'text-gray-500'}`}>
              {day.isOpen ? 'Aberto' : 'Fechado'}
            </span>

            {/* Time Inputs */}
            {day.isOpen && (
              <div className="flex items-center gap-2 flex-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={day.openTime || '08:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'openTime', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-400">ate</span>
                <input
                  type="time"
                  value={day.closeTime || '19:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'closeTime', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={() => handleSave(day)}
              disabled={saving === day.dayOfWeek}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
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
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
        <strong>Dica:</strong> Os horarios de funcionamento do salao sao usados para validar novos
        agendamentos. Profissionais podem ter horarios proprios dentro deste intervalo.
      </div>
    </div>
  );
}

export default SalonSchedulePage;
