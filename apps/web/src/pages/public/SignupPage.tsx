import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Gift,
} from 'lucide-react';
import { authService, SignupRequest } from '../../services/authService';
import subscriptionService, { SaaSPlan } from '../../services/subscriptionService';

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [form, setForm] = useState<SignupRequest>({
    salonName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    planId: undefined,
  });

  // Load plans on mount
  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await subscriptionService.getPlans();
        setPlans(data);
        // Pre-select Professional plan
        const proPlan = data.find((p) => p.code === 'PROFESSIONAL');
        if (proPlan) {
          setForm((prev) => ({ ...prev, planId: proPlan.id }));
        }
      } catch (err) {
        console.error('Erro ao carregar planos:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format phone (only numbers)
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.salonName.trim()) {
      setError('Nome do salao e obrigatorio');
      return;
    }
    if (!form.ownerName.trim()) {
      setError('Seu nome e obrigatorio');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Email invalido');
      return;
    }
    if (!form.phone || form.phone.length < 10) {
      setError('Telefone invalido (min 10 digitos)');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Senha deve ter no minimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.signup(form);
      // Redirect to dashboard after signup
      navigate('/', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao criar conta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    if (!value) return '';
    if (value.length <= 2) return `(${value}`;
    if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  };

  const selectedPlan = plans.find((p) => p.id === form.planId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Beauty Manager</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crie sua conta</h1>
            <p className="text-gray-600 mt-2">
              Comece seu teste gratuito de 14 dias
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Salon Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome do Salao
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="salonName"
                  value={form.salonName}
                  onChange={handleChange}
                  placeholder="Ex: Studio Maria Beleza"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seu Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formatPhone(form.phone)}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimo 6 caracteres"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

            {/* Plan Selection */}
            {!loadingPlans && plans.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Escolha seu plano
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, planId: plan.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.planId === plan.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">{plan.name}</div>
                      <div className="text-xs text-gray-500">
                        R$ {parseFloat(plan.priceMonthly).toFixed(0)}/mes
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Criar Conta Gratis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Ao criar sua conta, voce concorda com nossos{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Politica de Privacidade
              </a>
            </p>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Ja tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          {/* Trial Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8">
            <Gift className="w-5 h-5" />
            <span className="font-medium">14 dias gratis</span>
          </div>

          {/* Trial Benefits Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Seu trial de 14 dias inclui:
            </h2>

            <div className="space-y-4">
              {[
                'Acesso completo ao sistema',
                '50 confirmacoes WhatsApp para testar',
                '300 atendimentos Alexis para testar',
                'Sem cartao de credito',
                'Cancele quando quiser',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Plan Info */}
          {selectedPlan && (
            <div className="p-6 bg-white/10 rounded-2xl">
              <div className="text-sm text-primary-200 mb-1">Plano selecionado</div>
              <div className="text-2xl font-bold">{selectedPlan.name}</div>
              <div className="text-primary-200 mt-2">
                {selectedPlan.maxUsers} usuarios • {selectedPlan.maxClients} clientes
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-3xl font-bold">
                  R$ {parseFloat(selectedPlan.priceMonthly).toFixed(0)}
                </span>
                <span className="text-primary-200">/mes apos o trial</span>
              </div>
            </div>
          )}

          {/* Transparency note */}
          <p className="text-primary-200 text-sm mt-6 text-center">
            Voce paga so pelo que usar. Sem surpresas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
