import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, User, Check, MapPin } from 'lucide-react';
import api from '../services/api';

interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface LeadTimeSettings {
  leadTimeEnabled: boolean;
  leadTimeMinutes: number;
}

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export function MySchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  // Lead Time state
  const [leadTime, setLeadTime] = useState<LeadTimeSettings>({
    leadTimeEnabled: false,
    leadTimeMinutes: 0,
  });
  const [savingLeadTime, setSavingLeadTime] = useState(false);
  const [savedLeadTime, setSavedLeadTime] = useState(false);

  useEffect(() => {
    loadSchedule();
    loadLeadTime();
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

  const loadLeadTime = async () => {
    try {
      const { data } = await api.get('/schedules/my-lead-time');
      setLeadTime(data);
    } catch (err) {
      console.error('Erro ao carregar lead time:', err);
    }
  };

  const handleLeadTimeToggle = () => {
    setLeadTime((prev) => ({
      ...prev,
      leadTimeEnabled: !prev.leadTimeEnabled,
      leadTimeMinutes: !prev.leadTimeEnabled ? (prev.leadTimeMinutes || 60) : prev.leadTimeMinutes,
    }));
  };

  const handleLeadTimeMinutesChange = (value: string) => {
    const minutes = Math.min(480, Math.max(0, parseInt(value) || 0));
    setLeadTime((prev) => ({ ...prev, leadTimeMinutes: minutes }));
  };

  const saveLeadTime = async () => {
    setSavingLeadTime(true);
    try {
      await api.put('/schedules/my-lead-time', leadTime);
      setSavedLeadTime(true);
      setTimeout(() => setSavedLeadTime(false), 2000);
    } catch (err) {
      console.error('Erro ao salvar lead time:', err);
      alert('Erro ao salvar configuracao');
    } finally {
      setSavingLeadTime(false);
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Horario de Trabalho</h1>
            <p className="text-gray-500">Configure seus dias e horarios de atendimento</p>
          </div>
        </div>
      </div>

      {/* Lead Time Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Aviso Previo para Agendamentos</h2>
            <p className="text-sm text-gray-500">
              Quando estiver fora do salao, defina um tempo minimo de antecedencia
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeadTimeToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                leadTime.leadTimeEnabled ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  leadTime.leadTimeEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${leadTime.leadTimeEnabled ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
              {leadTime.leadTimeEnabled ? 'Estou fora do salao' : 'Estou no salao'}
            </span>
          </div>

          {/* Minutes Input */}
          {leadTime.leadTimeEnabled && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Antecedencia minima:</label>
              <input
                type="number"
                min="0"
                max="480"
                value={leadTime.leadTimeMinutes}
                onChange={(e) => handleLeadTimeMinutesChange(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">minutos</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveLeadTime}
            disabled={savingLeadTime}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ml-auto ${
              savedLeadTime
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {savingLeadTime ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedLeadTime ? (
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

        {leadTime.leadTimeEnabled && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
            <strong>Ativo:</strong> Novos agendamentos precisarao ter pelo menos{' '}
            <strong>{leadTime.leadTimeMinutes} minutos</strong> de antecedencia.
            {leadTime.leadTimeMinutes >= 60 && (
              <span> ({Math.floor(leadTime.leadTimeMinutes / 60)}h{leadTime.leadTimeMinutes % 60 > 0 ? ` ${leadTime.leadTimeMinutes % 60}min` : ''})</span>
            )}
          </div>
        )}
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 ${
              !day.isWorking ? 'bg-gray-50' : ''
            }`}
          >
            {/* Day Name */}
            <div className="w-28 font-medium text-gray-900">{DAYS[day.dayOfWeek]}</div>

            {/* Toggle */}
            <button
              onClick={() => handleToggle(day.dayOfWeek)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                day.isWorking ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  day.isWorking ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>

            {/* Status */}
            <span className={`w-20 text-sm ${day.isWorking ? 'text-emerald-600' : 'text-gray-500'}`}>
              {day.isWorking ? 'Trabalho' : 'Folga'}
            </span>

            {/* Time Inputs */}
            {day.isWorking && (
              <div className="flex items-center gap-2 flex-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={day.startTime || '08:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-400">ate</span>
                <input
                  type="time"
                  value={day.endTime || '18:00'}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
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
        <strong>Dica:</strong> Seus horarios de trabalho serao usados para validar novos
        agendamentos. Clientes nao poderao marcar fora do seu expediente.
      </div>
    </div>
  );
}

export default MySchedulePage;
