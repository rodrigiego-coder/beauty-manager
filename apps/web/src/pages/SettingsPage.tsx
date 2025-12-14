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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type TabType = 'salao' | 'pagamentos' | 'notificacoes' | 'aparencia';

interface SalonData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
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

  useEffect(() => {
    loadSalonData();
  }, []);

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
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar dados do salao' });
    } finally {
      setIsLoading(false);
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

  const tabs = [
    { id: 'salao' as TabType, label: 'Salao', icon: Building2 },
    { id: 'pagamentos' as TabType, label: 'Pagamentos', icon: Wallet },
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