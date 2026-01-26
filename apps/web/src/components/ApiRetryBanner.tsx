import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { onRetryStatus, ApiRetryState } from '../utils/apiRetryEvents';

/**
 * Banner fixo no topo exibido quando a API está reiniciando (503 "starting")
 * e o sistema está fazendo retry automático.
 *
 * GOLF: Melhorias de estabilidade:
 * - Fixed top-0 com z-[9999] para garantir visibilidade
 * - Tempo mínimo de exibição (1200ms) para usuário perceber
 * - Countdown visual do tempo de retry
 * - Não pisca com múltiplas requests concorrentes
 */

const MIN_DISPLAY_TIME_MS = 1200;

export function ApiRetryBanner() {
  const [state, setState] = useState<ApiRetryState>({
    isRetrying: false,
    attempt: 0,
    maxAttempts: 0,
    retryAfter: 0,
    activeRetries: 0,
  });
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = onRetryStatus((newState) => {
      setState(newState);

      if (newState.isRetrying) {
        // Mostrar banner imediatamente
        setVisible(true);
        setCountdown(newState.retryAfter);

        // Limpar timer anterior se existir
        if (showTimerRef.current) {
          clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }

        // Iniciar countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);
      } else {
        // Parar countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        // Manter visível por tempo mínimo antes de esconder
        if (!showTimerRef.current) {
          showTimerRef.current = setTimeout(() => {
            setVisible(false);
            showTimerRef.current = null;
          }, MIN_DISPLAY_TIME_MS);
        }
      }
    });

    return () => {
      unsubscribe();
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
        <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            Atualizando sistema...
          </span>
          <span className="text-blue-100 text-sm">
            (tentativa {state.attempt}/{state.maxAttempts})
          </span>
          {countdown > 0 && (
            <span className="text-blue-200 text-sm">
              — nova tentativa em {countdown}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
