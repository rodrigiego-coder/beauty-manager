/**
 * Sistema de eventos para comunicar status de retry 503 entre
 * o interceptor axios e componentes de UI.
 *
 * Usa CustomEvent do browser para desacoplamento.
 */

export interface ApiRetryState {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  retryAfter: number;
}

const API_RETRY_EVENT = 'api:retry:status';

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

  // Retorna função de cleanup
  return () => {
    window.removeEventListener(API_RETRY_EVENT, handler);
  };
}

/**
 * Emite que retry começou
 */
export function notifyRetryStart(attempt: number, maxAttempts: number, retryAfter: number): void {
  emitRetryStatus({
    isRetrying: true,
    attempt,
    maxAttempts,
    retryAfter,
  });
}

/**
 * Emite que retry terminou (sucesso ou falha)
 */
export function notifyRetryEnd(): void {
  emitRetryStatus({
    isRetrying: false,
    attempt: 0,
    maxAttempts: 0,
    retryAfter: 0,
  });
}
