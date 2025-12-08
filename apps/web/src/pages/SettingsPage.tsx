import { useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'perfil' | 'salao' | 'notificacoes' | 'seguranca' | 'aparencia';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // Estados do formulário de perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  // Estados do formulário de salão
  const [salonData, setSalonData] = useState({
    name: 'Salão Demo',
    address: 'Rua Exemplo, 123',
    phone: '(11) 99999-9999',
    openTime: '08:00',
    closeTime: '20:00',
  });

  // Estados do formulário de notificações
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailMarketing: false,
    smsReminders: true,
    pushNotifications: true,
  });

  // Estados do formulário de segurança
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
    { id: 'salao' as TabType, label: 'Salão', icon: Building2 },
    { id: 'notificacoes' as TabType, label: 'Notificações', icon: Bell },
    { id: 'seguranca' as TabType, label: 'Segurança', icon: Shield },
    { id: 'aparencia' as TabType, label: 'Aparência', icon: Palette },
  ];

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'OWNER':
        return 'Proprietário';
      case 'MANAGER':
        return 'Gerente';
      case 'RECEPTIONIST':
        return 'Recepcionista';
      case 'STYLIST':
        return 'Profissional';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      {/* Success message */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Save className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-emerald-800 font-medium">Configurações salvas com sucesso!</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Content area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informações do Perfil</h2>
                <p className="text-sm text-gray-500 mt-1">Atualize suas informações pessoais</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                  <p className="text-sm text-gray-500">{getRoleLabel()}</p>
                  <button className="mt-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                    Alterar foto
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar alterações
              </button>
            </div>
          )}

          {/* Salão */}
          {activeTab === 'salao' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configurações do Salão</h2>
                <p className="text-sm text-gray-500 mt-1">Gerencie as informações do seu estabelecimento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do salão</label>
                  <input
                    type="text"
                    value={salonData.name}
                    onChange={(e) => setSalonData({ ...salonData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={salonData.address}
                    onChange={(e) => setSalonData({ ...salonData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={salonData.phone}
                    onChange={(e) => setSalonData({ ...salonData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abertura</label>
                    <input
                      type="time"
                      value={salonData.openTime}
                      onChange={(e) => setSalonData({ ...salonData, openTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fechamento</label>
                    <input
                      type="time"
                      value={salonData.closeTime}
                      onChange={(e) => setSalonData({ ...salonData, closeTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar alterações
              </button>
            </div>
          )}

          {/* Notificações */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferências de Notificações</h2>
                <p className="text-sm text-gray-500 mt-1">Escolha como deseja receber notificações</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Emails de agendamentos</p>
                    <p className="text-sm text-gray-500">Receba confirmações e lembretes por email</p>
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
                    <p className="text-sm text-gray-500">Receba novidades e promoções</p>
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
                    <p className="font-medium text-gray-900">Notificações push</p>
                    <p className="text-sm text-gray-500">Receba notificações no navegador</p>
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
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar preferências
              </button>
            </div>
          )}

          {/* Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Segurança da Conta</h2>
                <p className="text-sm text-gray-500 mt-1">Altere sua senha e configurações de segurança</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Alterar senha
              </button>
            </div>
          )}

          {/* Aparência */}
          {activeTab === 'aparencia' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Aparência</h2>
                <p className="text-sm text-gray-500 mt-1">Personalize a aparência do sistema</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-primary-500 rounded-xl bg-white">
                      <div className="w-full h-20 bg-gray-100 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Claro</p>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300">
                      <div className="w-full h-20 bg-gray-800 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Escuro</p>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300">
                      <div className="w-full h-20 bg-gradient-to-b from-gray-100 to-gray-800 rounded-lg mb-2" />
                      <p className="text-sm font-medium text-gray-900">Sistema</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Cor principal</label>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 bg-pink-500 rounded-full ring-2 ring-offset-2 ring-pink-500" />
                    <button className="w-10 h-10 bg-blue-500 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-blue-500" />
                    <button className="w-10 h-10 bg-emerald-500 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500" />
                    <button className="w-10 h-10 bg-purple-500 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-purple-500" />
                    <button className="w-10 h-10 bg-orange-500 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-orange-500" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar preferências
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}