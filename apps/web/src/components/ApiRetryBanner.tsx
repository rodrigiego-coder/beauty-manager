import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { onRetryStatus, ApiRetryState } from '../utils/apiRetryEvents';

/**
 * Banner discreto exibido quando a API está reiniciando (503 "starting")
 * e o sistema está fazendo retry automático.
 */
export function ApiRetryBanner() {
  const [state, setState] = useState<ApiRetryState>({
    isRetrying: false,
    attempt: 0,
    maxAttempts: 0,
    retryAfter: 0,
  });

  useEffect(() => {
    const unsubscribe = onRetryStatus((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  if (!state.isRetrying) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
        <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Atualizando sistema...</p>
          <p className="text-blue-100 text-xs">
            Tentativa {state.attempt} de {state.maxAttempts}
          </p>
        </div>
      </div>
    </div>
  );
}
