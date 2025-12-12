import { useState } from 'react';
import { Ticket, Check, X, AlertCircle, DollarSign, Percent, Package, Gift, Sparkles } from 'lucide-react';
import api from '../services/api';

interface VoucherReward {
  id: string;
  name: string;
  type: string;
  value: string | null;
  pointsCost: number;
}

interface VoucherValidation {
  valid: boolean;
  voucher?: {
    id: string;
    code: string;
    pointsSpent: number;
    status: string;
    expiresAt: string;
    reward: VoucherReward;
  };
  error?: string;
}

interface VoucherInputProps {
  onVoucherApplied?: (voucher: VoucherValidation['voucher']) => void;
  onVoucherRemoved?: () => void;
  disabled?: boolean;
}

export function VoucherInput({ onVoucherApplied, onVoucherRemoved, disabled = false }: VoucherInputProps) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidation['voucher'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    try {
      setValidating(true);
      setError(null);

      const response = await api.get<VoucherValidation>(`/loyalty/voucher/${code.trim().toUpperCase()}`);

      if (response.data.valid && response.data.voucher) {
        setAppliedVoucher(response.data.voucher);
        onVoucherApplied?.(response.data.voucher);
      } else {
        setError(response.data.error || 'Voucher inválido');
      }
    } catch {
      setError('Erro ao validar voucher');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setAppliedVoucher(null);
    setCode('');
    setError(null);
    onVoucherRemoved?.();
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT_VALUE': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'DISCOUNT_PERCENT': return <Percent className="h-4 w-4 text-blue-500" />;
      case 'FREE_SERVICE': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'FREE_PRODUCT': return <Package className="h-4 w-4 text-orange-500" />;
      case 'GIFT': return <Gift className="h-4 w-4 text-pink-500" />;
      default: return <Ticket className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRewardValue = (reward: VoucherReward) => {
    if (!reward.value) return null;
    const value = parseFloat(reward.value);
    switch (reward.type) {
      case 'DISCOUNT_VALUE': return `R$ ${value.toFixed(2)}`;
      case 'DISCOUNT_PERCENT': return `${value}%`;
      default: return null;
    }
  };

  // Voucher applied state
  if (appliedVoucher) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-full">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                {getRewardIcon(appliedVoucher.reward.type)}
                <span className="font-medium text-green-800">{appliedVoucher.reward.name}</span>
              </div>
              <div className="text-xs text-green-600">
                Código: {appliedVoucher.code}
                {getRewardValue(appliedVoucher.reward) && (
                  <span className="ml-2 font-semibold">{getRewardValue(appliedVoucher.reward)}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            placeholder="Código do voucher"
            disabled={disabled}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              error ? 'border-red-300' : ''
            } disabled:opacity-50 disabled:bg-gray-50`}
          />
        </div>
        <button
          onClick={handleValidate}
          disabled={validating || !code.trim() || disabled}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {validating ? 'Validando...' : 'Aplicar'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default VoucherInput;
