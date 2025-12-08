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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message: string;
}

const ACCESS_TOKEN_KEY = 'beauty_manager_access_token';
const REFRESH_TOKEN_KEY = 'beauty_manager_refresh_token';
const USER_KEY = 'beauty_manager_user';

export const authService = {
  /**
   * Realiza login do usuario via API
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

    // Salva no localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    // Configura o header de autorizacao para futuras requisicoes
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

    return data;
  },

  /**
   * Realiza logout do usuario - invalida o token no backend
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    // Tenta invalidar o token no backend
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Mesmo se falhar, continua com logout local
        console.warn('Erro ao invalidar token no servidor:', error);
      }
    }

    // Limpa dados locais
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) return null;

    try {
      const { data } = await api.post<LoginResponse>('/auth/refresh', { refreshToken });
      
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      return data.accessToken;
    } catch {
      // Token expirado ou inválido - faz logout
      this.logoutLocal();
      return null;
    }
  },

  /**
   * Logout apenas local (sem chamar API)
   */
  logoutLocal(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      return user;
    } catch {
      return null;
    }
  },

  /**
   * Retorna o access token armazenado
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Retorna o refresh token armazenado
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Verifica se o usuario esta autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  },
};