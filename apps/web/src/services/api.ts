import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// INTERCEPTOR PARA RENOVAR TOKEN AUTOMATICAMENTE
// ============================================

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor de resposta - trata erro 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Se já está renovando, adiciona na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('beauty_manager_refresh_token');

      if (!refreshToken) {
        // Sem refresh token - redireciona para login
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Tenta renovar o token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Salva novos tokens
        localStorage.setItem('beauty_manager_access_token', data.accessToken);
        localStorage.setItem('beauty_manager_refresh_token', data.refreshToken);

        // Atualiza header padrão
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

        // Processa fila de requisições que falharam
        processQueue(null, data.accessToken);

        // Refaz a requisição original
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou - faz logout
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// FUNÇÕES AUXILIARES (mantidas)
// ============================================

export interface Client {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  aiActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  response: string | null;
  aiActive: boolean;
  toolCalls?: unknown[];
}

// Busca status do cliente
export async function getClientStatus(phone: string): Promise<Client | null> {
  try {
    const { data } = await api.get(`/clients/${phone}`);
    return data;
  } catch {
    return null;
  }
}

// Toggle AI status
export async function toggleAiStatus(phone: string): Promise<Client> {
  const { data } = await api.patch(`/clients/${phone}/toggle-ai`);
  return data;
}

// Envia mensagem de teste
export async function sendMessage(phone: string, message: string): Promise<MessageResponse> {
  const { data } = await api.post('/ai/message', { phone, message });
  return data;
}

export default api;