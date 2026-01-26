/**
 * =====================================================
 * TOKEN MANAGER (ALFA P0)
 * Gerenciamento de tokens com single-flight refresh
 * e refresh preventivo para evitar 401 intermitente
 * =====================================================
 */

import axios from 'axios';

// =====================================================
// CONSTANTS
// =====================================================

const ACCESS_TOKEN_KEY = 'beauty_manager_access_token';
const REFRESH_TOKEN_KEY = 'beauty_manager_refresh_token';
const USER_KEY = 'beauty_manager_user';

// Tempo minimo de validade antes de refresh preventivo (segundos)
const MIN_TTL_SECONDS = 60;

// Base URL para refresh (mesmo do api.ts)
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const baseURL = isDev
  ? (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api')
  : '/api';

// =====================================================
// DEBUG
// =====================================================

function debugLog(message: string, ...args: unknown[]): void {
  if (typeof window !== 'undefined' && localStorage.getItem('BM_AUTH_DEBUG') === '1') {
    console.log(`[TokenManager] ${message}`, ...args);
  }
}

// =====================================================
// TOKEN STORAGE
// =====================================================

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  debugLog('Tokens saved');
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  debugLog('Tokens cleared');
}

// =====================================================
// JWT DECODE (exp only, no validation)
// =====================================================

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
}

/**
 * Decodifica payload do JWT (sem validar assinatura)
 * Retorna exp em milliseconds ou null se invalido
 */
export function decodeTokenExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64url decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded) as JwtPayload;

    if (typeof parsed.exp === 'number') {
      return parsed.exp * 1000; // Convert to milliseconds
    }
    return null;
  } catch {
    debugLog('Failed to decode token exp');
    return null;
  }
}

/**
 * Retorna tempo restante em segundos ate expiracao
 * Retorna 0 se token invalido ou expirado
 */
export function getTokenTtlSeconds(token: string | null): number {
  if (!token) return 0;
  const expMs = decodeTokenExp(token);
  if (!expMs) return 0;
  const remainingMs = expMs - Date.now();
  return Math.max(0, Math.floor(remainingMs / 1000));
}

// =====================================================
// SINGLE-FLIGHT REFRESH
// =====================================================

let refreshInFlight: Promise<string> | null = null;

/**
 * Executa refresh do access token com single-flight
 * Se ja houver refresh em andamento, aguarda e retorna o resultado
 * Usa axios diretamente (nao passa pelo interceptor de 401)
 */
export async function refreshAccessToken(): Promise<string> {
  // Se ja tem refresh em andamento, aguarda
  if (refreshInFlight) {
    debugLog('Refresh already in flight, waiting...');
    return refreshInFlight;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    debugLog('No refresh token available');
    throw new Error('No refresh token');
  }

  debugLog('Starting token refresh');

  // Cria promise de refresh
  refreshInFlight = (async () => {
    try {
      // Usa axios diretamente para evitar interceptor de 401
      const { data } = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken = data.accessToken as string;
      const newRefreshToken = data.refreshToken as string;

      setTokens(newAccessToken, newRefreshToken);
      debugLog('Token refresh successful');

      return newAccessToken;
    } catch (error) {
      debugLog('Token refresh failed', error);
      // Refresh falhou - limpa tokens
      clearTokens();
      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// =====================================================
// MAIN API: GET VALID ACCESS TOKEN
// =====================================================

export interface GetValidTokenOptions {
  minTtlSec?: number;
}

/**
 * Retorna access token valido
 * Se token expira em menos de minTtlSec, faz refresh preventivo
 *
 * @param options.minTtlSec Tempo minimo de validade em segundos (default: 60)
 * @returns Access token valido ou null se nao autenticado
 * @throws Se refresh falhar
 */
export async function getValidAccessToken(
  options: GetValidTokenOptions = {}
): Promise<string | null> {
  const minTtlSec = options.minTtlSec ?? MIN_TTL_SECONDS;

  const currentToken = getAccessToken();
  if (!currentToken) {
    debugLog('No access token');
    return null;
  }

  const ttl = getTokenTtlSeconds(currentToken);
  debugLog(`Token TTL: ${ttl}s, minTtl: ${minTtlSec}s`);

  if (ttl > minTtlSec) {
    // Token ainda valido por tempo suficiente
    return currentToken;
  }

  // Token expirando em breve - fazer refresh preventivo
  debugLog('Token expiring soon, refreshing preemptively');

  try {
    return await refreshAccessToken();
  } catch {
    // Se refresh falhar, retorna token atual (pode ainda funcionar)
    // O interceptor de 401 vai tratar se realmente expirou
    debugLog('Preemptive refresh failed, using current token');
    return currentToken;
  }
}

/**
 * Verifica se esta autenticado (tem access token)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Verifica se refresh esta em andamento
 */
export function isRefreshingToken(): boolean {
  return refreshInFlight !== null;
}
