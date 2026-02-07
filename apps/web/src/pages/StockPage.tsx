import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Layers,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Store,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────
interface StockSummaryItem {
  id: number;
  name: string;
  unit: string;
  kind: string;
  isRetail: boolean;
  isBackbar: boolean;
  stockRetail: number;
  stockInternal: number;
  minStockRetail: number;
  minStockInternal: number;
  costPrice: string;
  salePrice: string;
  isLowRetail: boolean;
  isLowInternal: boolean;
  isLowStock: boolean;
}

interface StockMovement {
  id: string;
  productId: number;
  productName: string;
  delta: number;
  locationType: 'RETAIL' | 'INTERNAL';
  movementType: string;
  referenceType: string | null;
  referenceId: string | null;
  transferGroupId: string | null;
  movementGroupId: string | null;
  reason: string | null;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
}

interface MovementsResponse {
  data: StockMovement[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  SALE: 'Venda',
  SERVICE_CONSUMPTION: 'Consumo',
  PURCHASE: 'Compra',
  TRANSFER: 'Transferencia',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolucao',
  CANCELED: 'Cancelamento',
};

const LOCATION_LABELS: Record<string, string> = {
  RETAIL: 'Loja',
  INTERNAL: 'Salao',
};

function formatDateTimeSP(isoString: string): string {
  try {
    return format(new Date(isoString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return isoString;
  }
}

function todaySP(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function thirtyDaysAgoSP(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function exportMovementsCsv(movements: StockMovement[]) {
  const header = 'Data/Hora;Produto;Tipo;Local;Qtd;Motivo;Grupo';
  const rows = movements.map((m) =>
    [
      formatDateTimeSP(m.createdAt),
      `"${m.productName}"`,
      MOVEMENT_TYPE_LABELS[m.movementType] || m.movementType,
      LOCATION_LABELS[m.locationType] || m.locationType,
      m.delta,
      `"${(m.reason || '').replace(/"/g, '""')}"`,
      m.movementGroupId || '',
    ].join(';'),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `movimentacoes-estoque-${todaySP()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────
type TabKey = 'summary' | 'movements';

export function StockPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {([
            { key: 'summary' as TabKey, label: 'Resumo' },
            { key: 'movements' as TabKey, label: 'Movimentacoes' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'summary' && <SummaryTab />}
      {activeTab === 'movements' && <MovementsTab />}
    </div>
  );
}

// ─── Summary Tab ─────────────────────────────────────────────────────
function SummaryTab() {
  const [data, setData] = useState<StockSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<'' | 'RETAIL' | 'INTERNAL'>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (location) params.location = location;
      if (search.trim()) params.search = search.trim();
      if (lowStockOnly) params.lowStock = 'true';

      const res = await api.get('/stock/summary', { params });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar resumo de estoque');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [location, search, lowStockOnly]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos os locais</option>
          <option value="RETAIL">Loja</option>
          <option value="INTERNAL">Salao</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Apenas baixo estoque
        </label>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data.length && (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}

      {/* Table */}
      {data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <Store className="h-3.5 w-3.5" />
                      Loja
                    </div>
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <Warehouse className="h-3.5 w-3.5" />
                      Salao
                    </div>
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{p.name}</span>
                        {p.kind === 'KIT' && (
                          <span className="inline-flex items-center gap-0.5 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            <Layers className="h-3 w-3" />
                            KIT
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{p.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.isRetail ? (
                        <div>
                          <span className={`font-semibold ${p.isLowRetail ? 'text-red-600' : 'text-gray-900'}`}>
                            {p.stockRetail}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ min {p.minStockRetail}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.isBackbar ? (
                        <div>
                          <span className={`font-semibold ${p.isLowInternal ? 'text-red-600' : 'text-gray-900'}`}>
                            {p.stockInternal}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ min {p.minStockInternal}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {data.length} produto(s)
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Movements Tab ───────────────────────────────────────────────────
function MovementsTab() {
  const [data, setData] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<'' | 'RETAIL' | 'INTERNAL'>('');
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgoSP());
  const [dateTo, setDateTo] = useState(todaySP());
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      if (location) params.location = location;
      if (type) params.type = type;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<MovementsResponse>('/stock/movements', { params });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar movimentacoes');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, location, type, dateFrom, dateTo, offset]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [search, location, type, dateFrom, dateTo]);

  // Group movements by movementGroupId
  const { groups, ungrouped } = groupMovements(data);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Buscar produto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">De</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ate</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Local</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="RETAIL">Loja</option>
            <option value="INTERNAL">Salao</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="SALE">Venda</option>
            <option value="SERVICE_CONSUMPTION">Consumo</option>
            <option value="PURCHASE">Compra</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="ADJUSTMENT">Ajuste</option>
            <option value="RETURN">Devolucao</option>
            <option value="CANCELED">Cancelamento</option>
          </select>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {data.length > 0 && (
          <button
            onClick={() => exportMovementsCsv(data)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar CSV com filtros atuais"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data.length && (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhuma movimentacao encontrada</p>
        </div>
      )}

      {/* Movements list */}
      {data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data/Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Local</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Qtd</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Motivo</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Grupo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Grouped movements */}
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.groupId);
                  const totalDelta = group.items.reduce((sum, m) => sum + m.delta, 0);
                  const firstItem = group.items[0];
                  return (
                    <GroupRows
                      key={group.groupId}
                      groupId={group.groupId}
                      items={group.items}
                      isExpanded={isExpanded}
                      totalDelta={totalDelta}
                      firstItem={firstItem}
                      onToggle={toggleGroup}
                    />
                  );
                })}

                {/* Ungrouped movements */}
                {ungrouped.map((m) => (
                  <MovementRow key={m.id} movement={m} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {total} movimentacao(es) | Pagina {currentPage} de {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Anterior
              </button>
              <button
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Proxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Movement Row ────────────────────────────────────────────────────
function MovementRow({ movement: m }: { movement: StockMovement }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
        {formatDateTimeSP(m.createdAt)}
      </td>
      <td className="px-4 py-2.5 font-medium text-gray-900">{m.productName}</td>
      <td className="px-4 py-2.5 text-center">
        <MovementTypeBadge type={m.movementType} />
      </td>
      <td className="px-4 py-2.5 text-center">
        <LocationBadge location={m.locationType} />
      </td>
      <td className="px-4 py-2.5 text-center">
        <DeltaBadge delta={m.delta} />
      </td>
      <td className="px-4 py-2.5 text-gray-500 max-w-[200px] truncate" title={m.reason || ''}>
        {m.reason || '-'}
      </td>
      <td className="px-4 py-2.5 text-center">
        {m.movementGroupId ? <GroupIdChip groupId={m.movementGroupId} /> : <span className="text-xs text-gray-300">-</span>}
      </td>
    </tr>
  );
}

// ─── Group Rows ──────────────────────────────────────────────────────
function GroupRows({
  groupId,
  items,
  isExpanded,
  totalDelta,
  firstItem,
  onToggle,
}: {
  groupId: string;
  items: StockMovement[];
  isExpanded: boolean;
  totalDelta: number;
  firstItem: StockMovement;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      {/* Group header row */}
      <tr
        className="bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
        onClick={() => onToggle(groupId)}
      >
        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-purple-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-purple-500" />
            )}
            {formatDateTimeSP(firstItem.createdAt)}
          </div>
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              Grupo ({items.length} itens)
            </span>
          </div>
        </td>
        <td className="px-4 py-2.5 text-center">
          <MovementTypeBadge type={firstItem.movementType} />
        </td>
        <td className="px-4 py-2.5 text-center">
          <LocationBadge location={firstItem.locationType} />
        </td>
        <td className="px-4 py-2.5 text-center">
          <DeltaBadge delta={totalDelta} />
        </td>
        <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-[180px]" title={firstItem.reason || ''}>
          {firstItem.reason || '-'}
        </td>
        <td className="px-4 py-2.5 text-center">
          <GroupIdChip groupId={groupId} />
        </td>
      </tr>

      {/* Expanded children */}
      {isExpanded &&
        items.map((m) => (
          <tr key={m.id} className="bg-purple-50/50 hover:bg-purple-50 transition-colors">
            <td className="pl-10 pr-4 py-2 text-gray-500 text-xs whitespace-nowrap">
              {formatDateTimeSP(m.createdAt)}
            </td>
            <td className="px-4 py-2 text-gray-700 text-xs">{m.productName}</td>
            <td className="px-4 py-2 text-center">
              <MovementTypeBadge type={m.movementType} />
            </td>
            <td className="px-4 py-2 text-center">
              <LocationBadge location={m.locationType} />
            </td>
            <td className="px-4 py-2 text-center">
              <DeltaBadge delta={m.delta} />
            </td>
            <td className="px-4 py-2 text-gray-400 text-xs truncate max-w-[180px]" title={m.reason || ''}>
              {m.reason || '-'}
            </td>
            <td className="px-4 py-2 text-center text-gray-300 text-xs">-</td>
          </tr>
        ))}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────
function MovementTypeBadge({ type }: { type: string }) {
  const label = MOVEMENT_TYPE_LABELS[type] || type;
  const colors: Record<string, string> = {
    SALE: 'bg-blue-100 text-blue-700',
    SERVICE_CONSUMPTION: 'bg-orange-100 text-orange-700',
    PURCHASE: 'bg-green-100 text-green-700',
    TRANSFER: 'bg-yellow-100 text-yellow-700',
    ADJUSTMENT: 'bg-gray-100 text-gray-700',
    RETURN: 'bg-teal-100 text-teal-700',
    CANCELED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function LocationBadge({ location }: { location: string }) {
  const isRetail = location === 'RETAIL';
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      isRetail ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {isRetail ? <Store className="h-3 w-3" /> : <Warehouse className="h-3 w-3" />}
      {LOCATION_LABELS[location] || location}
    </span>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700">
        <TrendingUp className="h-3.5 w-3.5" />
        +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-700">
        <TrendingDown className="h-3.5 w-3.5" />
        {delta}
      </span>
    );
  }
  return <span className="text-xs text-gray-400">0</span>;
}

// ─── GroupId Chip (copy-to-clipboard) ────────────────────────────────
function GroupIdChip({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(groupId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copiar: ${groupId}`}
      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
    >
      <span className="font-mono">{groupId.slice(0, 8)}</span>
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ─── Grouping helper ─────────────────────────────────────────────────
function groupMovements(movements: StockMovement[]) {
  const groupMap = new Map<string, StockMovement[]>();
  const ungrouped: StockMovement[] = [];

  for (const m of movements) {
    if (m.movementGroupId) {
      const existing = groupMap.get(m.movementGroupId);
      if (existing) {
        existing.push(m);
      } else {
        groupMap.set(m.movementGroupId, [m]);
      }
    } else {
      ungrouped.push(m);
    }
  }

  const groups = Array.from(groupMap.entries()).map(([groupId, items]) => ({
    groupId,
    items,
  }));

  return { groups, ungrouped };
}

export default StockPage;
