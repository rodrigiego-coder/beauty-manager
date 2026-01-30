import api from './api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  refreshAccessToken,
  isAuthenticated as tokenIsAuthenticated,
} from '../lib/auth/tokenManager';

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

export interface SignupRequest {
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  planId?: string;
}

export interface SignupResponse extends LoginResponse {
  salon: {
    id: string;
    name: string;
    slug: string;
  };
  subscription: {
    id: string;
    status: string;
    trialEndsAt: string;
  };
}

const USER_KEY = 'beauty_manager_user';

export const authService = {
  /**
   * Cadastro público de novo salão (signup)
   */
  async signup(request: SignupRequest): Promise<SignupResponse> {
    const { data } = await api.post<SignupResponse>('/auth/signup', request);

    // Salva tokens via tokenManager (login automático após signup)
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  },

  /**
   * Realiza login do usuario via API
   * ALFA: usa tokenManager para salvar tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

    // Salva tokens via tokenManager (centralizado)
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  },

  /**
   * Realiza logout do usuario - invalida o token no backend
   * ALFA: usa tokenManager para limpar tokens
   */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    // Tenta invalidar o token no backend
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Mesmo se falhar, continua com logout local
        console.warn('Erro ao invalidar token no servidor:', error);
      }
    }

    // Limpa dados locais via tokenManager (centralizado)
    clearTokens();
  },

  /**
   * Renova o access token usando o refresh token
   * ALFA: delega para tokenManager (single-flight)
   */
  async refreshToken(): Promise<string | null> {
    if (!getRefreshToken()) return null;

    try {
      return await refreshAccessToken();
    } catch {
      // Token expirado ou inválido - faz logout
      this.logoutLocal();
      return null;
    }
  },

  /**
   * Logout apenas local (sem chamar API)
   * ALFA: usa tokenManager
   */
  logoutLocal(): void {
    clearTokens();
  },

  /**
   * Retorna o usuario armazenado no localStorage
   * ALFA: não precisa mais setar header (request interceptor faz)
   */
  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Retorna o access token armazenado
   * ALFA: delega para tokenManager
   */
  getAccessToken(): string | null {
    return getAccessToken();
  },

  /**
   * Retorna o refresh token armazenado
   * ALFA: delega para tokenManager
   */
  getRefreshToken(): string | null {
    return getRefreshToken();
  },

  /**
   * Verifica se o usuario esta autenticado
   * ALFA: usa tokenManager para check de token
   */
  isAuthenticated(): boolean {
    return tokenIsAuthenticated() && !!this.getStoredUser();
  },
};