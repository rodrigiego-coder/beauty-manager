import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { notifyRetryStart, notifyRetryEnd } from '../utils/apiRetryEvents';

// Base URL: em produção usa relativo /api (same-origin), em dev usa localhost:3000
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const baseURL = isDev
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CONFIGURAÇÃO DE RETRY PARA 503 "STARTING"
// ============================================
const RETRY_MAX_ATTEMPTS = 6;
const RETRY_DEFAULT_DELAY = 5000; // 5 segundos (default do Retry-After)

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retry?: boolean;
}

/**
 * Verifica se o erro 503 indica que a API está reiniciando
 */
function isApiStarting(error: AxiosError): boolean {
  if (error.response?.status !== 503) return false;

  try {
    const data = error.response.data as { status?: string; service?: string };
    return data?.status === 'starting';
  } catch {
    // Se não conseguir ler o body, assume que é um 503 genérico
    // e tenta retry se tiver header Retry-After
    return !!error.response.headers?.['retry-after'];
  }
}

/**
 * Extrai o tempo de retry do header Retry-After ou usa default
 */
function getRetryDelay(error: AxiosError): number {
  const retryAfter = error.response?.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return seconds * 1000;
    }
  }
  return RETRY_DEFAULT_DELAY;
}

/**
 * Aguarda o tempo especificado
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// INTERCEPTOR DE REQUEST - ADICIONA TOKEN AUTOMATICAMENTE
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('beauty_manager_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Interceptor de resposta - trata erros 503 (retry) e 401 (refresh token)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    // ============================================
    // RETRY AUTOMÁTICO PARA 503 "STARTING"
    // ============================================
    if (isApiStarting(error) && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;

      if (retryCount < RETRY_MAX_ATTEMPTS) {
        const delayMs = getRetryDelay(error);
        const nextAttempt = retryCount + 1;

        // Notifica UI sobre retry
        notifyRetryStart(nextAttempt, RETRY_MAX_ATTEMPTS, delayMs / 1000);

        // Aguarda antes de tentar novamente
        await sleep(delayMs);

        // Marca tentativa e refaz requisição
        originalRequest._retryCount = nextAttempt;

        try {
          const response = await api(originalRequest);
          // Sucesso - notifica fim do retry
          notifyRetryEnd();
          return response;
        } catch (retryError) {
          // Se ainda for 503, o interceptor será chamado novamente
          // Se for outro erro, propaga normalmente
          if (!isApiStarting(retryError as AxiosError)) {
            notifyRetryEnd();
          }
          throw retryError;
        }
      } else {
        // Excedeu tentativas - notifica e falha
        notifyRetryEnd();
        const customError = new Error(
          'O sistema está em manutenção. Por favor, aguarde alguns instantes e tente novamente.'
        );
        (customError as any).originalError = error;
        return Promise.reject(customError);
      }
    }

    // ============================================
    // REFRESH TOKEN PARA 401
    // ============================================

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
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
        // Tenta renovar o token (usa mesmo baseURL)
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
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

// ============================================
// API DE RECEITAS
// ============================================

import type {
  ServiceRecipe,
  SaveRecipeDto,
  BackbarProduct,
} from '../types/recipe';

/**
 * Busca a receita ativa de um serviço
 */
export async function getServiceRecipe(
  serviceId: number
): Promise<ServiceRecipe | null> {
  try {
    const { data } = await api.get(`/services/${serviceId}/recipe`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Busca histórico de receitas de um serviço
 */
export async function getServiceRecipeHistory(
  serviceId: number
): Promise<ServiceRecipe[]> {
  const { data } = await api.get(`/services/${serviceId}/recipe/history`);
  return data;
}

/**
 * Salva receita de um serviço (cria nova versão se existir)
 */
export async function saveServiceRecipe(
  serviceId: number,
  recipeData: SaveRecipeDto
): Promise<ServiceRecipe> {
  const { data } = await api.put(`/services/${serviceId}/recipe`, recipeData);
  return data;
}

/**
 * Arquiva receita ativa de um serviço
 */
export async function deleteServiceRecipe(serviceId: number): Promise<void> {
  await api.delete(`/services/${serviceId}/recipe`);
}

/**
 * Busca produtos disponíveis para receita (apenas backbar)
 */
export async function getBackbarProducts(): Promise<BackbarProduct[]> {
  const { data } = await api.get('/products', {
    params: {
      backbarOnly: 'true',
    },
  });
  return data;
}

// ============================================
// API DE TRIAGEM (PRÉ-AVALIAÇÃO)
// ============================================

import type {
  TriagePublicResponse,
  TriageAnswer,
  TriageSubmitResult,
} from '../types/triage';

/**
 * Busca formulário público de triagem por token
 * Não requer autenticação
 */
export async function getTriagePublicForm(token: string): Promise<TriagePublicResponse> {
  try {
    const { data } = await axios.get(
      `${baseURL}/triage/public/${token}`
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { error: 'Formulário não encontrado ou link inválido' };
    }
    throw error;
  }
}

/**
 * Submete respostas de triagem via token público
 * Não requer autenticação
 */
export async function submitTriageAnswers(
  token: string,
  answers: TriageAnswer[],
  consentAccepted: boolean
): Promise<TriageSubmitResult> {
  const { data } = await axios.post(
    `${baseURL}/triage/public/${token}/submit`,
    { answers, consentAccepted }
  );
  return data;
}

/**
 * Busca triagem de um agendamento (autenticado)
 */
export async function getTriageForAppointment(appointmentId: string): Promise<any> {
  try {
    const { data } = await api.get(`/triage/appointment/${appointmentId}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export default api;