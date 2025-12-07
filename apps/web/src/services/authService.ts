import api from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
  salonId: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

const TOKEN_KEY = 'beauty_manager_token';
const USER_KEY = 'beauty_manager_user';

// Credenciais de demo para desenvolvimento
const DEMO_CREDENTIALS = {
  email: 'admin@beautymanager.com',
  password: 'admin123',
};

const DEMO_USER: AuthUser = {
  id: '1',
  name: 'Rodrigo Viana',
  email: 'admin@beautymanager.com',
  role: 'OWNER',
  salonId: 'salon-1',
};

export const authService = {
  /**
   * Realiza login do usuario
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Em producao, isso chamaria a API real
    // Por enquanto, valida credenciais de demo
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const token = 'demo_token_' + Date.now();
      const response: LoginResponse = {
        user: DEMO_USER,
        token,
      };

      // Salva no localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      // Configura o header de autorizacao para futuras requisicoes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response;
    }

    // Tenta autenticar via API (quando backend estiver pronto)
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return data;
    } catch {
      throw new Error('Credenciais invalidas');
    }
  },

  /**
   * Realiza logout do usuario
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Retorna o usuario armazenado no localStorage
   */
  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr) as AuthUser;

      // Restaura o token no header
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      return user;
    } catch {
      return null;
    }
  },

  /**
   * Retorna o token armazenado
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Verifica se o usuario esta autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  },
};
