import { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  Eye,
} from 'lucide-react';
import api from '../services/api';

interface InteractionLog {
  id: string;
  salonId: string;
  conversationId: string;
  clientPhone: string;
  messageIn: string;
  messageOut: string;
  intent: string;
  wasBlocked: boolean;
  blockReason: string | null;
  responseTimeMs: number;
  createdAt: string;
}

interface BlockedTermLog {
  id: string;
  salonId: string;
  conversationId: string;
  originalMessage: string;
  blockedTerms: string[];
  layer: 'INPUT' | 'OUTPUT';
  createdAt: string;
}

type TabType = 'interactions' | 'blocked';

export default function AlexisLogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('interactions');
  const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
  const [blockedLogs, setBlockedLogs] = useState<BlockedTermLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<InteractionLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [activeTab]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'interactions') {
        const { data } = await api.get('/alexis/logs?limit=100');
        setInteractionLogs(data);
      } else {
        const { data } = await api.get('/alexis/logs/blocked?limit=100');
        setBlockedLogs(data);
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getIntentBadge = (intent: string) => {
    const colors: Record<string, string> = {
      GREETING: 'bg-blue-100 text-blue-700',
      SCHEDULE: 'bg-green-100 text-green-700',
      RESCHEDULE: 'bg-yellow-100 text-yellow-700',
      CANCEL: 'bg-red-100 text-red-700',
      PRODUCT_INFO: 'bg-purple-100 text-purple-700',
      SERVICE_INFO: 'bg-cyan-100 text-cyan-700',
      PRICE_INFO: 'bg-orange-100 text-orange-700',
      GENERAL: 'bg-gray-100 text-gray-700',
      BLOCKED: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[intent] || colors.GENERAL}`}>
        {intent}
      </span>
    );
  };

  const getLayerBadge = (layer: string) => {
    return layer === 'INPUT' ? (
      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
        Entrada
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
        Saida
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs ALEXIS</h1>
            <p className="text-sm text-gray-500">Historico de interacoes e bloqueios</p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('interactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'interactions'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          Interacoes
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'blocked'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          Termos Bloqueados
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Logs List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : activeTab === 'interactions' ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
                <div className="col-span-2">Data/Hora</div>
                <div className="col-span-2">Cliente</div>
                <div className="col-span-3">Mensagem</div>
                <div className="col-span-1">Intencao</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Tempo</div>
                <div className="col-span-1">Acoes</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {interactionLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhuma interacao registrada
                  </div>
                ) : (
                  interactionLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-gray-50 items-center text-sm ${
                        log.wasBlocked ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatTime(log.createdAt)}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{log.clientPhone}</span>
                        </div>
                      </div>

                      <div className="col-span-3 truncate text-gray-600" title={log.messageIn}>
                        {log.messageIn.substring(0, 50)}...
                      </div>

                      <div className="col-span-1">{getIntentBadge(log.intent)}</div>

                      <div className="col-span-1">
                        {log.wasBlocked ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <ShieldAlert className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <Shield className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-gray-500">
                        {log.responseTimeMs}ms
                      </div>

                      <div className="col-span-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Blocked Logs Table */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
                <div className="col-span-2">Data/Hora</div>
                <div className="col-span-4">Mensagem Original</div>
                <div className="col-span-3">Termos Bloqueados</div>
                <div className="col-span-2">Camada</div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {blockedLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum termo bloqueado
                  </div>
                ) : (
                  blockedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-gray-50 items-center text-sm bg-red-50"
                    >
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatTime(log.createdAt)}
                        </div>
                      </div>

                      <div className="col-span-4 text-gray-600" title={log.originalMessage}>
                        {log.originalMessage.substring(0, 80)}...
                      </div>

                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {log.blockedTerms.slice(0, 3).map((term, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                            >
                              {term}
                            </span>
                          ))}
                          {log.blockedTerms.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{log.blockedTerms.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">{getLayerBadge(log.layer)}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selectedLog && (
          <div className="w-96 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Detalhes da Interacao</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cliente
                </label>
                <p className="text-sm text-gray-900">{selectedLog.clientPhone}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Data/Hora
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedLog.createdAt)} {formatTime(selectedLog.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Intencao Detectada
                </label>
                {getIntentBadge(selectedLog.intent)}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mensagem do Cliente
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {selectedLog.messageIn}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Resposta da ALEXIS
                </label>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {selectedLog.messageOut}
                </div>
              </div>

              {selectedLog.wasBlocked && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-sm">Mensagem Bloqueada</span>
                  </div>
                  <p className="text-sm text-red-600">
                    Razao: {selectedLog.blockReason || 'Termo proibido detectado'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tempo de Resposta
                </label>
                <p className="text-sm text-gray-900">{selectedLog.responseTimeMs}ms</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
