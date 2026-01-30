import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { setTokens } from '../lib/auth/tokenManager';

interface ValidateTokenResponse {
  valid: boolean;
  userName?: string;
}

interface CreatePasswordResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    salonId: string;
  };
  accessToken: string;
  refreshToken: string;
  message: string;
}

export function CreatePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Valida o token ao carregar a pagina
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        const { data } = await api.get<ValidateTokenResponse>('/auth/validate-token', {
          params: { token },
        });

        setTokenValid(data.valid);
        if (data.userName) {
          setUserName(data.userName);
        }
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validacoes
    if (password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao conferem');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<CreatePasswordResponse>('/auth/create-password', {
        token,
        password,
      });

      // Salva tokens e usuario
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('beauty_manager_user', JSON.stringify(data.user));

      setSuccess(true);

      // Redireciona apos 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao criar senha. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Estado de carregamento
  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-gray-600">Validando link...</p>
        </div>
      </div>
    );
  }

  // Link invalido ou expirado
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-red-500" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Link invalido ou expirado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Este link de criacao de senha nao e mais valido.
            <br />
            Solicite um novo link ao administrador do salao.
          </p>
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Ir para o login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sucesso ao criar senha
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Senha criada com sucesso!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Redirecionando para o sistema...
          </p>
          <div className="mt-4 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Formulario de criacao de senha
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Criar sua senha
        </h2>
        {userName && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Ola, <span className="font-medium text-gray-700">{userName}</span>!
            <br />
            Defina sua senha para acessar o sistema.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Minimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando senha...
                  </>
                ) : (
                  'Criar senha e entrar'
                )}
              </button>
            </div>
          </form>

          {/* Dicas */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 mb-2">
              Dicas para uma senha segura:
            </p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>Use pelo menos 6 caracteres</li>
              <li>Misture letras e numeros</li>
              <li>Evite dados pessoais obvios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
