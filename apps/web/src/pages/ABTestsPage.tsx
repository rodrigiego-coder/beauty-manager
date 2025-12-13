import { useState, useEffect } from 'react';
import { Plus, Beaker, Play, Pause, Square, Trash2, BarChart2, Trophy, X } from 'lucide-react';
import api from '../services/api';

interface ABTest {
  id: string;
  name: string;
  type: string;
  status: string;
  variantA: Record<string, any>;
  variantB: Record<string, any>;
  variantAViews: number;
  variantAConversions: number;
  variantBViews: number;
  variantBConversions: number;
  variantAConversionRate: number;
  variantBConversionRate: number;
  winningVariant: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

interface ABTestStats {
  totalTests: number;
  runningTests: number;
  completedTests: number;
  pausedTests: number;
  draftTests: number;
  totalViews: number;
  totalConversions: number;
  overallConversionRate: number;
}

const TEST_TYPES = [
  { value: 'MESSAGE', label: 'Mensagem', icon: '💬' },
  { value: 'OFFER', label: 'Oferta', icon: '🎁' },
  { value: 'DISCOUNT', label: 'Desconto', icon: '💰' },
  { value: 'TIMING', label: 'Horario', icon: '⏰' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  RUNNING: 'Em Execucao',
  PAUSED: 'Pausado',
  COMPLETED: 'Finalizado',
};

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [stats, setStats] = useState<ABTestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<ABTest | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'MESSAGE',
    variantA: { message: '', discount: 0 },
    variantB: { message: '', discount: 0 },
  });

  useEffect(() => {
    fetchTests();
    fetchStats();
  }, [filterStatus, filterType]);

  const fetchTests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('testType', filterType);
      const { data } = await api.get(`/ab-tests?${params}`);
      setTests(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/ab-tests/stats');
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatisticas:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        variantA: formData.variantA,
        variantB: formData.variantB,
      };
      await api.post('/ab-tests', payload);
      setShowModal(false);
      resetForm();
      fetchTests();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleAction = async (testId: string, action: 'start' | 'pause' | 'complete') => {
    try {
      const { data } = await api.post(`/ab-tests/${testId}/${action}`);
      fetchTests();
      fetchStats();
      if (showDetailModal?.id === testId) {
        setShowDetailModal(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este teste?')) return;
    try {
      await api.delete(`/ab-tests/${id}`);
      fetchTests();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'MESSAGE', variantA: { message: '', discount: 0 }, variantB: { message: '', discount: 0 } });
  };

  const getTestTypeIcon = (type: string) => TEST_TYPES.find(t => t.value === type)?.icon || '🧪';

  const getTotalViews = (test: ABTest) => test.variantAViews + test.variantBViews;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testes A/B</h1>
          <p className="mt-1 text-sm text-gray-500">Teste diferentes abordagens e otimize suas conversoes</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
          <Plus className="h-5 w-5 mr-2" />Novo Teste
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><Beaker className="h-8 w-8 text-green-600" /><div className="ml-3"><p className="text-sm text-gray-500">Em Execucao</p><p className="text-xl font-semibold">{stats.runningTests}</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><Trophy className="h-8 w-8 text-blue-600" /><div className="ml-3"><p className="text-sm text-gray-500">Finalizados</p><p className="text-xl font-semibold">{stats.completedTests}</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><BarChart2 className="h-8 w-8 text-purple-600" /><div className="ml-3"><p className="text-sm text-gray-500">Taxa de Conversao</p><p className="text-xl font-semibold">{stats.overallConversionRate.toFixed(1)}%</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><BarChart2 className="h-8 w-8 text-yellow-600" /><div className="ml-3"><p className="text-sm text-gray-500">Total Views</p><p className="text-xl font-semibold">{stats.totalViews}</p></div></div></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              <option value="DRAFT">Rascunho</option>
              <option value="RUNNING">Em Execucao</option>
              <option value="PAUSED">Pausados</option>
              <option value="COMPLETED">Finalizados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Teste</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              {TEST_TYPES.map(t => (<option key={t.value} value={t.value}>{t.icon} {t.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => {
          const bestVariant = test.variantAConversionRate >= test.variantBConversionRate ? 'A' : 'B';
          return (
            <div key={test.id} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetailModal(test)}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getTestTypeIcon(test.type)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500">{TEST_TYPES.find(t => t.value === test.type)?.label}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[test.status]}`}>{STATUS_LABELS[test.status]}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">Variante A</div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${bestVariant === 'A' && getTotalViews(test) > 0 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${test.variantAConversionRate}%` }} />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-right">{test.variantAConversionRate.toFixed(1)}%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">Variante B</div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${bestVariant === 'B' && getTotalViews(test) > 0 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${test.variantBConversionRate}%` }} />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-right">{test.variantBConversionRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <span>{getTotalViews(test)} visualizacoes</span>
                  {test.winningVariant && <span className="flex items-center text-green-600"><Trophy className="h-4 w-4 mr-1" />Variante {test.winningVariant}</span>}
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                {test.status === 'DRAFT' && <button onClick={() => handleAction(test.id, 'start')} className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"><Play className="h-4 w-4 mr-1" />Iniciar</button>}
                {test.status === 'RUNNING' && (
                  <>
                    <button onClick={() => handleAction(test.id, 'pause')} className="inline-flex items-center px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800"><Pause className="h-4 w-4 mr-1" />Pausar</button>
                    <button onClick={() => handleAction(test.id, 'complete')} className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"><Square className="h-4 w-4 mr-1" />Finalizar</button>
                  </>
                )}
                {test.status === 'PAUSED' && (
                  <>
                    <button onClick={() => handleAction(test.id, 'start')} className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"><Play className="h-4 w-4 mr-1" />Retomar</button>
                    <button onClick={() => handleAction(test.id, 'complete')} className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"><Square className="h-4 w-4 mr-1" />Finalizar</button>
                  </>
                )}
                {(test.status === 'DRAFT' || test.status === 'COMPLETED') && <button onClick={() => handleDelete(test.id)} className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 mr-1" />Excluir</button>}
              </div>
            </div>
          );
        })}
        {tests.length === 0 && <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-gray-500">Nenhum teste encontrado. Crie seu primeiro teste A/B!</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Novo Teste A/B</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Teste</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Teste</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                    {TEST_TYPES.map(t => (<option key={t.value} value={t.value}>{t.icon} {t.label}</option>))}
                  </select>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Variante A (Controle)</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600">Mensagem</label>
                      <input type="text" value={formData.variantA.message || ''} onChange={(e) => setFormData({ ...formData, variantA: { ...formData.variantA, message: e.target.value } })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Desconto (%)</label>
                      <input type="number" value={formData.variantA.discount || 0} onChange={(e) => setFormData({ ...formData, variantA: { ...formData.variantA, discount: parseFloat(e.target.value) || 0 } })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" min="0" max="100" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-md bg-purple-50">
                  <h4 className="font-medium text-gray-900 mb-3">Variante B (Teste)</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600">Mensagem</label>
                      <input type="text" value={formData.variantB.message || ''} onChange={(e) => setFormData({ ...formData, variantB: { ...formData.variantB, message: e.target.value } })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Desconto (%)</label>
                      <input type="number" value={formData.variantB.discount || 0} onChange={(e) => setFormData({ ...formData, variantB: { ...formData.variantB, discount: parseFloat(e.target.value) || 0 } })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" min="0" max="100" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700">Criar Teste</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(null)} />
            <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getTestTypeIcon(showDetailModal.type)}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{showDetailModal.name}</h3>
                    <p className="text-sm text-gray-500">{TEST_TYPES.find(t => t.value === showDetailModal.type)?.label}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[showDetailModal.status]}`}>{STATUS_LABELS[showDetailModal.status]}</span>
                  <span className="text-sm text-gray-500">{getTotalViews(showDetailModal)} visualizacoes</span>
                </div>

                <div className="space-y-4">
                  {['A', 'B'].map(variant => {
                    const isA = variant === 'A';
                    const views = isA ? showDetailModal.variantAViews : showDetailModal.variantBViews;
                    const conversions = isA ? showDetailModal.variantAConversions : showDetailModal.variantBConversions;
                    const rate = isA ? showDetailModal.variantAConversionRate : showDetailModal.variantBConversionRate;
                    const isWinner = showDetailModal.winningVariant === variant || (showDetailModal.status !== 'COMPLETED' && variant === (showDetailModal.variantAConversionRate >= showDetailModal.variantBConversionRate ? 'A' : 'B') && getTotalViews(showDetailModal) > 0);

                    return (
                      <div key={variant} className={`p-4 rounded-lg border-2 ${isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">Variante {variant}</span>
                            {isWinner && <Trophy className="h-5 w-5 text-green-600 ml-2" />}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div><p className="text-2xl font-bold text-gray-900">{views}</p><p className="text-xs text-gray-500">Views</p></div>
                          <div><p className="text-2xl font-bold text-gray-900">{conversions}</p><p className="text-xs text-gray-500">Conversoes</p></div>
                          <div><p className="text-2xl font-bold text-green-600">{rate.toFixed(1)}%</p><p className="text-xs text-gray-500">Taxa</p></div>
                        </div>
                        <div className="mt-3">
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${isWinner ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${rate}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showDetailModal.winningVariant && (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-medium text-green-800">Vencedor: Variante {showDetailModal.winningVariant}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
