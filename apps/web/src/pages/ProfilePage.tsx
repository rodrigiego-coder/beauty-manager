import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle, AlertCircle, Briefcase, Percent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isProfessional: boolean;
  commissionRate: number;
}

export function ProfilePage() {
  const { user: _user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    isProfessional: false,
    commissionRate: 50,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile({
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || '',
        isProfessional: data.isProfessional || false,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) * 100 : 50,
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Atualizar dados básicos
      await api.patch('/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      // Se for OWNER, também atualizar isProfessional via endpoint de usuário
      if (profile.role === 'OWNER') {
        await api.patch(`/users/${profile.id}`, {
          isProfessional: profile.isProfessional,
          commissionRate: profile.commissionRate / 100,
        });
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao atualizar perfil';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas nao conferem' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter no minimo 6 caracteres' });
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.post('/profile/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao alterar senha';
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      OWNER: 'Proprietario',
      MANAGER: 'Gerente',
      RECEPTIONIST: 'Recepcionista',
      STYLIST: 'Profissional',
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <span className="inline-block mt-1 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
              {getRoleLabel(profile.role)}
            </span>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Toggle para OWNER ser profissional */}
          {profile.role === 'OWNER' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Atendimento</h3>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isProfessional}
                  onChange={(e) => setProfile({ ...profile, isProfessional: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Tambem atendo clientes como profissional</span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Voce aparecera na lista de profissionais disponiveis para agendamento
                  </p>
                </div>
              </label>

              {profile.isProfessional && (
                <div className="mt-4 pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Percent className="w-4 h-4 inline mr-1" />
                    Comissao (%)
                  </label>
                  <input
                    type="number"
                    value={profile.commissionRate}
                    onChange={(e) => setProfile({ ...profile, commissionRate: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-500" />
          Alterar Senha
        </h3>

        {passwordMessage && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {passwordMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}