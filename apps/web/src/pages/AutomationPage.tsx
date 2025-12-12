import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Phone,
  Settings,
  FileText,
  Send,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  BarChart3,
  Eye,
  Copy,
  X,
  Save,
  TestTube,
  Smartphone,
  Mail,
  Gift,
  Calendar,
  Star,
  Zap,
} from 'lucide-react';
import api from '../services/api';

// ==================== INTERFACES ====================

interface AutomationSettings {
  id: string;
  salonId: string;
  whatsappEnabled: boolean;
  whatsappProvider: 'META' | 'TWILIO' | 'ZENVIA';
  whatsappConnected: boolean;
  smsEnabled: boolean;
  smsProvider: 'TWILIO' | 'ZENVIA' | 'AWS_SNS';
  smsConnected: boolean;
  smsBalance?: number;
  reminderEnabled: boolean;
  reminderHoursBefore: number;
  confirmationEnabled: boolean;
  confirmationHoursBefore: number;
  birthdayEnabled: boolean;
  birthdayTime: string;
  birthdayDiscountPercent?: number;
  reviewRequestEnabled: boolean;
  reviewRequestHoursAfter: number;
}

interface MessageTemplate {
  id: string;
  salonId: string;
  name: string;
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMATION' | 'BIRTHDAY' | 'WELCOME' | 'REVIEW_REQUEST' | 'CUSTOM';
  channel: 'WHATSAPP' | 'SMS' | 'BOTH';
  subject?: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
  triggerHoursBefore?: number;
  createdAt: string;
}

interface MessageLog {
  id: string;
  salonId: string;
  templateId?: string;
  clientId?: string;
  channel: 'WHATSAPP' | 'SMS';
  phoneNumber: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  externalId?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  cost?: string;
  createdAt: string;
}

interface MessageStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  totalCost: number;
  byChannel: {
    whatsapp: { sent: number; delivered: number; read: number; failed: number };
    sms: { sent: number; delivered: number; cost: number; failed: number };
  };
  byType: {
    reminder: number;
    confirmation: number;
    birthday: number;
    custom: number;
  };
}

type TabType = 'settings' | 'templates' | 'logs' | 'stats';

// ==================== COMPONENT ====================

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  // Form states
  const [editingSettings, setEditingSettings] = useState<Partial<AutomationSettings>>({});
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'CUSTOM' as MessageTemplate['type'],
    channel: 'WHATSAPP' as MessageTemplate['channel'],
    content: '',
    isActive: true,
    isDefault: false,
    triggerHoursBefore: undefined as number | undefined,
  });
  const [testForm, setTestForm] = useState({
    channel: 'WHATSAPP' as 'WHATSAPP' | 'SMS',
    phoneNumber: '',
  });

  // ==================== DATA LOADING ====================

  const loadSettings = useCallback(async () => {
    try {
      const response = await api.get('/automation/settings');
      setSettings(response.data);
      setEditingSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações.' });
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await api.get('/automation/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar templates.' });
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const response = await api.get('/automation/logs', { params: { limit: 50 } });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error loading logs:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar histórico.' });
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/automation/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar estatísticas.' });
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSettings(), loadTemplates(), loadLogs(), loadStats()]);
    setLoading(false);
  }, [loadSettings, loadTemplates, loadLogs, loadStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== ACTIONS ====================

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/automation/settings', editingSettings);
      setSettings(response.data);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (channel: 'WHATSAPP' | 'SMS') => {
    setSaving(true);
    try {
      await api.post('/automation/send-test', {
        channel,
        phoneNumber: testForm.phoneNumber,
      });
      setMessage({ type: 'success', text: `Mensagem de teste ${channel} enviada!` });
      setShowTestModal(false);
    } catch (error) {
      console.error('Error sending test:', error);
      setMessage({ type: 'error', text: 'Erro ao enviar mensagem de teste.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplates = async () => {
    setSaving(true);
    try {
      await api.post('/automation/templates/defaults');
      await loadTemplates();
      setMessage({ type: 'success', text: 'Templates padrão criados!' });
    } catch (error) {
      console.error('Error creating defaults:', error);
      setMessage({ type: 'error', text: 'Erro ao criar templates padrão.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      if (selectedTemplate) {
        await api.patch(`/automation/templates/${selectedTemplate.id}`, templateForm);
        setMessage({ type: 'success', text: 'Template atualizado!' });
      } else {
        await api.post('/automation/templates', templateForm);
        setMessage({ type: 'success', text: 'Template criado!' });
      }
      await loadTemplates();
      setShowTemplateModal(false);
      resetTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar template.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return;

    try {
      await api.delete(`/automation/templates/${id}`);
      await loadTemplates();
      setMessage({ type: 'success', text: 'Template excluído!' });
    } catch (error) {
      console.error('Error deleting template:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir template.' });
    }
  };

  const handleToggleTemplate = async (template: MessageTemplate) => {
    try {
      await api.patch(`/automation/templates/${template.id}`, {
        isActive: !template.isActive,
      });
      await loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar template.' });
    }
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      channel: template.channel,
      content: template.content,
      isActive: template.isActive,
      isDefault: template.isDefault,
      triggerHoursBefore: template.triggerHoursBefore,
    });
    setShowTemplateModal(true);
  };

  const resetTemplateForm = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      type: 'CUSTOM',
      channel: 'WHATSAPP',
      content: '',
      isActive: true,
      isDefault: false,
      triggerHoursBefore: undefined,
    });
  };

  const insertVariable = (variable: string) => {
    setTemplateForm((prev) => ({
      ...prev,
      content: prev.content + `{{${variable}}}`,
    }));
  };

  // ==================== HELPERS ====================

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: MessageLog['status']) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      SENT: { color: 'bg-blue-100 text-blue-800', label: 'Enviado' },
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Entregue' },
      READ: { color: 'bg-emerald-100 text-emerald-800', label: 'Lido' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Falhou' },
    };
    const badge = badges[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  const getChannelIcon = (channel: 'WHATSAPP' | 'SMS' | 'BOTH') => {
    if (channel === 'WHATSAPP') return <MessageSquare className="w-4 h-4 text-green-500" />;
    if (channel === 'SMS') return <Phone className="w-4 h-4 text-blue-500" />;
    return <Smartphone className="w-4 h-4 text-purple-500" />;
  };

  const getTypeIcon = (type: MessageTemplate['type']) => {
    const icons = {
      APPOINTMENT_REMINDER: <Clock className="w-4 h-4" />,
      APPOINTMENT_CONFIRMATION: <CheckCircle className="w-4 h-4" />,
      BIRTHDAY: <Gift className="w-4 h-4" />,
      WELCOME: <Star className="w-4 h-4" />,
      REVIEW_REQUEST: <Star className="w-4 h-4" />,
      CUSTOM: <FileText className="w-4 h-4" />,
    };
    return icons[type];
  };

  const getTypeLabel = (type: MessageTemplate['type']) => {
    const labels = {
      APPOINTMENT_REMINDER: 'Lembrete',
      APPOINTMENT_CONFIRMATION: 'Confirmação',
      BIRTHDAY: 'Aniversário',
      WELCOME: 'Boas-vindas',
      REVIEW_REQUEST: 'Avaliação',
      CUSTOM: 'Personalizado',
    };
    return labels[type];
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automacao de Mensagens</h1>
          <p className="text-gray-600">Configure WhatsApp e SMS automaticos</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Toast Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'settings', label: 'Configuracoes', icon: Settings },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'logs', label: 'Historico', icon: Clock },
            { id: 'stats', label: 'Estatisticas', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Business</h3>
                  <p className="text-sm text-gray-500">Mensagens via WhatsApp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.whatsappEnabled || false}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, whatsappEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {editingSettings.whatsappEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  {settings.whatsappConnected ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" /> Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" /> Nao conectado
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provedor</label>
                  <select
                    value={editingSettings.whatsappProvider || 'META'}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({
                        ...prev,
                        whatsappProvider: e.target.value as 'META' | 'TWILIO' | 'ZENVIA',
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="META">Meta Business API</option>
                    <option value="TWILIO">Twilio</option>
                    <option value="ZENVIA">Zenvia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Token</label>
                  <input
                    type="password"
                    placeholder="**********************"
                    onChange={(e) =>
                      setEditingSettings((prev) => ({ ...prev, whatsappApiKey: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    placeholder="Ex: 123456789"
                    onChange={(e) =>
                      setEditingSettings((prev) => ({ ...prev, whatsappPhoneNumberId: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setTestForm({ channel: 'WHATSAPP', phoneNumber: '' });
                    setShowTestModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
                >
                  <TestTube className="w-4 h-4" />
                  Testar Conexao
                </button>
              </div>
            )}
          </div>

          {/* SMS Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SMS</h3>
                  <p className="text-sm text-gray-500">Mensagens de texto</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.smsEnabled || false}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, smsEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {editingSettings.smsEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  {settings.smsConnected ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" /> Conectado
                      {settings.smsBalance !== undefined && (
                        <span className="ml-2 text-gray-500">
                          Saldo: R$ {settings.smsBalance.toFixed(2)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" /> Nao conectado
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provedor</label>
                  <select
                    value={editingSettings.smsProvider || 'TWILIO'}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({
                        ...prev,
                        smsProvider: e.target.value as 'TWILIO' | 'ZENVIA' | 'AWS_SNS',
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="TWILIO">Twilio</option>
                    <option value="ZENVIA">Zenvia</option>
                    <option value="AWS_SNS">AWS SNS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account SID</label>
                  <input
                    type="text"
                    placeholder="Ex: AC123..."
                    onChange={(e) =>
                      setEditingSettings((prev) => ({ ...prev, smsAccountSid: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auth Token / API Key</label>
                  <input
                    type="password"
                    placeholder="**********************"
                    onChange={(e) =>
                      setEditingSettings((prev) => ({ ...prev, smsApiKey: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setTestForm({ channel: 'SMS', phoneNumber: '' });
                    setShowTestModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <TestTube className="w-4 h-4" />
                  Testar Conexao
                </button>
              </div>
            )}
          </div>

          {/* Reminder Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lembretes de Agendamento</h3>
                  <p className="text-sm text-gray-500">Lembrar clientes antes do horario</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.reminderEnabled ?? true}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, reminderEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {(editingSettings.reminderEnabled ?? true) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas de antecedencia
                </label>
                <input
                  type="number"
                  value={editingSettings.reminderHoursBefore ?? 24}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({
                      ...prev,
                      reminderHoursBefore: parseInt(e.target.value),
                    }))
                  }
                  min={1}
                  max={168}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}
          </div>

          {/* Confirmation Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Confirmacao de Presenca</h3>
                  <p className="text-sm text-gray-500">Solicitar confirmacao do cliente</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.confirmationEnabled ?? true}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, confirmationEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {(editingSettings.confirmationEnabled ?? true) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas de antecedencia
                </label>
                <input
                  type="number"
                  value={editingSettings.confirmationHoursBefore ?? 48}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({
                      ...prev,
                      confirmationHoursBefore: parseInt(e.target.value),
                    }))
                  }
                  min={1}
                  max={168}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}
          </div>

          {/* Birthday Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Gift className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aniversarios</h3>
                  <p className="text-sm text-gray-500">Parabens automaticos</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.birthdayEnabled ?? true}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, birthdayEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {(editingSettings.birthdayEnabled ?? true) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario de envio</label>
                  <input
                    type="time"
                    value={editingSettings.birthdayTime ?? '09:00'}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({ ...prev, birthdayTime: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto (%) - Opcional
                  </label>
                  <input
                    type="number"
                    value={editingSettings.birthdayDiscountPercent ?? ''}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({
                        ...prev,
                        birthdayDiscountPercent: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    min={0}
                    max={100}
                    placeholder="Ex: 10"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Review Request Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Solicitacao de Avaliacao</h3>
                  <p className="text-sm text-gray-500">Pedir feedback apos atendimento</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSettings.reviewRequestEnabled ?? false}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({ ...prev, reviewRequestEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {(editingSettings.reviewRequestEnabled ?? false) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas apos atendimento
                </label>
                <input
                  type="number"
                  value={editingSettings.reviewRequestHoursAfter ?? 2}
                  onChange={(e) =>
                    setEditingSettings((prev) => ({
                      ...prev,
                      reviewRequestHoursAfter: parseInt(e.target.value),
                    }))
                  }
                  min={1}
                  max={168}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Configuracoes
            </button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Templates de Mensagens</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTemplates}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Zap className="w-4 h-4" />
                Criar Padrao
              </button>
              <button
                onClick={() => {
                  resetTemplateForm();
                  setShowTemplateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <Plus className="w-4 h-4" />
                Novo Template
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  !template.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(template.type)}
                    <span className="font-medium text-gray-900">{template.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getChannelIcon(template.channel)}
                    {template.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Padrao
                      </span>
                    )}
                  </div>
                </div>

                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mb-3">
                  {getTypeLabel(template.type)}
                </span>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>

                <div className="flex items-center justify-between border-t pt-3">
                  <button
                    onClick={() => handleToggleTemplate(template)}
                    className={`text-sm ${template.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {template.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum template criado.</p>
                <p className="text-sm">Clique em "Criar Padrao" para comecar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Historico de Mensagens</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{getChannelIcon(log.channel)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.phoneNumber}</td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.sentAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedTemplate(null);
                          setShowLogsModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma mensagem enviada ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500 mb-1">Total Enviadas</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSent}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500 mb-1">Entregues</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalDelivered}</div>
              <div className="text-xs text-gray-400">{stats.deliveryRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500 mb-1">Lidas</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRead}</div>
              <div className="text-xs text-gray-400">{stats.readRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm text-gray-500 mb-1">Falharam</div>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
            </div>
          </div>

          {/* By Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                WhatsApp
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enviadas</span>
                  <span className="font-medium">{stats.byChannel.whatsapp.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entregues</span>
                  <span className="font-medium text-green-600">{stats.byChannel.whatsapp.delivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lidas</span>
                  <span className="font-medium text-blue-600">{stats.byChannel.whatsapp.read}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Falhas</span>
                  <span className="font-medium text-red-600">{stats.byChannel.whatsapp.failed}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                SMS
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enviados</span>
                  <span className="font-medium">{stats.byChannel.sms.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entregues</span>
                  <span className="font-medium text-green-600">{stats.byChannel.sms.delivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Custo Total</span>
                  <span className="font-medium">R$ {stats.byChannel.sms.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Falhas</span>
                  <span className="font-medium text-red-600">{stats.byChannel.sms.failed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* By Type */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Por Tipo de Mensagem</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold text-amber-600">{stats.byType.reminder}</div>
                <div className="text-sm text-gray-500">Lembretes</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                <div className="text-2xl font-bold text-emerald-600">{stats.byType.confirmation}</div>
                <div className="text-sm text-gray-500">Confirmacoes</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <Gift className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                <div className="text-2xl font-bold text-pink-600">{stats.byType.birthday}</div>
                <div className="text-sm text-gray-500">Aniversarios</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.byType.custom}</div>
                <div className="text-sm text-gray-500">Personalizadas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedTemplate ? 'Editar Template' : 'Novo Template'}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Lembrete 24h"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={templateForm.type}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({ ...prev, type: e.target.value as MessageTemplate['type'] }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="APPOINTMENT_REMINDER">Lembrete de Agendamento</option>
                    <option value="APPOINTMENT_CONFIRMATION">Confirmacao de Presenca</option>
                    <option value="BIRTHDAY">Aniversario</option>
                    <option value="WELCOME">Boas-vindas</option>
                    <option value="REVIEW_REQUEST">Solicitacao de Avaliacao</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        channel: e.target.value as MessageTemplate['channel'],
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="BOTH">Ambos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteudo</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  placeholder="Digite sua mensagem..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Variaveis:</span>
                  {['nome', 'data', 'horario', 'servico', 'profissional', 'salonNome'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {(templateForm.type === 'APPOINTMENT_REMINDER' ||
                templateForm.type === 'APPOINTMENT_CONFIRMATION') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas de antecedencia
                  </label>
                  <input
                    type="number"
                    value={templateForm.triggerHoursBefore ?? ''}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        triggerHoursBefore: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    min={1}
                    max={168}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={templateForm.isActive}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Template ativo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={templateForm.isDefault}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Padrao para este tipo</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || !templateForm.name || !templateForm.content}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Testar {testForm.channel}</h2>
              <button onClick={() => setShowTestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Uma mensagem de teste sera enviada para o numero informado.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Telefone</label>
                <input
                  type="tel"
                  value={testForm.phoneNumber}
                  onChange={(e) => setTestForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleTestConnection(testForm.channel)}
                disabled={saving || !testForm.phoneNumber}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Teste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
