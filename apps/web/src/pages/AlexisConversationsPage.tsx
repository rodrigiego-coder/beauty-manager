import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  MessageCircle,
  User,
  Send,
  RefreshCw,
  Phone,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
} from 'lucide-react';
import api from '../services/api';

interface Session {
  id: string;
  clientPhone: string;
  clientName: string | null;
  status: string;
  controlMode: string;
  messageCount: number;
  lgpdConsentGiven: boolean;
  lastMessageAt: string | null;
  startedAt: string;
  humanTakeoverById?: string | null;
}

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  respondedBy: 'AI' | 'HUMAN';
  complianceRisk: string;
  createdAt: string;
}

// Interface ajustada para o payload REAL da API /alexis/compliance/stats
interface ComplianceStats {
  totalBlocked: number;
  totalInteractions: number;
  humanTakeovers: number;
  complianceRate: number;
}

// Interface ajustada para o payload REAL da API /alexis/metrics
interface Metrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
}

export default function AlexisConversationsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes, metricsRes] = await Promise.all([
        api.get('/alexis/sessions'),
        api.get('/alexis/compliance/stats'),
        api.get('/alexis/metrics'),
      ]);
      setSessions(sessionsRes.data);
      setComplianceStats(statsRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
    setLoading(false);
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data } = await api.get(`/alexis/sessions/${sessionId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  const selectSession = async (session: Session) => {
    setSelectedSession(session);
    await loadMessages(session.id);
  };

  const handleTakeover = async () => {
    if (!selectedSession) return;

    try {
      await api.post('/alexis/takeover', { sessionId: selectedSession.id });
      // Atualizar sessão local
      setSelectedSession({ ...selectedSession, controlMode: 'HUMAN' });
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedSession.id ? { ...s, controlMode: 'HUMAN' } : s)),
      );
    } catch (err) {
      console.error('Erro ao assumir conversa:', err);
    }
  };

  const handleResumeAI = async () => {
    if (!selectedSession) return;

    try {
      await api.post(`/alexis/resume/${selectedSession.id}`);
      setSelectedSession({ ...selectedSession, controlMode: 'AI' });
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedSession.id ? { ...s, controlMode: 'AI' } : s)),
      );
    } catch (err) {
      console.error('Erro ao retornar IA:', err);
    }
  };

  const sendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await api.post('/alexis/message/human', {
        sessionId: selectedSession.id,
        message: newMessage,
      });

      // Adicionar mensagem localmente
      const msg: Message = {
        id: `local_${Date.now()}`,
        direction: 'OUTBOUND',
        content: newMessage,
        respondedBy: 'HUMAN',
        complianceRisk: 'NONE',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
    setSendingMessage(false);
  };

  const endSession = async () => {
    if (!selectedSession) return;

    try {
      await api.post(`/alexis/sessions/${selectedSession.id}/end`);
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedSession.id ? { ...s, status: 'ENDED' } : s)),
      );
      setSelectedSession(null);
      setMessages([]);
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.clientPhone.includes(searchTerm) ||
      (s.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, controlMode: string) => {
    if (status === 'ENDED') {
      return (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
          Encerrada
        </span>
      );
    }
    if (controlMode === 'HUMAN') {
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
          <User className="w-3 h-3" />
          Humano
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
        <Bot className="w-3 h-3" />
        ALEXIS
      </span>
    );
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'HIGH':
      case 'BLOCKED':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'LOW':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ALEXIS</h1>
            <p className="text-sm text-gray-500">Conversas WhatsApp & Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards - usando campos REAIS da API */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Conversas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.totalConversations ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Bot className="w-4 h-4" />
            <span className="text-xs">Ativas</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{metrics?.activeConversations ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <User className="w-4 h-4" />
            <span className="text-xs">Total Mensagens</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{metrics?.totalMessages ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Takeovers</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{complianceStats?.humanTakeovers ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs">Bloqueios Compliance</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{complianceStats?.totalBlocked ?? 0}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sessions List */}
        <div className="w-80 bg-white rounded-xl border border-gray-200 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-2 py-1 rounded text-xs ${!statusFilter ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2 py-1 rounded text-xs ${statusFilter === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Ativas
              </button>
              <button
                onClick={() => setStatusFilter('ENDED')}
                className={`px-2 py-1 rounded text-xs ${statusFilter === 'ENDED' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Encerradas
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Carregando...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Nenhuma conversa</div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {session.clientName || session.clientPhone}
                    </span>
                    {getStatusBadge(session.status, session.controlMode)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    {session.clientPhone}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span>{session.messageCount} msgs</span>
                    {session.lgpdConsentGiven && (
                      <span title="LGPD OK">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </span>
                    )}
                    <span>
                      {session.lastMessageAt
                        ? new Date(session.lastMessageAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedSession.clientName || selectedSession.clientPhone}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3 h-3" />
                    {selectedSession.clientPhone}
                    {selectedSession.lgpdConsentGiven && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        LGPD OK
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSession.controlMode === 'AI' ? (
                    <button
                      onClick={handleTakeover}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <User className="w-4 h-4" />
                      Assumir (#eu)
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeAI}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Bot className="w-4 h-4" />
                      Retornar IA (#ia)
                    </button>
                  )}

                  {selectedSession.status === 'ACTIVE' && (
                    <button
                      onClick={endSession}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                      Encerrar
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'INBOUND' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.direction === 'INBOUND'
                          ? 'bg-white border border-gray-200 rounded-bl-none'
                          : msg.respondedBy === 'AI'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-green-500 text-white rounded-br-none'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {msg.direction === 'OUTBOUND' &&
                          (msg.respondedBy === 'AI' ? (
                            <Bot className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          ))}
                        {getRiskIcon(msg.complianceRisk)}
                        <span
                          className={`text-xs ${msg.direction === 'INBOUND' ? 'text-gray-500' : 'opacity-75'}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedSession.status === 'ACTIVE' && selectedSession.controlMode === 'HUMAN' && (
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {selectedSession.status === 'ACTIVE' && selectedSession.controlMode === 'AI' && (
                <div className="p-4 border-t bg-blue-50 text-center text-sm text-blue-600">
                  <Bot className="w-4 h-4 inline mr-1" />
                  ALEXIS está respondendo. Clique em "Assumir" para enviar mensagens manualmente.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </div>
          )}
        </div>

        {/* Compliance Panel - usando campos REAIS da API */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Compliance
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Taxa de Compliance</span>
                <span className="font-medium text-green-600">
                  {complianceStats?.complianceRate ?? 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${complianceStats?.complianceRate ?? 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Total Interações</span>
                <span className="font-medium text-blue-600">
                  {complianceStats?.totalInteractions ?? 0}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Resumo</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-red-600">
                    {complianceStats?.totalBlocked ?? 0}
                  </p>
                  <p className="text-xs text-red-500">Bloqueios</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-600">
                    {complianceStats?.humanTakeovers ?? 0}
                  </p>
                  <p className="text-xs text-yellow-500">Takeovers</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Compliance Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
