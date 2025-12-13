import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Minus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Shield,
  ShieldAlert,
  User,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

interface ChatMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  respondedBy: 'AI' | 'HUMAN';
  complianceRisk: string;
  createdAt: string;
}

interface AlexisStatus {
  isEnabled: boolean;
  isConfigured: boolean;
  model: string;
  assistantName: string;
  complianceLevel: string;
  features: {
    whatsapp: boolean;
    autoResponse: boolean;
    lgpdConsent: boolean;
    anvisaWarnings: boolean;
  };
}

export default function AlexisWidget() {
  const [minimized, setMinimized] = useState(true);
  const [status, setStatus] = useState<AlexisStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minimized) {
      loadStatus();
      loadHistory();
    }
  }, [minimized]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStatus = async () => {
    try {
      const { data } = await api.get<AlexisStatus>('/alexis/status');
      setStatus(data);
    } catch (err) {
      console.error('Erro ao carregar status ALEXIS:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get<ChatMessage[]>('/alexis/chat/history');
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError(null);

    // Adicionar mensagem do usuário localmente
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      direction: 'INBOUND',
      content: userMessage,
      respondedBy: 'HUMAN',
      complianceRisk: 'NONE',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { data } = await api.post<{
        success: boolean;
        message: string;
        controlMode: string;
        compliance?: { preCheck?: { riskLevel: string } };
      }>('/alexis/chat', { message: userMessage });

      if (data.success && data.message) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          direction: 'OUTBOUND',
          content: data.message,
          respondedBy: 'AI',
          complianceRisk: data.compliance?.preCheck?.riskLevel || 'NONE',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (!data.success) {
        setError(data.message || 'Erro ao processar mensagem');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar mensagem');
      // Remover mensagem temporária em caso de erro
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    try {
      await api.delete('/alexis/chat/history');
      setMessages([]);
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  };

  const quickAsk = (question: string) => {
    setInputMessage(question);
  };

  const getComplianceIcon = (risk: string) => {
    switch (risk) {
      case 'HIGH':
      case 'BLOCKED':
        return <ShieldAlert className="w-3 h-3 text-red-500" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'LOW':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl"
        title="Abrir ALEXIS - Assistente IA"
      >
        <Bot className="w-8 h-8 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-white">ALEXIS</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-blue-100">Assistente IA</span>
              {status?.features.anvisaWarnings && (
                <span title="ANVISA Compliant">
                  <Shield className="w-3 h-3 text-green-300" />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized(true)}
            className="text-white hover:bg-white/20 rounded p-1.5 transition-colors"
            title="Minimizar"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="text-white hover:bg-white/20 rounded p-1.5 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compliance Badge */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Shield className="w-4 h-4" />
          <span>ANVISA + LGPD Compliant</span>
        </div>
        <span className="text-xs text-blue-500 font-medium">
          {status?.complianceLevel || 'STRICT'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-300" />
            <p className="text-gray-600 mb-4">Olá! Sou ALEXIS. Como posso ajudar?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => quickAsk('Quais serviços vocês oferecem?')}
                className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-200 transition-colors"
              >
                Serviços
              </button>
              <button
                onClick={() => quickAsk('Quero agendar um horário')}
                className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-200 transition-colors"
              >
                Agendar
              </button>
              <button
                onClick={() => quickAsk('Quais são os preços?')}
                className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-200 transition-colors"
              >
                Preços
              </button>
              <button
                onClick={() => quickAsk('Horário de funcionamento')}
                className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-200 transition-colors"
              >
                Horários
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'INBOUND' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.direction === 'INBOUND'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {msg.direction === 'OUTBOUND' && (
                  <>
                    {msg.respondedBy === 'AI' ? (
                      <Bot className="w-3 h-3 text-blue-500" />
                    ) : (
                      <User className="w-3 h-3 text-green-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {msg.respondedBy === 'AI' ? 'ALEXIS' : 'Atendente'}
                    </span>
                  </>
                )}
                {getComplianceIcon(msg.complianceRisk)}
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></span>
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-gray-50">
        {messages.length > 0 && (
          <div className="flex justify-between mb-2">
            <button
              onClick={loadHistory}
              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Atualizar
            </button>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Limpar
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-500 text-white rounded-xl px-4 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Comandos */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          <span className="font-mono">#eu</span> para atendente •{' '}
          <span className="font-mono">#ia</span> para ALEXIS
        </div>
      </div>
    </div>
  );
}
