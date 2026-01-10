import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Bell,
  Palette,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Wallet,
  ChevronRight,
  Calendar,
  Globe,
  Link as LinkIcon,
  Clock,
  DollarSign,
  XCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type TabType = 'salao' | 'pagamentos' | 'agendamento' | 'notificacoes' | 'aparencia';

interface SalonData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  slug?: string;
}

type OperationMode = 'SECRETARY_ONLY' | 'SECRETARY_AND_ONLINE' | 'SECRETARY_WITH_LINK';
type DepositType = 'NONE' | 'FIXED' | 'PERCENTAGE';
type DepositAppliesTo = 'ALL' | 'NEW_CLIENTS' | 'SPECIFIC_SERVICES' | 'SELECTED_CLIENTS';

interface OnlineBookingSettings {
  enabled: boolean;
  operationMode: OperationMode;
  slug: string;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  slotIntervalMinutes: number;
  allowSameDayBooking: boolean;
  holdDurationMinutes: number;
  requirePhoneVerification: boolean;
  depositType: DepositType;
  depositValue: number;
  depositAppliesTo: DepositAppliesTo;
  cancellationHours: number;
  cancellationPolicy: string;
  allowRescheduling: boolean;
  maxReschedules: number;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('salao');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [salonData, setSalonData] = useState<SalonData>({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
  });

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailMarketing: false,
    smsReminders: true,
    pushNotifications: true,
  });

  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('pink');

  const [bookingSettings, setBookingSettings] = useState<OnlineBookingSettings>({
    enabled: false,
    operationMode: 'SECRETARY_ONLY',
    slug: '',
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    slotIntervalMinutes: 30,
    allowSameDayBooking: true,
    holdDurationMinutes: 10,
    requirePhoneVerification: true,
    depositType: 'NONE',
    depositValue: 0,
    depositAppliesTo: 'ALL',
    cancellationHours: 24,
    cancellationPolicy: '',
    allowRescheduling: true,
    maxReschedules: 2,
  });
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  useEffect(() => {
    loadSalonData();
  }, []);

  useEffect(() => {
    if (activeTab === 'agendamento') {
      loadBookingSettings();
    }
  }, [activeTab]);

  const loadSalonData = async () => {
    try {
      const { data } = await api.get('/salons/my');
      setSalonData({
        id: data.id,
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        taxId: data.taxId || '',
        slug: data.slug || '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar dados do salao' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingSettings = async () => {
    setIsLoadingBooking(true);
    try {
      const { data } = await api.get('/online-booking/settings');
      setBookingSettings({
        enabled: data.enabled ?? false,
        operationMode: data.operationMode || 'SECRETARY_ONLY',
        slug: data.slug || salonData.slug || '',
        minAdvanceHours: data.minAdvanceHours ?? 2,
        maxAdvanceDays: data.maxAdvanceDays ?? 30,
        slotIntervalMinutes: data.slotIntervalMinutes ?? 30,
        allowSameDayBooking: data.allowSameDayBooking ?? true,
        holdDurationMinutes: data.holdDurationMinutes ?? 10,
        requirePhoneVerification: data.requirePhoneVerification ?? true,
        depositType: data.depositType || 'NONE',
        depositValue: data.depositValue ?? 0,
        depositAppliesTo: data.depositAppliesTo || 'ALL',
        cancellationHours: data.cancellationHours ?? 24,
        cancellationPolicy: data.cancellationPolicy || '',
        allowRescheduling: data.allowRescheduling ?? true,
        maxReschedules: data.maxReschedules ?? 2,
      });
    } catch (error) {
      // Se nao existe ainda, usa valores padrao
      console.log('Settings not found, using defaults');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const handleSaveSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await api.patch('/salons/my', {
        name: salonData.name,
        address: salonData.address,
        phone: salonData.phone,
        email: salonData.email,
        taxId: salonData.taxId,
      });
      setMessage({ type: 'success', text: 'Configuracoes salvas com sucesso!' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao salvar configuracoes';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    setMessage({ type: 'success', text: 'Preferencias de notificacao salvas!' });
  };

  const handleSaveAppearance = () => {
    setMessage({ type: 'success', text: 'Preferencias de aparencia salvas!' });
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  };

  const handleGenerateSlug = () => {
    if (salonData.name) {
      setBookingSettings({ ...bookingSettings, slug: generateSlug(salonData.name) });
    }
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/agendar/${bookingSettings.slug}`;
    navigator.clipboard.writeText(link);
    setMessage({ type: 'success', text: 'Link copiado para a area de transferencia!' });
  };

  const handleSaveBookingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBooking(true);
    setMessage(null);

    try {
      await api.put('/online-booking/settings', bookingSettings);
      setMessage({ type: 'success', text: 'Configuracoes de agendamento online salvas!' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao salvar configuracoes';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSavingBooking(false);
    }
  };

  const tabs = [
    { id: 'salao' as TabType, label: 'Salao', icon: Building2 },
    { id: 'pagamentos' as TabType, label: 'Pagamentos', icon: Wallet },
    { id: 'agendamento' as TabType, label: 'Agendamento Online', icon: Calendar },
    { id: 'notificacoes' as TabType, label: 'Notificacoes', icon: Bell },
    { id: 'aparencia' as TabType, label: 'Aparencia', icon: Palette },
  ];

  const canEdit = user?.role === 'OWNER' || user?.role === 'MANAGER';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-gray-500 mt-1">Gerencie as configuracoes do seu salao</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'salao' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Dados do Salao</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {canEdit ? 'Gerencie as informacoes do seu estabelecimento' : 'Visualize as informacoes do estabelecimento'}
                </p>
              </div>

              <form onSubmit={handleSaveSalon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Salao</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={salonData.name}
                        onChange={(e) => setSalonData({ ...salonData, name: e.target.value })}
                        disabled={!canEdit}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={salonData.address}
                        onChange={(e) => setSalonData({ ...salonData, address: e.target.value })}
                        disabled={!canEdit}
                        placeholder="Rua, numero, bairro, cidade - UF"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={salonData.phone}
                        onChange={(e) => setSalonData({ ...salonData, phone: e.target.value })}
                        disabled={!canEdit}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={salonData.email}
                        onChange={(e) => setSalonData({ ...salonData, email: e.target.value })}
                        disabled={!canEdit}
                        placeholder="contato@salao.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={salonData.taxId}
                        onChange={(e) => setSalonData({ ...salonData, taxId: e.target.value })}
                        disabled={!canEdit}
                        placeholder="00.000.000/0000-00"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                )}

                {!canEdit && (
                  <p className="mt-4 text-sm text-gray-500">
                    Apenas proprietarios e gerentes podem editar estas informacoes.
                  </p>
                )}
              </form>
            </div>
          )}

          {activeTab === 'pagamentos' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configuracoes de Pagamento</h2>
                <p className="text-sm text-gray-500 mt-1">Configure formas de pagamento e destinos do dinheiro</p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/configuracoes/formas-pagamento"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Formas de Pagamento</p>
                      <p className="text-sm text-gray-500">Configure as formas de pagamento aceitas (Dinheiro, PIX, Cartao, etc)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>

                <Link
                  to="/configuracoes/destinos-pagamento"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Destinos de Pagamento</p>
                      <p className="text-sm text-gray-500">Configure para onde o dinheiro vai (Banco, Maquininha, Caixa)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'agendamento' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Agendamento Online</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure como seus clientes podem agendar online
                </p>
              </div>

              {isLoadingBooking ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : (
                <form onSubmit={handleSaveBookingSettings} className="space-y-8">
                  {/* Secao 1: Ativar/Desativar */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Agendamento Online Ativo</p>
                          <p className="text-sm text-gray-500">Permitir que clientes agendem pela internet</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingSettings({ ...bookingSettings, enabled: !bookingSettings.enabled })}
                        className={`w-12 h-6 rounded-full transition-colors ${bookingSettings.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${bookingSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Secao 2: Modo de Operacao */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Modo de Operacao</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${bookingSettings.operationMode === 'SECRETARY_ONLY' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="operationMode"
                          value="SECRETARY_ONLY"
                          checked={bookingSettings.operationMode === 'SECRETARY_ONLY'}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, operationMode: e.target.value as OperationMode })}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Apenas Secretaria</p>
                          <p className="text-sm text-gray-500">Agendamentos sao feitos apenas pela equipe do salao</p>
                        </div>
                      </label>
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${bookingSettings.operationMode === 'SECRETARY_AND_ONLINE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="operationMode"
                          value="SECRETARY_AND_ONLINE"
                          checked={bookingSettings.operationMode === 'SECRETARY_AND_ONLINE'}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, operationMode: e.target.value as OperationMode })}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Secretaria + Online Publico</p>
                          <p className="text-sm text-gray-500">Clientes podem agendar por um link publico</p>
                        </div>
                      </label>
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${bookingSettings.operationMode === 'SECRETARY_WITH_LINK' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="operationMode"
                          value="SECRETARY_WITH_LINK"
                          checked={bookingSettings.operationMode === 'SECRETARY_WITH_LINK'}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, operationMode: e.target.value as OperationMode })}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Secretaria + Link Privado</p>
                          <p className="text-sm text-gray-500">Link enviado apenas para clientes selecionados</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Secao 3: Slug e Link */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Link de Agendamento</h3>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Slug personalizado</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={bookingSettings.slug}
                            onChange={(e) => setBookingSettings({ ...bookingSettings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            placeholder="meu-salao"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Gerar do nome do salao"
                        >
                          <RefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Link: <span className="font-mono text-primary-600">{window.location.origin}/agendar/{bookingSettings.slug || 'seu-slug'}</span>
                        {bookingSettings.slug && (
                          <button
                            type="button"
                            onClick={copyBookingLink}
                            className="ml-2 text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="w-4 h-4 inline" />
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Secao 4: Configuracoes de Agendamento */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Configuracoes de Agendamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Antecedencia minima (horas)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            value={bookingSettings.minAdvanceHours}
                            onChange={(e) => setBookingSettings({ ...bookingSettings, minAdvanceHours: parseInt(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Maximo de dias para agendar</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            min="1"
                            value={bookingSettings.maxAdvanceDays}
                            onChange={(e) => setBookingSettings({ ...bookingSettings, maxAdvanceDays: parseInt(e.target.value) || 30 })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Intervalo entre horarios (min)</label>
                        <select
                          value={bookingSettings.slotIntervalMinutes}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, slotIntervalMinutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="15">15 minutos</option>
                          <option value="30">30 minutos</option>
                          <option value="60">60 minutos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tempo de reserva (min)</label>
                        <select
                          value={bookingSettings.holdDurationMinutes}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, holdDurationMinutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="5">5 minutos</option>
                          <option value="10">10 minutos</option>
                          <option value="15">15 minutos</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Permitir agendamento no mesmo dia</p>
                        <p className="text-sm text-gray-500">Clientes podem agendar para hoje</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingSettings({ ...bookingSettings, allowSameDayBooking: !bookingSettings.allowSameDayBooking })}
                        className={`w-12 h-6 rounded-full transition-colors ${bookingSettings.allowSameDayBooking ? 'bg-primary-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${bookingSettings.allowSameDayBooking ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Verificacao de telefone</p>
                        <p className="text-sm text-gray-500">Exigir codigo OTP via WhatsApp</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingSettings({ ...bookingSettings, requirePhoneVerification: !bookingSettings.requirePhoneVerification })}
                        className={`w-12 h-6 rounded-full transition-colors ${bookingSettings.requirePhoneVerification ? 'bg-primary-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${bookingSettings.requirePhoneVerification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Secao 5: Sinal/Taxa */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Sinal / Taxa de Agendamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tipo de cobranca</label>
                        <select
                          value={bookingSettings.depositType}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, depositType: e.target.value as DepositType })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="NONE">Nenhuma</option>
                          <option value="FIXED">Valor fixo</option>
                          <option value="PERCENTAGE">Porcentagem</option>
                        </select>
                      </div>
                      {bookingSettings.depositType !== 'NONE' && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            {bookingSettings.depositType === 'FIXED' ? 'Valor (R$)' : 'Porcentagem (%)'}
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              min="0"
                              step={bookingSettings.depositType === 'PERCENTAGE' ? '1' : '0.01'}
                              value={bookingSettings.depositValue}
                              onChange={(e) => setBookingSettings({ ...bookingSettings, depositValue: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {bookingSettings.depositType !== 'NONE' && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Aplica-se a</label>
                        <select
                          value={bookingSettings.depositAppliesTo}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, depositAppliesTo: e.target.value as DepositAppliesTo })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="ALL">Todos os agendamentos</option>
                          <option value="NEW_CLIENTS">Apenas novos clientes</option>
                          <option value="SPECIFIC_SERVICES">Servicos especificos</option>
                          <option value="SELECTED_CLIENTS">Clientes selecionados manualmente</option>
                        </select>
                        {bookingSettings.depositAppliesTo === 'SELECTED_CLIENTS' && (
                          <p className="mt-2 text-sm text-gray-500">
                            Configure quais clientes precisam pagar taxa na{' '}
                            <Link to="/clientes" className="text-primary-600 hover:text-primary-700 font-medium">
                              pagina de Clientes
                            </Link>
                            , editando cada cliente e marcando "Exigir pagamento antecipado".
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Secao 6: Cancelamento e Reagendamento */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Cancelamento e Reagendamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Cancelamento ate (horas antes)</label>
                        <div className="relative">
                          <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            value={bookingSettings.cancellationHours}
                            onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationHours: parseInt(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Maximo de reagendamentos</label>
                        <input
                          type="number"
                          min="0"
                          value={bookingSettings.maxReschedules}
                          onChange={(e) => setBookingSettings({ ...bookingSettings, maxReschedules: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Permitir reagendamento</p>
                        <p className="text-sm text-gray-500">Clientes podem remarcar pelo link</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingSettings({ ...bookingSettings, allowRescheduling: !bookingSettings.allowRescheduling })}
                        className={`w-12 h-6 rounded-full transition-colors ${bookingSettings.allowRescheduling ? 'bg-primary-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${bookingSettings.allowRescheduling ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Politica de cancelamento (opcional)</label>
                      <textarea
                        value={bookingSettings.cancellationPolicy}
                        onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationPolicy: e.target.value })}
                        placeholder="Descreva a politica de cancelamento que sera exibida ao cliente..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      type="submit"
                      disabled={isSavingBooking}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {isSavingBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSavingBooking ? 'Salvando...' : 'Salvar configuracoes'}
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferencias de Notificacoes</h2>
                <p className="text-sm text-gray-500 mt-1">Escolha como deseja receber notificacoes</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Emails de agendamentos</p>
                    <p className="text-sm text-gray-500">Receba confirmacoes e lembretes por email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, emailAppointments: !notifications.emailAppointments })}
                    className={`w-12 h-6 rounded-full transition-colors ${notifications.emailAppointments ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.emailAppointments ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Emails de marketing</p>
                    <p className="text-sm text-gray-500">Receba novidades e promocoes</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, emailMarketing: !notifications.emailMarketing })}
                    className={`w-12 h-6 rounded-full transition-colors ${notifications.emailMarketing ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.emailMarketing ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Lembretes por SMS</p>
                    <p className="text-sm text-gray-500">Receba lembretes de agendamentos por SMS</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, smsReminders: !notifications.smsReminders })}
                    className={`w-12 h-6 rounded-full transition-colors ${notifications.smsReminders ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.smsReminders ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notificacoes push</p>
                    <p className="text-sm text-gray-500">Receba notificacoes no navegador</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                    className={`w-12 h-6 rounded-full transition-colors ${notifications.pushNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar preferencias
              </button>
            </div>
          )}

          {activeTab === 'aparencia' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Aparencia</h2>
                <p className="text-sm text-gray-500 mt-1">Personalize a aparencia do sistema</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 border-2 rounded-xl bg-white ${theme === 'light' ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full h-20 bg-gray-100 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Claro</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 border-2 rounded-xl bg-white ${theme === 'dark' ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full h-20 bg-gray-800 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Escuro</p>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 border-2 rounded-xl bg-white ${theme === 'system' ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full h-20 bg-gradient-to-b from-gray-100 to-gray-800 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Sistema</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Cor principal</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPrimaryColor('pink')}
                      className={`w-10 h-10 bg-pink-500 rounded-full ${primaryColor === 'pink' ? 'ring-2 ring-offset-2 ring-pink-500' : 'hover:ring-2 hover:ring-offset-2 hover:ring-pink-500'}`}
                    />
                    <button
                      onClick={() => setPrimaryColor('blue')}
                      className={`w-10 h-10 bg-blue-500 rounded-full ${primaryColor === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:ring-2 hover:ring-offset-2 hover:ring-blue-500'}`}
                    />
                    <button
                      onClick={() => setPrimaryColor('green')}
                      className={`w-10 h-10 bg-emerald-500 rounded-full ${primaryColor === 'green' ? 'ring-2 ring-offset-2 ring-emerald-500' : 'hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500'}`}
                    />
                    <button
                      onClick={() => setPrimaryColor('purple')}
                      className={`w-10 h-10 bg-purple-500 rounded-full ${primaryColor === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : 'hover:ring-2 hover:ring-offset-2 hover:ring-purple-500'}`}
                    />
                    <button
                      onClick={() => setPrimaryColor('orange')}
                      className={`w-10 h-10 bg-orange-500 rounded-full ${primaryColor === 'orange' ? 'ring-2 ring-offset-2 ring-orange-500' : 'hover:ring-2 hover:ring-offset-2 hover:ring-orange-500'}`}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAppearance}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar preferencias
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}