import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  X,
  RefreshCw,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Wifi,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../services/api';

// ==================== TYPES ====================

interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
  calendarId?: string;
  lastSyncAt?: string;
  syncEnabled?: boolean;
}

// ==================== COMPONENT ====================

export default function IntegrationsPage() {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // ==================== DATA LOADING ====================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations/google/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Error loading data:', err);
      // API might return 404 if not connected - that's OK
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for URL params (success/error from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const googleStatus = params.get('google');
    const email = params.get('email');
    const errorMessage = params.get('message');

    if (googleStatus === 'success') {
      setMessage({ type: 'success', text: `Google Calendar conectado${email ? ` (${decodeURIComponent(email)})` : ''}!` });
      window.history.replaceState({}, '', '/integracoes');
    } else if (googleStatus === 'error') {
      setMessage({ type: 'error', text: `Erro na conexão: ${decodeURIComponent(errorMessage || 'Falha na autenticação')}` });
      window.history.replaceState({}, '', '/integracoes');
    }

    loadData();
  }, [loadData]);

  // ==================== ACTIONS ====================

  const handleConnect = async () => {
    try {
      const res = await api.get('/integrations/google/auth-url');
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Error getting connect URL:', err);
      setMessage({ type: 'error', text: 'Erro ao iniciar conexão.' });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta Google?')) return;

    try {
      await api.delete('/integrations/google/disconnect');
      setMessage({ type: 'success', text: 'Conta desconectada com sucesso.' });
      setStatus({ connected: false });
    } catch (err) {
      console.error('Error disconnecting:', err);
      setMessage({ type: 'error', text: 'Erro ao desconectar conta.' });
    }
  };

  const handleSyncFromGoogle = async () => {
    try {
      setSyncing(true);
      const res = await api.post('/integrations/google/sync-from-google');

      setMessage({
        type: 'success',
        text: `Sincronização concluída! ${res.data.count} eventos encontrados no Google Calendar.`,
      });
      loadData();
    } catch (err) {
      console.error('Error syncing:', err);
      setMessage({ type: 'error', text: 'Erro ao sincronizar com Google Calendar.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSync = async () => {
    if (!status) return;

    try {
      await api.post('/integrations/google/toggle-sync', { enabled: !status.syncEnabled });
      setMessage({ type: 'success', text: 'Configuração atualizada.' });
      loadData();
    } catch (err) {
      console.error('Error toggling sync:', err);
      setMessage({ type: 'error', text: 'Erro ao atualizar configuração.' });
    }
  };

  // ==================== RENDER HELPERS ====================

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Conecte sua agenda com serviços externos</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Google Calendar Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Google Agenda</h2>
                <p className="text-sm text-gray-500">
                  Sincronize seus agendamentos com o Google Calendar
                </p>
              </div>
            </div>
            {status?.connected ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-gray-300" />
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {!status?.connected ? (
            // Not connected
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conecte sua conta Google</h3>
              <p className="text-gray-500 mb-6">
                Sincronize automaticamente seus agendamentos com o Google Calendar.
                Seus compromissos pessoais do Google também ficarão visíveis no sistema.
              </p>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Conectar com Google
              </button>
            </div>
          ) : (
            // Connected
            <div className="space-y-6">
              {/* Connection info */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Conta conectada</p>
                    <p className="font-medium text-gray-900">{status.email || status.calendarId}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Ativo
                </span>
              </div>

              {/* Last sync info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Sincronização automática</p>
                  <p className="font-medium text-gray-900">
                    {status.syncEnabled ? 'Ativada' : 'Desativada'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Última sincronização</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(status.lastSyncAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSyncFromGoogle}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {syncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Sincronizar Agora
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                  {showSettings ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Desconectar
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900">Configurações de Sincronização</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sincronização Automática</p>
                      <p className="text-sm text-gray-500">
                        Enviar automaticamente novos agendamentos para o Google Calendar
                      </p>
                    </div>
                    <button
                      onClick={handleToggleSync}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        status.syncEnabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          status.syncEnabled ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Como funciona:</h4>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Novos agendamentos são enviados para o Google Calendar</li>
                      <li>• Alterações e cancelamentos são sincronizados automaticamente</li>
                      <li>• Seus compromissos pessoais do Google aparecem como bloqueios</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Sobre a integração</h3>
            <p className="text-sm text-blue-700 mt-1">
              A integração com o Google Calendar permite que você visualize e gerencie seus agendamentos
              diretamente no Google Agenda. Seus compromissos pessoais também ficam visíveis no sistema
              para evitar conflitos de horário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
