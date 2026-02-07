import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Loader2, X, CalendarOff, MapPin, MapPinOff } from 'lucide-react';
import api from '../services/api';

interface PresenceSettings {
  minAdvanceHours: number;
  isInSalon: boolean;
  awayMarginHours: number;
}

interface Block {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  title: string;
  type: string;
  allDay: boolean;
}

interface NewBlockForm {
  blockDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export function MyBlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Presence status
  const [presence, setPresence] = useState<PresenceSettings>({
    minAdvanceHours: 2,
    isInSalon: true,
    awayMarginHours: 3, // Default 3 hours
  });
  const [updatingPresence, setUpdatingPresence] = useState(false);

  const [form, setForm] = useState<NewBlockForm>({
    blockDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    reason: '',
  });

  useEffect(() => {
    loadBlocks();
    loadPresenceSettings();
  }, []);

  const loadPresenceSettings = async () => {
    try {
      const { data } = await api.get('/online-booking/settings');
      const savedMargin = localStorage.getItem('awayMarginHours');
      const isInSalon = data.minAdvanceHours === 0;

      setPresence({
        minAdvanceHours: data.minAdvanceHours ?? 2,
        isInSalon,
        awayMarginHours: savedMargin ? parseInt(savedMargin) : (isInSalon ? 3 : data.minAdvanceHours),
      });
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  };

  const togglePresence = async (inSalon: boolean) => {
    setUpdatingPresence(true);
    try {
      const newMinAdvance = inSalon ? 0 : presence.awayMarginHours;

      await api.put('/online-booking/settings', {
        minAdvanceHours: newMinAdvance,
      });

      setPresence(prev => ({
        ...prev,
        isInSalon: inSalon,
        minAdvanceHours: newMinAdvance,
      }));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status de presença');
    } finally {
      setUpdatingPresence(false);
    }
  };

  const updateAwayMargin = async (hours: number) => {
    localStorage.setItem('awayMarginHours', hours.toString());
    setPresence(prev => ({ ...prev, awayMarginHours: hours }));

    // If currently away, update minAdvanceHours immediately
    if (!presence.isInSalon) {
      setUpdatingPresence(true);
      try {
        await api.put('/online-booking/settings', {
          minAdvanceHours: hours,
        });
        setPresence(prev => ({ ...prev, minAdvanceHours: hours }));
      } catch (err) {
        console.error('Erro ao atualizar margem:', err);
      } finally {
        setUpdatingPresence(false);
      }
    }
  };

  const loadBlocks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const endDate = futureDate.toISOString().split('T')[0];

      const { data } = await api.get(`/schedules/my-blocks?startDate=${today}&endDate=${endDate}`);
      setBlocks(data);
    } catch (err) {
      console.error('Erro ao carregar bloqueios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.blockDate || !form.startTime || !form.endTime) {
      alert('Preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      await api.post('/schedules/professional/me/blocks', {
        blockDate: form.blockDate,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason || 'Bloqueio pessoal',
        blockType: 'SINGLE',
      });
      await loadBlocks();
      setShowModal(false);
      setForm({
        blockDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '12:00',
        reason: '',
      });
    } catch (err) {
      console.error('Erro ao criar bloqueio:', err);
      alert('Erro ao criar bloqueio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm('Remover este bloqueio?')) return;

    setDeleting(blockId);
    try {
      await api.delete(`/schedules/blocks/${blockId}`);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error('Erro ao remover:', err);
      alert('Erro ao remover bloqueio');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <CalendarOff className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Bloqueios</h1>
            <p className="text-gray-500">Gerencie seus horarios indisponiveis</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Bloqueio
        </button>
      </div>

      {/* Presence Status Card */}
      <div className={`mb-6 rounded-2xl border-2 p-6 transition-all ${
        presence.isInSalon
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {presence.isInSalon ? (
            <MapPin className="w-6 h-6 text-green-600" />
          ) : (
            <MapPinOff className="w-6 h-6 text-red-600" />
          )}
          <h2 className="text-lg font-bold text-gray-900">Status de Presença</h2>
          {updatingPresence && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
        </div>

        {/* Toggle Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => togglePresence(true)}
            disabled={updatingPresence}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
              presence.isInSalon
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-green-300'
            }`}
          >
            <span className="text-xl">🟢</span>
            Estou no Salão
          </button>

          <button
            onClick={() => togglePresence(false)}
            disabled={updatingPresence}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
              !presence.isInSalon
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-red-300'
            }`}
          >
            <span className="text-xl">🔴</span>
            Não estou no Salão
          </button>
        </div>

        {/* Away Margin Selector */}
        <div className={`p-4 rounded-xl ${presence.isInSalon ? 'bg-white/50' : 'bg-white'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Margem de segurança (quando fora do salão)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 6].map(hours => (
              <button
                key={hours}
                onClick={() => updateAwayMargin(hours)}
                disabled={updatingPresence}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  presence.awayMarginHours === hours
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Status Info */}
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          presence.isInSalon
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {presence.isInSalon ? (
            <>
              <strong>Agendamento imediato ativo!</strong> Clientes podem agendar horários a partir de agora.
            </>
          ) : (
            <>
              <strong>Margem de {presence.awayMarginHours}h ativa!</strong> Clientes só podem agendar com {presence.awayMarginHours} horas de antecedência.
            </>
          )}
        </div>
      </div>

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum bloqueio</h3>
          <p className="text-gray-500 text-sm">
            Adicione bloqueios para horarios que voce nao podera atender.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              {/* Date */}
              <div className="w-24">
                <div className="text-sm font-medium text-gray-900">{formatDate(block.startDate)}</div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {block.allDay
                    ? 'Dia todo'
                    : `${block.startTime || '00:00'} - ${block.endTime || '23:59'}`}
                </span>
              </div>

              {/* Reason */}
              <div className="flex-1 text-gray-700">{block.title}</div>

              {/* Type Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  block.type === 'VACATION'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {block.type === 'VACATION' ? 'Ferias' : 'Bloqueio'}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDelete(block.id)}
                disabled={deleting === block.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {deleting === block.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Bloqueio</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={form.blockDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, blockDate: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ex: Consulta medica, Compromisso pessoal"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Criar Bloqueio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-orange-50 rounded-xl text-sm text-orange-700">
        <strong>Importante:</strong> Bloqueios impedem que clientes marquem horarios neste periodo.
        Use para compromissos pessoais, consultas medicas ou folgas pontuais.
      </div>
    </div>
  );
}

export default MyBlocksPage;
