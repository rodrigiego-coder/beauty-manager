import { useEffect, useState } from 'react';

interface SupportModeData {
  active: boolean;
  salonId: string;
  salonName: string;
  expiresAt: string;
}

/**
 * Banner de Modo Suporte
 * Exibido quando o SUPER_ADMIN está acessando um salão em modo delegado
 */
export function SupportModeBanner() {
  const [supportMode, setSupportMode] = useState<SupportModeData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const checkSupportMode = () => {
      const stored = localStorage.getItem('supportMode');
      if (stored) {
        try {
          const mode: SupportModeData = JSON.parse(stored);
          const expiresAt = new Date(mode.expiresAt);

          // Verifica se ainda é válido
          if (expiresAt > new Date()) {
            setSupportMode(mode);
          } else {
            // Expirou - limpar e sair
            handleExit();
          }
        } catch {
          localStorage.removeItem('supportMode');
        }
      } else {
        setSupportMode(null);
      }
    };

    checkSupportMode();

    // Verificar a cada segundo para atualizar tempo restante
    const interval = setInterval(checkSupportMode, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (supportMode) {
      const updateTimeLeft = () => {
        const expiresAt = new Date(supportMode.expiresAt);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) {
          handleExit();
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [supportMode]);

  const handleExit = () => {
    // Restaurar token original
    const backupToken = localStorage.getItem('accessToken_backup');
    if (backupToken) {
      localStorage.setItem('accessToken', backupToken);
      localStorage.removeItem('accessToken_backup');
    } else {
      localStorage.removeItem('accessToken');
    }

    // Limpar modo suporte
    localStorage.removeItem('supportMode');
    setSupportMode(null);

    // Redirecionar para login ou admin
    window.location.href = '/admin';
  };

  if (!supportMode?.active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 px-4 z-50 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <span className="font-bold bg-yellow-600 text-white px-2 py-1 rounded text-sm">
          MODO SUPORTE
        </span>
        <span className="font-medium">
          Acessando: <strong>{supportMode.salonName}</strong>
        </span>
        <span className="text-yellow-800 text-sm">
          Expira em: <strong>{timeLeft}</strong>
        </span>
      </div>
      <button
        onClick={handleExit}
        className="px-4 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800 transition-colors font-medium"
      >
        Sair do Modo Suporte
      </button>
    </div>
  );
}
