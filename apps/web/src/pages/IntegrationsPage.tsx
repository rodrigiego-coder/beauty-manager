import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Check,
  X,
  RefreshCw,
  Settings,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../services/api';

// ==================== TYPES ====================

interface IntegrationStatus {
  connected: boolean;
  professionalId?: string;
  professionalName?: string;
  googleEmail?: string;
  calendarId?: string;
  syncDirection?: 'GOOGLE_TO_APP' | 'APP_TO_GOOGLE' | 'BIDIRECTIONAL';
  syncEnabled?: boolean;
  lastSyncAt?: string;
  status?: 'ACTIVE' | 'ERROR' | 'DISCONNECTED' | 'TOKEN_EXPIRED';
  errorMessage?: string;
}

interface SyncLog {
  id: string;
  syncType: string;
  direction: string;
  status: string;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsFound: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

interface Conflict {
  id: string;
  conflictType: string;
  localEvent?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  };
  googleEvent?: {
    id: string;
    summary: string;
    start: string;
    end: string;
  };
  status: string;
  createdAt: string;
}

interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsFound: number;
  errors: string[];
}

// ==================== COMPONENT ====================

export default function IntegrationsPage() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [allIntegrations, setAllIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  // ==================== DATA LOADING ====================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if configured
      const configRes = await api.get('/calendar/google/configured');
      setIsConfigured(configRes.data.configured);

      if (!configRes.data.configured) {
        setLoading(false);
        return;
      }

      // Load status
      const statusRes = await api.get('/calendar/google/status');
      setIntegrationStatus(statusRes.data);

      // Load all integrations (for managers/owners)
      try {
        const allRes = await api.get('/calendar/google/status/all');
        setAllIntegrations(allRes.data);
      } catch {
        // User might not have permission
      }

      // Load sync logs
      const logsRes = await api.get('/calendar/google/sync-logs?limit=10');
      setSyncLogs(logsRes.data);

      // Load conflicts
      const conflictsRes = await api.get('/calendar/google/conflicts');
      setConflicts(conflictsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar dados de integração.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for URL params (success/error from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const email = params.get('email');

    if (success === 'true') {
      setMessage({ type: 'success', text: `Conectado com sucesso${email ? ` (${email})` : ''}!` });
      // Clean URL
      window.history.replaceState({}, '', '/integracoes');
    } else if (error) {
      setMessage({ type: 'error', text: `Erro na conexão: ${error}` });
      window.history.replaceState({}, '', '/integracoes');
    }

    loadData();
  }, [loadData]);

  // ==================== ACTIONS ====================

  const handleConnect = async () => {
    try {
      const res = await api.get('/calendar/google/connect-url');
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Error getting connect URL:', err);
      setMessage({ type: 'error', text: 'Erro ao iniciar conexão.' });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta Google?')) return;

    try {
      await api.post('/calendar/google/disconnect');
      setMessage({ type: 'success', text: 'Conta desconectada com sucesso.' });
      loadData();
    } catch (err) {
      console.error('Error disconnecting:', err);
      setMessage({ type: 'error', text: 'Erro ao desconectar conta.' });
    }
  };

  const handleSync = async (fullSync = false) => {
    try {
      setSyncing(true);
      const res = await api.post<SyncResult>('/calendar/google/sync', { fullSync });

      const result = res.data;
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Sincronizado! ${result.eventsCreated} criados, ${result.eventsUpdated} atualizados, ${result.eventsDeleted} removidos.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Sincronização parcial: ${result.errors.join(', ')}`,
        });
      }

      loadData();
    } catch (err) {
      console.error('Error syncing:', err);
      setMessage({ type: 'error', text: 'Erro ao sincronizar.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSettings = async (settings: { syncDirection?: string; syncEnabled?: boolean }) => {
    try {
      await api.patch('/calendar/google/settings', settings);
      setMessage({ type: 'success', text: 'Configurações atualizadas.' });
      loadData();
    } catch (err) {
      console.error('Error updating settings:', err);
      setMessage({ type: 'error', text: 'Erro ao atualizar configurações.' });
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      await api.post('/calendar/google/conflicts/resolve', { conflictId, resolution });
      setMessage({ type: 'success', text: 'Conflito resolvido.' });
      loadData();
    } catch (err) {
      console.error('Error resolving conflict:', err);
      setMessage({ type: 'error', text: 'Erro ao resolver conflito.' });
    }
  };

  // ==================== RENDER HELPERS ====================

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'TOKEN_EXPIRED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800',
      TOKEN_EXPIRED: 'bg-yellow-100 text-yellow-800',
      DISCONNECTED: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      ERROR: 'Erro',
      TOKEN_EXPIRED: 'Token Expirado',
      DISCONNECTED: 'Desconectado',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status || ''] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status || ''] || status}
      </span>
    );
  };

  const getSyncDirectionLabel = (direction?: string) => {
    const labels: Record<string, string> = {
      GOOGLE_TO_APP: 'Google -> App',
      APP_TO_GOOGLE: 'App -> Google',
      BIDIRECTIONAL: 'Bidirecional',
    };
    return labels[direction || ''] || direction;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
                  Sincronize suas folgas e compromissos com o Google Calendar
                </p>
              </div>
            </div>
            {integrationStatus?.connected && getStatusIcon(integrationStatus.status)}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {!isConfigured ? (
            // Not configured
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Integração não configurada</h3>
              <p className="text-gray-500 mb-4">
                Configure as credenciais do Google OAuth no servidor para habilitar esta integração.
              </p>
              <p className="text-sm text-gray-400">
                Variáveis necessárias: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
              </p>
            </div>
          ) : !integrationStatus?.connected ? (
            // Not connected
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conecte sua conta Google</h3>
              <p className="text-gray-500 mb-6">
                Importe automaticamente seus compromissos do Google Calendar como bloqueios de horário.
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Conta conectada</p>
                  <p className="font-medium text-gray-900">{integrationStatus.googleEmail}</p>
                </div>
                {getStatusBadge(integrationStatus.status)}
              </div>

              {/* Error message if any */}
              {integrationStatus.errorMessage && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">{integrationStatus.errorMessage}</p>
                  {integrationStatus.status === 'TOKEN_EXPIRED' && (
                    <button
                      onClick={handleConnect}
                      className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                    >
                      Reconectar conta
                    </button>
                  )}
                </div>
              )}

              {/* Sync info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Direção da sincronização</p>
                  <p className="font-medium text-gray-900">
                    {getSyncDirectionLabel(integrationStatus.syncDirection)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Última sincronização</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(integrationStatus.lastSyncAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSync(false)}
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
                  onClick={() => handleSync(true)}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Sincronização Completa
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Direção da Sincronização
                    </label>
                    <select
                      value={integrationStatus.syncDirection}
                      onChange={(e) => handleUpdateSettings({ syncDirection: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="GOOGLE_TO_APP">Google &rarr; App (importar)</option>
                      <option value="APP_TO_GOOGLE">App &rarr; Google (exportar)</option>
                      <option value="BIDIRECTIONAL">Bidirecional</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sincronização Automática</p>
                      <p className="text-sm text-gray-500">
                        Sincronizar automaticamente a cada 30 minutos
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdateSettings({ syncEnabled: !integrationStatus.syncEnabled })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        integrationStatus.syncEnabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          integrationStatus.syncEnabled ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Sync Logs */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Histórico de Sincronização</span>
                  </div>
                  {showLogs ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showLogs && (
                  <div className="mt-4 space-y-2">
                    {syncLogs.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum histórico de sincronização.
                      </p>
                    ) : (
                      syncLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-3 rounded-lg text-sm ${
                            log.status === 'SUCCESS'
                              ? 'bg-green-50'
                              : log.status === 'ERROR'
                                ? 'bg-red-50'
                                : 'bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {log.status === 'SUCCESS' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : log.status === 'ERROR' ? (
                                <X className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              )}
                              <span className="font-medium">
                                {log.syncType === 'FULL' ? 'Completa' : 'Incremental'}
                              </span>
                            </div>
                            <span className="text-gray-500">{formatDate(log.startedAt)}</span>
                          </div>
                          <div className="mt-1 text-gray-600">
                            +{log.eventsCreated} criados, ~{log.eventsUpdated} atualizados, -{log.eventsDeleted} removidos
                            {log.conflictsFound > 0 && `, ${log.conflictsFound} conflitos`}
                          </div>
                          {log.errorMessage && (
                            <div className="mt-1 text-red-600">{log.errorMessage}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Conflicts */}
              {conflicts.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowConflicts(!showConflicts)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">
                        Conflitos Pendentes ({conflicts.length})
                      </span>
                    </div>
                    {showConflicts ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showConflicts && (
                    <div className="mt-4 space-y-3">
                      {conflicts.map((conflict) => (
                        <div key={conflict.id} className="p-4 bg-yellow-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {conflict.conflictType === 'TIME_OVERLAP'
                                  ? 'Sobreposição de Horário'
                                  : conflict.conflictType}
                              </p>
                              <div className="mt-2 text-sm text-gray-600 space-y-1">
                                {conflict.localEvent && (
                                  <p>
                                    <strong>Local:</strong> {conflict.localEvent.title} -{' '}
                                    {conflict.localEvent.startDate}
                                    {conflict.localEvent.startTime && ` ${conflict.localEvent.startTime}`}
                                  </p>
                                )}
                                {conflict.googleEvent && (
                                  <p>
                                    <strong>Google:</strong> {conflict.googleEvent.summary} -{' '}
                                    {new Date(conflict.googleEvent.start).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleResolveConflict(conflict.id, 'KEEP_LOCAL')}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Manter Local
                            </button>
                            <button
                              onClick={() => handleResolveConflict(conflict.id, 'KEEP_GOOGLE')}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Manter Google
                            </button>
                            <button
                              onClick={() => handleResolveConflict(conflict.id, 'MERGE')}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Manter Ambos
                            </button>
                            <button
                              onClick={() => handleResolveConflict(conflict.id, 'IGNORE')}
                              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                            >
                              Ignorar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Integrations (for managers/owners) */}
      {allIntegrations.length > 1 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Integrações da Equipe</h2>
            <p className="text-sm text-gray-500">Status das integrações de todos os profissionais</p>
          </div>
          <div className="divide-y divide-gray-200">
            {allIntegrations.map((integration) => (
              <div key={integration.professionalId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {integration.professionalName || 'Profissional'}
                    </p>
                    <p className="text-sm text-gray-500">{integration.googleEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.lastSyncAt && (
                    <span className="text-sm text-gray-500">
                      Última sync: {formatDate(integration.lastSyncAt)}
                    </span>
                  )}
                  {getStatusBadge(integration.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
