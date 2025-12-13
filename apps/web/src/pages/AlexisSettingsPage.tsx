import { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, Settings, Clock, MessageCircle, Volume2, Bell } from 'lucide-react';
import api from '../services/api';

interface AlexisSettings {
  id: string;
  salonId: string;
  isEnabled: boolean;
  assistantName: string;
  greetingMessage: string;
  humanTakeoverMessage: string;
  aiResumeMessage: string;
  humanTakeoverCommand: string;
  aiResumeCommand: string;
  autoSchedulingEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export default function AlexisSettingsPage() {
  const [settings, setSettings] = useState<AlexisSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alexis/settings');
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configuracoes:', err);
      alert('Erro ao carregar configuracoes');
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await api.patch('/alexis/settings', {
        isEnabled: settings.isEnabled,
        assistantName: settings.assistantName,
        greetingMessage: settings.greetingMessage,
        humanTakeoverMessage: settings.humanTakeoverMessage,
        aiResumeMessage: settings.aiResumeMessage,
        humanTakeoverCommand: settings.humanTakeoverCommand,
        aiResumeCommand: settings.aiResumeCommand,
        autoSchedulingEnabled: settings.autoSchedulingEnabled,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
      });
      alert('Configuracoes salvas!');
    } catch (err) {
      console.error('Erro ao salvar configuracoes:', err);
      alert('Erro ao salvar configuracoes');
    }
    setSaving(false);
  };

  const updateSetting = <K extends keyof AlexisSettings>(key: K, value: AlexisSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-gray-500">
        Erro ao carregar configuracoes
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuracoes ALEXIS</h1>
            <p className="text-sm text-gray-500">Personalize sua assistente de IA</p>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salvar
        </button>
      </div>

      <div className="space-y-6">
        {/* Status Geral */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            Status Geral
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">ALEXIS Ativada</p>
              <p className="text-sm text-gray-500">
                Quando desativada, nenhuma resposta automatica sera enviada
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => updateSetting('isEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Identidade */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-500" />
            Identidade
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Assistente
              </label>
              <input
                type="text"
                value={settings.assistantName}
                onChange={(e) => updateSetting('assistantName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alexis"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome usado nas apresentacoes e mensagens
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem de Boas-vindas
              </label>
              <textarea
                value={settings.greetingMessage}
                onChange={(e) => updateSetting('greetingMessage', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ola! Sou a Alexis..."
              />
            </div>
          </div>
        </div>

        {/* Comandos de Controle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Comandos de Controle
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comando para Assumir (#eu)
                </label>
                <input
                  type="text"
                  value={settings.humanTakeoverCommand}
                  onChange={(e) => updateSetting('humanTakeoverCommand', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#eu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem ao Assumir
                </label>
                <textarea
                  value={settings.humanTakeoverMessage}
                  onChange={(e) => updateSetting('humanTakeoverMessage', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enviada ao cliente quando um atendente assume
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comando para Retornar IA (#ia)
                </label>
                <input
                  type="text"
                  value={settings.aiResumeCommand}
                  onChange={(e) => updateSetting('aiResumeCommand', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#ia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem ao Retornar IA
                </label>
                <textarea
                  value={settings.aiResumeMessage}
                  onChange={(e) => updateSetting('aiResumeMessage', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enviada ao cliente quando a IA volta a responder
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Os comandos (#eu e #ia) NAO sao enviados ao cliente - apenas a mensagem de resposta e enviada.
            </p>
          </div>
        </div>

        {/* Agendamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Agendamento Automatico
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900">Agendamento via WhatsApp</p>
              <p className="text-sm text-gray-500">
                Permite que clientes agendem servicos diretamente pelo chat
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSchedulingEnabled}
                onChange={(e) => updateSetting('autoSchedulingEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Horario de Funcionamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Horario de Funcionamento
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inicio
              </label>
              <input
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => updateSetting('workingHoursStart', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim
              </label>
              <input
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => updateSetting('workingHoursEnd', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Horarios em que a ALEXIS responde automaticamente
          </p>
        </div>
      </div>
    </div>
  );
}
