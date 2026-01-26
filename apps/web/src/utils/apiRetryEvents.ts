/**
 * Sistema de eventos para comunicar status de retry 503 entre
 * o interceptor axios e componentes de UI.
 *
 * GOLF: Adicionado contador global para evitar flicker com múltiplas requests.
 * Debug mode via localStorage.BM_API_RETRY_DEBUG="1"
 */

export interface ApiRetryState {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  retryAfter: number;
  activeRetries: number;
}

const API_RETRY_EVENT = 'api:retry:status';

// =====================================================
// CONTADOR GLOBAL DE RETRIES EM VÔO (GOLF)
// =====================================================
let retryInFlight = 0;
let currentAttempt = 0;
let currentMaxAttempts = 0;
let currentRetryAfter = 0;

/**
 * Debug log condicional
 */
function debugLog(message: string, ...args: unknown[]): void {
  if (typeof window !== 'undefined' && localStorage.getItem('BM_API_RETRY_DEBUG') === '1') {
    console.log(`[ApiRetry] ${message}`, ...args);
  }
}

/**
 * Emite evento de status de retry
 */
export function emitRetryStatus(state: ApiRetryState): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent<ApiRetryState>(API_RETRY_EVENT, {
    detail: state,
  });
  window.dispatchEvent(event);
}

/**
 * Escuta eventos de status de retry
 */
export function onRetryStatus(callback: (state: ApiRetryState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ApiRetryState>;
    callback(customEvent.detail);
  };

  window.addEventListener(API_RETRY_EVENT, handler);

  return () => {
    window.removeEventListener(API_RETRY_EVENT, handler);
  };
}

/**
 * Incrementa contador e notifica início de retry
 * GOLF: Apenas emite se for o primeiro retry ou se houver atualização de tentativa
 */
export function notifyRetryStart(attempt: number, maxAttempts: number, retryAfter: number): void {
  retryInFlight++;
  currentAttempt = Math.max(currentAttempt, attempt);
  currentMaxAttempts = maxAttempts;
  currentRetryAfter = retryAfter;

  debugLog('start', { endpoint: 'request', attempt, retryAfter, activeRetries: retryInFlight });

  emitRetryStatus({
    isRetrying: true,
    attempt: currentAttempt,
    maxAttempts: currentMaxAttempts,
    retryAfter: currentRetryAfter,
    activeRetries: retryInFlight,
  });
}

/**
 * Decrementa contador e notifica fim de retry apenas quando todas terminarem
 * GOLF: Evita flicker - só emite isRetrying=false quando retryInFlight chega a 0
 */
export function notifyRetryEnd(success: boolean): void {
  retryInFlight = Math.max(0, retryInFlight - 1);

  debugLog('end', { success, activeRetries: retryInFlight });

  if (retryInFlight === 0) {
    // Reset estado quando todas as requests terminarem
    currentAttempt = 0;
    currentMaxAttempts = 0;
    currentRetryAfter = 0;

    emitRetryStatus({
      isRetrying: false,
      attempt: 0,
      maxAttempts: 0,
      retryAfter: 0,
      activeRetries: 0,
    });
  } else {
    // Ainda há retries em andamento, emite estado atualizado
    emitRetryStatus({
      isRetrying: true,
      attempt: currentAttempt,
      maxAttempts: currentMaxAttempts,
      retryAfter: currentRetryAfter,
      activeRetries: retryInFlight,
    });
  }
}

/**
 * Retorna quantos retries estão em andamento
 */
export function getActiveRetries(): number {
  return retryInFlight;
}
