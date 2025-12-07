import { useState } from 'react';
import { Bot, BotOff, Phone, Search, Power, Loader2 } from 'lucide-react';
import { getClientStatus, toggleAiStatus, Client } from '../services/api';

export function ChatControl() {
  const [phone, setPhone] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 13);
  };

  const handleSearch = async () => {
    if (!phone || phone.length < 10) {
      setError('Digite um telefone valido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getClientStatus(phone);
      setClient(data);
      if (!data) {
        setError('Cliente nao encontrado. Ele sera criado ao enviar a primeira mensagem.');
      }
    } catch {
      setError('Erro ao buscar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!phone) return;

    setToggling(true);
    setError('');

    try {
      const updated = await toggleAiStatus(phone);
      setClient(updated);
    } catch {
      setError('Erro ao alterar status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Bot className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Controle do Robo</h2>
          <p className="text-sm text-gray-500">Gerencie a IA por cliente</p>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="5511999999999"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          {error}
        </div>
      )}

      {/* Status Card */}
      {client && (
        <div className={`p-4 rounded-xl border-2 transition-all ${
          client.aiActive
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                client.aiActive ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {client.aiActive ? (
                  <Bot className="w-6 h-6 text-emerald-600" />
                ) : (
                  <BotOff className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                    client.aiActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      client.aiActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    {client.aiActive ? 'IA Ativa' : 'IA Pausada'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {client.name || client.phone}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                client.aiActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {client.aiActive ? 'Pausar' : 'Ativar'}
            </button>
          </div>
        </div>
      )}

      {/* Instrucoes */}
      {!client && !error && (
        <div className="text-center py-8 text-gray-400">
          <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Digite o telefone do cliente para gerenciar a IA</p>
        </div>
      )}
    </div>
  );
}
