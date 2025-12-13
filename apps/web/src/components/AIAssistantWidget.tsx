import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Minus, MessageCircle, RefreshCw, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Alert {
  type: string;
  title: string;
  description: string;
}

interface BriefingResponse {
  message: string;
  alerts: Alert[];
  tips: string[];
}

interface ChatMessage {
  role: string;
  content: string;
}

export default function AIAssistantWidget() {
  const [minimized, setMinimized] = useState(true);
  const [tab, setTab] = useState<'briefing' | 'chat'>('briefing');
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minimized && !briefing) {
      loadBriefing();
    }
  }, [minimized]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<BriefingResponse>('/ai-assistant/briefing');
      setBriefing(data);
    } catch (err: any) {
      console.error('Erro ao carregar briefing:', err);
      setError(err.response?.data?.message || 'Erro ao carregar briefing');
    }
    setLoading(false);
  };

  const loadChatHistory = async () => {
    try {
      const { data } = await api.get<ChatMessage[]>('/ai-assistant/chat/history');
      setChatHistory(data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post<{ response: string }>('/ai-assistant/chat', { message: userMessage });
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' },
      ]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    try {
      await api.delete('/ai-assistant/chat/history');
      setChatHistory([]);
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  };

  const quickAsk = (question: string) => {
    setInputMessage(question);
    setTab('chat');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl"
        title="Abrir Belle - Assistente IA"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-white">Belle</h3>
            <span className="text-xs text-purple-100">Sua assistente IA</span>
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

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button
          onClick={() => setTab('briefing')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'briefing'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Briefing
        </button>
        <button
          onClick={() => {
            setTab('chat');
            if (chatHistory.length === 0) loadChatHistory();
          }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'chat'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💬 Chat
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'briefing' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                <p className="text-sm text-gray-500">Preparando seu briefing...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                  onClick={loadBriefing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              </div>
            ) : briefing ? (
              <div className="space-y-4">
                {/* Alertas */}
                {briefing.alerts && briefing.alerts.length > 0 && (
                  <div className="space-y-2">
                    {briefing.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-3 rounded-lg border ${getAlertBg(alert.type)}`}
                      >
                        {getAlertIcon(alert.type)}
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensagem principal */}
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {briefing.message}
                </div>

                {/* Botão de atualizar */}
                <div className="pt-2 border-t">
                  <button
                    onClick={loadBriefing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar briefing
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Clique em atualizar para carregar o briefing</p>
                <button
                  onClick={loadBriefing}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Carregar briefing
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <div className="space-y-4">
            {chatHistory.length === 0 && !loading && (
              <div className="text-center py-6">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">Olá! Como posso ajudar?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => quickAsk('Como está meu faturamento?')}
                    className="text-xs bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 hover:bg-purple-200 transition-colors"
                  >
                    📊 Faturamento
                  </button>
                  <button
                    onClick={() => quickAsk('Quais clientes estão em risco?')}
                    className="text-xs bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 hover:bg-purple-200 transition-colors"
                  >
                    👥 Clientes em risco
                  </button>
                  <button
                    onClick={() => quickAsk('Quais produtos estão com estoque baixo?')}
                    className="text-xs bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 hover:bg-purple-200 transition-colors"
                  >
                    📦 Estoque baixo
                  </button>
                  <button
                    onClick={() => quickAsk('Me dê dicas para vender mais')}
                    className="text-xs bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 hover:bg-purple-200 transition-colors"
                  >
                    💡 Dicas de vendas
                  </button>
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-purple-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input (só no chat) */}
      {tab === 'chat' && (
        <div className="p-3 border-t bg-gray-50">
          {chatHistory.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpar conversa
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Pergunte algo..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-purple-500 text-white rounded-xl px-4 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
