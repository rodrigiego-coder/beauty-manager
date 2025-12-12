import { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Crown,
  Star,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Percent,
  Package,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

// Types
interface LoyaltyProgram {
  id: string;
  salonId: string;
  name: string;
  isActive: boolean;
  pointsPerRealService: string;
  pointsPerRealProduct: string;
  pointsExpireDays: number | null;
  minimumRedeemPoints: number;
  welcomePoints: number;
  birthdayPoints: number;
  referralPoints: number;
}

interface LoyaltyTier {
  id: string;
  programId: string;
  name: string;
  code: string;
  minPoints: number;
  color: string;
  icon: string | null;
  benefits: {
    discountPercent?: number;
    priorityBooking?: boolean;
    freeServices?: string[];
    extraBenefits?: string;
  } | null;
  pointsMultiplier: string;
  sortOrder: number;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  type: string;
  pointsCost: number;
  value: string | null;
  productId: number | null;
  serviceId: number | null;
  minTier: string | null;
  maxRedemptionsPerClient: number | null;
  totalAvailable: number | null;
  validDays: number;
  isActive: boolean;
  imageUrl: string | null;
  productName?: string;
  serviceName?: string;
}

interface Service {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

const rewardTypeOptions = [
  { value: 'DISCOUNT_VALUE', label: 'Desconto em Valor (R$)' },
  { value: 'DISCOUNT_PERCENT', label: 'Desconto em Porcentagem (%)' },
  { value: 'FREE_SERVICE', label: 'Serviço Grátis' },
  { value: 'FREE_PRODUCT', label: 'Produto Grátis' },
  { value: 'GIFT', label: 'Brinde' },
];

const tierColors = [
  '#6B7280', '#9CA3AF', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#3B82F6', '#EC4899'
];

export function LoyaltySettingsPage() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [tierModal, setTierModal] = useState<{ open: boolean; tier: LoyaltyTier | null }>({ open: false, tier: null });
  const [rewardModal, setRewardModal] = useState<{ open: boolean; reward: LoyaltyReward | null }>({ open: false, reward: null });

  // Form states
  const [programForm, setProgramForm] = useState({
    name: 'Programa de Fidelidade',
    pointsPerRealService: 1,
    pointsPerRealProduct: 1,
    pointsExpireDays: 0,
    minimumRedeemPoints: 100,
    welcomePoints: 0,
    birthdayPoints: 0,
    referralPoints: 0,
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    code: '',
    minPoints: 0,
    color: '#6B7280',
    icon: '',
    discountPercent: 0,
    priorityBooking: false,
    extraBenefits: '',
    pointsMultiplier: 1,
    sortOrder: 0,
  });

  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'DISCOUNT_VALUE',
    pointsCost: 100,
    value: 0,
    productId: null as number | null,
    serviceId: null as number | null,
    minTier: '',
    maxRedemptionsPerClient: null as number | null,
    totalAvailable: null as number | null,
    validDays: 30,
    imageUrl: '',
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [programRes, tiersRes, rewardsRes, servicesRes, productsRes] = await Promise.all([
        api.get('/loyalty/program').catch(() => ({ data: null })),
        api.get('/loyalty/tiers').catch(() => ({ data: [] })),
        api.get('/loyalty/rewards').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ]);

      if (programRes.data) {
        setProgram(programRes.data);
        setProgramForm({
          name: programRes.data.name,
          pointsPerRealService: parseFloat(programRes.data.pointsPerRealService),
          pointsPerRealProduct: parseFloat(programRes.data.pointsPerRealProduct),
          pointsExpireDays: programRes.data.pointsExpireDays || 0,
          minimumRedeemPoints: programRes.data.minimumRedeemPoints,
          welcomePoints: programRes.data.welcomePoints,
          birthdayPoints: programRes.data.birthdayPoints,
          referralPoints: programRes.data.referralPoints,
        });
      }

      setTiers(tiersRes.data || []);
      setRewards(rewardsRes.data || []);
      setServices(servicesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create or activate program
  const handleActivateProgram = async () => {
    try {
      setSaving(true);
      const response = await api.post('/loyalty/program', programForm);
      setProgram(response.data);
      setMessage({ type: 'success', text: 'Programa de fidelidade ativado!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao ativar programa' });
    } finally {
      setSaving(false);
    }
  };

  // Update program
  const handleUpdateProgram = async () => {
    try {
      setSaving(true);
      const data = {
        ...programForm,
        pointsExpireDays: programForm.pointsExpireDays || null,
      };
      await api.patch('/loyalty/program', data);
      setMessage({ type: 'success', text: 'Configurações salvas!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle program active
  const handleToggleProgram = async () => {
    if (!program) return;
    try {
      setSaving(true);
      await api.patch('/loyalty/program', { isActive: !program.isActive });
      setMessage({ type: 'success', text: program.isActive ? 'Programa desativado' : 'Programa ativado' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar status' });
    } finally {
      setSaving(false);
    }
  };

  // Tier CRUD
  const openTierModal = (tier?: LoyaltyTier) => {
    if (tier) {
      setTierForm({
        name: tier.name,
        code: tier.code,
        minPoints: tier.minPoints,
        color: tier.color,
        icon: tier.icon || '',
        discountPercent: tier.benefits?.discountPercent || 0,
        priorityBooking: tier.benefits?.priorityBooking || false,
        extraBenefits: tier.benefits?.extraBenefits || '',
        pointsMultiplier: parseFloat(tier.pointsMultiplier),
        sortOrder: tier.sortOrder,
      });
      setTierModal({ open: true, tier });
    } else {
      setTierForm({
        name: '',
        code: '',
        minPoints: 0,
        color: '#6B7280',
        icon: '',
        discountPercent: 0,
        priorityBooking: false,
        extraBenefits: '',
        pointsMultiplier: 1,
        sortOrder: tiers.length,
      });
      setTierModal({ open: true, tier: null });
    }
  };

  const handleSaveTier = async () => {
    try {
      setSaving(true);
      const data = {
        name: tierForm.name,
        code: tierForm.code,
        minPoints: tierForm.minPoints,
        color: tierForm.color,
        icon: tierForm.icon || null,
        benefits: {
          discountPercent: tierForm.discountPercent || 0,
          priorityBooking: tierForm.priorityBooking,
          extraBenefits: tierForm.extraBenefits || undefined,
        },
        pointsMultiplier: tierForm.pointsMultiplier,
        sortOrder: tierForm.sortOrder,
      };

      if (tierModal.tier) {
        await api.patch(`/loyalty/tiers/${tierModal.tier.id}`, data);
      } else {
        await api.post('/loyalty/tiers', data);
      }
      setMessage({ type: 'success', text: 'Nível salvo!' });
      setTierModal({ open: false, tier: null });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar nível' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Tem certeza que deseja remover este nível?')) return;
    try {
      await api.delete(`/loyalty/tiers/${tierId}`);
      setMessage({ type: 'success', text: 'Nível removido!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao remover nível' });
    }
  };

  // Reward CRUD
  const openRewardModal = (reward?: LoyaltyReward) => {
    if (reward) {
      setRewardForm({
        name: reward.name,
        description: reward.description || '',
        type: reward.type,
        pointsCost: reward.pointsCost,
        value: reward.value ? parseFloat(reward.value) : 0,
        productId: reward.productId,
        serviceId: reward.serviceId,
        minTier: reward.minTier || '',
        maxRedemptionsPerClient: reward.maxRedemptionsPerClient,
        totalAvailable: reward.totalAvailable,
        validDays: reward.validDays,
        imageUrl: reward.imageUrl || '',
      });
      setRewardModal({ open: true, reward });
    } else {
      setRewardForm({
        name: '',
        description: '',
        type: 'DISCOUNT_VALUE',
        pointsCost: 100,
        value: 0,
        productId: null,
        serviceId: null,
        minTier: '',
        maxRedemptionsPerClient: null,
        totalAvailable: null,
        validDays: 30,
        imageUrl: '',
      });
      setRewardModal({ open: true, reward: null });
    }
  };

  const handleSaveReward = async () => {
    try {
      setSaving(true);
      const data = {
        name: rewardForm.name,
        description: rewardForm.description || null,
        type: rewardForm.type,
        pointsCost: rewardForm.pointsCost,
        value: rewardForm.value || null,
        productId: rewardForm.productId,
        serviceId: rewardForm.serviceId,
        minTier: rewardForm.minTier || null,
        maxRedemptionsPerClient: rewardForm.maxRedemptionsPerClient,
        totalAvailable: rewardForm.totalAvailable,
        validDays: rewardForm.validDays,
        imageUrl: rewardForm.imageUrl || null,
      };

      if (rewardModal.reward) {
        await api.patch(`/loyalty/rewards/${rewardModal.reward.id}`, data);
      } else {
        await api.post('/loyalty/rewards', data);
      }
      setMessage({ type: 'success', text: 'Recompensa salva!' });
      setRewardModal({ open: false, reward: null });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar recompensa' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Tem certeza que deseja remover esta recompensa?')) return;
    try {
      await api.delete(`/loyalty/rewards/${rewardId}`);
      setMessage({ type: 'success', text: 'Recompensa removida!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao remover recompensa' });
    }
  };

  const handleToggleReward = async (reward: LoyaltyReward) => {
    try {
      await api.patch(`/loyalty/rewards/${reward.id}`, { isActive: !reward.isActive });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar status' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Crown className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programa de Fidelidade</h1>
            <p className="text-gray-500">Configure pontos, níveis e recompensas</p>
          </div>
        </div>

        {program && (
          <button
            onClick={handleToggleProgram}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              program.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {program.isActive ? 'Desativar Programa' : 'Ativar Programa'}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <Sparkles className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* If no program exists, show activation card */}
      {!program && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Crown className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ative o Programa de Fidelidade</h2>
          <p className="text-gray-500 mb-6">Fidelize seus clientes com um sistema de pontos e recompensas</p>
          <button
            onClick={handleActivateProgram}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Ativando...' : 'Ativar Programa de Fidelidade'}
          </button>
        </div>
      )}

      {/* Program settings */}
      {program && (
        <>
          {/* Points Configuration */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Configurações de Pontos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos por R$1 em serviço
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={programForm.pointsPerRealService}
                  onChange={(e) => setProgramForm({ ...programForm, pointsPerRealService: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos por R$1 em produto
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={programForm.pointsPerRealProduct}
                  onChange={(e) => setProgramForm({ ...programForm, pointsPerRealProduct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos expiram em (dias)
                </label>
                <input
                  type="number"
                  min="0"
                  value={programForm.pointsExpireDays}
                  onChange={(e) => setProgramForm({ ...programForm, pointsExpireDays: parseInt(e.target.value) || 0 })}
                  placeholder="0 = nunca expira"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mínimo para resgate
                </label>
                <input
                  type="number"
                  min="1"
                  value={programForm.minimumRedeemPoints}
                  onChange={(e) => setProgramForm({ ...programForm, minimumRedeemPoints: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Bonus Points */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Bônus Especiais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos de boas-vindas
                </label>
                <input
                  type="number"
                  min="0"
                  value={programForm.welcomePoints}
                  onChange={(e) => setProgramForm({ ...programForm, welcomePoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos de aniversário
                </label>
                <input
                  type="number"
                  min="0"
                  value={programForm.birthdayPoints}
                  onChange={(e) => setProgramForm({ ...programForm, birthdayPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos por indicação
                </label>
                <input
                  type="number"
                  min="0"
                  value={programForm.referralPoints}
                  onChange={(e) => setProgramForm({ ...programForm, referralPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpdateProgram}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Níveis</h2>
              </div>
              <button
                onClick={() => openTierModal()}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Adicionar Nível
              </button>
            </div>

            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        // Move up
                        if (index > 0) {
                          const newTiers = [...tiers];
                          [newTiers[index], newTiers[index - 1]] = [newTiers[index - 1], newTiers[index]];
                          setTiers(newTiers);
                        }
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        // Move down
                        if (index < tiers.length - 1) {
                          const newTiers = [...tiers];
                          [newTiers[index], newTiers[index + 1]] = [newTiers[index + 1], newTiers[index]];
                          setTiers(newTiers);
                        }
                      }}
                      disabled={index === tiers.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tier.color }}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tier.name}</div>
                    <div className="text-sm text-gray-500">
                      {tier.minPoints.toLocaleString()} pontos | {parseFloat(tier.pointsMultiplier)}x multiplicador
                      {tier.benefits?.discountPercent ? ` | ${tier.benefits.discountPercent}% desconto` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTierModal(tier)}
                      className="p-2 text-gray-400 hover:text-purple-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {tiers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum nível configurado. Adicione níveis para começar!
                </div>
              )}
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Recompensas</h2>
              </div>
              <button
                onClick={() => openRewardModal()}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Nova Recompensa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border ${reward.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {reward.type === 'DISCOUNT_VALUE' && <DollarSign className="h-5 w-5 text-green-500" />}
                      {reward.type === 'DISCOUNT_PERCENT' && <Percent className="h-5 w-5 text-blue-500" />}
                      {reward.type === 'FREE_SERVICE' && <Sparkles className="h-5 w-5 text-purple-500" />}
                      {reward.type === 'FREE_PRODUCT' && <Package className="h-5 w-5 text-orange-500" />}
                      {reward.type === 'GIFT' && <Gift className="h-5 w-5 text-pink-500" />}
                      <span className="font-medium text-gray-900">{reward.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleReward(reward)}
                        className={`p-1 rounded ${reward.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {reward.isActive ? '●' : '○'}
                      </button>
                      <button
                        onClick={() => openRewardModal(reward)}
                        className="p-1 text-gray-400 hover:text-purple-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{reward.description || 'Sem descrição'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-purple-600">{reward.pointsCost} pontos</span>
                    {reward.minTier && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs">
                        Min: {reward.minTier}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {rewards.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  Nenhuma recompensa configurada. Adicione recompensas para seus clientes resgatarem!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tier Modal */}
      {tierModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {tierModal.tier ? 'Editar Nível' : 'Novo Nível'}
              </h3>
              <button onClick={() => setTierModal({ open: false, tier: null })}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    placeholder="Ex: Gold"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={tierForm.code}
                    onChange={(e) => setTierForm({ ...tierForm, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: GOLD"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pontos necessários</label>
                  <input
                    type="number"
                    min="0"
                    value={tierForm.minPoints}
                    onChange={(e) => setTierForm({ ...tierForm, minPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multiplicador</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={tierForm.pointsMultiplier}
                    onChange={(e) => setTierForm({ ...tierForm, pointsMultiplier: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <div className="flex gap-2">
                  {tierColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTierForm({ ...tierForm, color })}
                      className={`w-8 h-8 rounded-full ${tierForm.color === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto automático (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tierForm.discountPercent}
                  onChange={(e) => setTierForm({ ...tierForm, discountPercent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="priorityBooking"
                  checked={tierForm.priorityBooking}
                  onChange={(e) => setTierForm({ ...tierForm, priorityBooking: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="priorityBooking" className="text-sm text-gray-700">
                  Prioridade na agenda
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outros benefícios</label>
                <textarea
                  value={tierForm.extraBenefits}
                  onChange={(e) => setTierForm({ ...tierForm, extraBenefits: e.target.value })}
                  placeholder="Descreva outros benefícios..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setTierModal({ open: false, tier: null })}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTier}
                disabled={saving || !tierForm.name || !tierForm.code}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {rewardModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {rewardModal.reward ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h3>
              <button onClick={() => setRewardModal({ open: false, reward: null })}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                  placeholder="Ex: Desconto de R$20"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {rewardTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custo em pontos</label>
                  <input
                    type="number"
                    min="1"
                    value={rewardForm.pointsCost}
                    onChange={(e) => setRewardForm({ ...rewardForm, pointsCost: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {(rewardForm.type === 'DISCOUNT_VALUE' || rewardForm.type === 'DISCOUNT_PERCENT') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {rewardForm.type === 'DISCOUNT_VALUE' ? 'Valor do desconto (R$)' : 'Porcentagem de desconto (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rewardForm.value}
                    onChange={(e) => setRewardForm({ ...rewardForm, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {rewardForm.type === 'FREE_SERVICE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                  <select
                    value={rewardForm.serviceId || ''}
                    onChange={(e) => setRewardForm({ ...rewardForm, serviceId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {rewardForm.type === 'FREE_PRODUCT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                  <select
                    value={rewardForm.productId || ''}
                    onChange={(e) => setRewardForm({ ...rewardForm, productId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível mínimo</label>
                  <select
                    value={rewardForm.minTier}
                    onChange={(e) => setRewardForm({ ...rewardForm, minTier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Todos</option>
                    {tiers.map((t) => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
                  <input
                    type="number"
                    min="1"
                    value={rewardForm.validDays}
                    onChange={(e) => setRewardForm({ ...rewardForm, validDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite por cliente</label>
                  <input
                    type="number"
                    min="0"
                    value={rewardForm.maxRedemptionsPerClient || ''}
                    onChange={(e) => setRewardForm({ ...rewardForm, maxRedemptionsPerClient: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Ilimitado"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade total</label>
                  <input
                    type="number"
                    min="0"
                    value={rewardForm.totalAvailable || ''}
                    onChange={(e) => setRewardForm({ ...rewardForm, totalAvailable: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Ilimitado"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setRewardModal({ open: false, reward: null })}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReward}
                disabled={saving || !rewardForm.name}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoyaltySettingsPage;
