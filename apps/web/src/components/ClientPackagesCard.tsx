import { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Package,
  History,
  X,
  Loader2,
  Calendar,
  Scissors,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface ServiceBalance {
  id: number;
  serviceId: number;
  serviceName: string;
  servicePrice: string;
  totalSessions: number;
  remainingSessions: number;
}

interface ClientPackage {
  id: number;
  packageId: number;
  packageName: string;
  remainingSessions: number;
  expirationDate: string;
  active: boolean;
  balances: ServiceBalance[];
  createdAt: string;
}

interface PackageUsage {
  id: number;
  serviceId: number;
  serviceName?: string;
  status: string;
  consumedAt: string;
  revertedAt?: string;
  notes?: string;
}

interface ClientPackagesCardProps {
  clientId: string;
  clientName?: string;
  compact?: boolean;
}

export function ClientPackagesCard({ clientId, clientName, compact = false }: ClientPackagesCardProps) {
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [usageHistory, setUsageHistory] = useState<PackageUsage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/client-packages/client/${clientId}/active`);
      setPackages(response.data);
    } catch (err) {
      console.error('Error loading packages:', err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const loadUsageHistory = async (packageId: number) => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/client-packages/${packageId}/history`);
      setUsageHistory(response.data);
      setShowHistory(true);
    } catch (err) {
      console.error('Error loading history:', err);
      setUsageHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    );
  }

  // No packages
  if (packages.length === 0) {
    if (compact) {
      return (
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Package className="h-4 w-4" />
          Sem pacotes ativos
        </span>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Nenhum pacote ativo</p>
            <p className="text-xs text-gray-400">Cliente pode adquirir pacotes de sessões</p>
          </div>
        </div>
      </div>
    );
  }

  // Compact version - just show total sessions
  if (compact) {
    const totalSessions = packages.reduce((sum, pkg) => sum + pkg.remainingSessions, 0);
    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <Gift className="h-3 w-3 inline mr-1" />
          {totalSessions} sessões
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm opacity-80">{clientName || 'Cliente'}</div>
              <div className="font-semibold">Pacotes Ativos</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {packages.reduce((sum, pkg) => sum + pkg.remainingSessions, 0)}
            </div>
            <div className="text-xs opacity-80">sessões totais</div>
          </div>
        </div>

        {/* Package List */}
        <div className="space-y-2">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{pkg.packageName}</span>
                <button
                  onClick={() => loadUsageHistory(pkg.id)}
                  className="p-1 hover:bg-white/20 rounded"
                  title="Ver histórico"
                >
                  <History className="h-4 w-4" />
                </button>
              </div>

              {/* Expiration warning */}
              {isExpiringSoon(pkg.expirationDate) && (
                <div className="flex items-center gap-1 text-amber-200 text-xs mb-2">
                  <AlertTriangle className="h-3 w-3" />
                  Expira em {format(new Date(pkg.expirationDate), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}

              {/* Service balances */}
              <div className="space-y-1">
                {pkg.balances.map((balance) => (
                  <div
                    key={balance.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Scissors className="h-3 w-3 opacity-70" />
                      <span className="opacity-90">{balance.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${balance.remainingSessions === 1 ? 'text-amber-200' : ''}`}>
                        {balance.remainingSessions}
                      </span>
                      <span className="opacity-70">/ {balance.totalSessions}</span>
                      {balance.remainingSessions === 1 && (
                        <AlertTriangle className="h-3 w-3 text-amber-200" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Expiration date */}
              <div className="flex items-center gap-1 text-xs opacity-70 mt-2 pt-2 border-t border-white/20">
                <Calendar className="h-3 w-3" />
                Válido até {format(new Date(pkg.expirationDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Histórico de Uso</h3>
              <button onClick={() => setShowHistory(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : usageHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum uso registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        usage.status === 'REVERTED' ? 'bg-amber-50' : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          usage.status === 'REVERTED'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {usage.status === 'REVERTED' ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {usage.serviceName || `Serviço #${usage.serviceId}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(usage.consumedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        {usage.status === 'REVERTED' && usage.revertedAt && (
                          <div className="text-xs text-amber-600">
                            Revertido em {format(new Date(usage.revertedAt), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        )}
                        {usage.notes && (
                          <div className="text-xs text-gray-400 mt-1">{usage.notes}</div>
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          usage.status === 'REVERTED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {usage.status === 'REVERTED' ? 'Revertido' : 'Consumido'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClientPackagesCard;
