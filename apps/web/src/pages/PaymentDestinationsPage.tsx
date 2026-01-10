import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Percent,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import {
  PaymentDestination,
  FeeType,
  FeeMode,
  CreatePaymentDestinationData,
  UpdatePaymentDestinationData,
  FEE_TYPE_LABELS,
  FEE_MODE_LABELS,
  getDestinationTypeLabel,
  COMMON_DESTINATION_TYPE_LABELS,
} from '../types/payment';

// Tipos de destino disponíveis para o dropdown
const DESTINATION_TYPES = Object.keys(COMMON_DESTINATION_TYPE_LABELS) as string[];

const FEE_TYPES: FeeType[] = ['DISCOUNT', 'FEE'];
const FEE_MODES: FeeMode[] = ['PERCENT', 'FIXED'];

export function PaymentDestinationsPage() {
  const [destinations, setDestinations] = useState<PaymentDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<PaymentDestination | null>(null);

  const [formData, setFormData] = useState<CreatePaymentDestinationData>({
    name: '',
    type: '',
    bankName: '',
    lastDigits: '',
    description: '',
    feeType: undefined,
    feeMode: undefined,
    feeValue: 0,
    sortOrder: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, [showInactive]);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const params = showInactive ? '?all=true' : '';
      const response = await api.get(`/payment-destinations${params}`);
      setDestinations(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar destinos de pagamento:', err);
      setError('Erro ao carregar destinos de pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dest.bankName && dest.bankName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.type) {
      errors.type = 'Tipo é obrigatório';
    }

    // Se definiu feeType, precisa definir feeMode
    if (formData.feeType && !formData.feeMode) {
      errors.feeMode = 'Modo da taxa é obrigatório quando há tipo de taxa';
    }

    if (formData.feeValue && formData.feeValue < 0) {
      errors.feeValue = 'Valor não pode ser negativo';
    }

    // Validação de últimos dígitos
    if (formData.lastDigits && formData.lastDigits.length > 10) {
      errors.lastDigits = 'Últimos dígitos deve ter no máximo 10 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      type: '',
      bankName: '',
      lastDigits: '',
      description: '',
      feeType: undefined,
      feeMode: undefined,
      feeValue: 0,
      sortOrder: destinations.length,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (destination: PaymentDestination) => {
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      type: destination.type,
      bankName: destination.bankName || '',
      lastDigits: destination.lastDigits || '',
      description: destination.description || '',
      feeType: destination.feeType || undefined,
      feeMode: destination.feeMode || undefined,
      feeValue: destination.feeValue ? parseFloat(destination.feeValue) : 0,
      sortOrder: destination.sortOrder,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (destination: PaymentDestination) => {
    setSelectedDestination(destination);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.post('/payment-destinations', formData);
      setShowCreateModal(false);
      loadDestinations();
    } catch (err: any) {
      console.error('Erro ao criar destino de pagamento:', err);
      const message = err.response?.data?.message || 'Erro ao criar destino de pagamento';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !selectedDestination) return;

    try {
      setSubmitting(true);
      const updateData: UpdatePaymentDestinationData = {
        name: formData.name,
        type: formData.type,
        bankName: formData.bankName || null,
        lastDigits: formData.lastDigits || null,
        description: formData.description || null,
        feeType: formData.feeType || null,
        feeMode: formData.feeMode || null,
        feeValue: formData.feeValue,
        sortOrder: formData.sortOrder,
      };

      await api.patch(`/payment-destinations/${selectedDestination.id}`, updateData);
      setShowEditModal(false);
      setSelectedDestination(null);
      loadDestinations();
    } catch (err: any) {
      console.error('Erro ao atualizar destino de pagamento:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar destino de pagamento';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDestination) return;

    try {
      setSubmitting(true);
      await api.delete(`/payment-destinations/${selectedDestination.id}`);
      setShowDeleteModal(false);
      setSelectedDestination(null);
      loadDestinations();
    } catch (err: any) {
      console.error('Erro ao desativar destino de pagamento:', err);
      alert(err.response?.data?.message || 'Erro ao desativar destino de pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async (destination: PaymentDestination) => {
    try {
      await api.patch(`/payment-destinations/${destination.id}/reactivate`);
      loadDestinations();
    } catch (err: any) {
      console.error('Erro ao reativar destino de pagamento:', err);
      alert(err.response?.data?.message || 'Erro ao reativar destino de pagamento');
    }
  };

  const formatFee = (destination: PaymentDestination): string => {
    if (!destination.feeType || !destination.feeValue || parseFloat(destination.feeValue) === 0) {
      return '-';
    }
    const value = parseFloat(destination.feeValue);
    const typeLabel = destination.feeType === 'DISCOUNT' ? 'Desconto' : 'Taxa';
    if (destination.feeMode === 'PERCENT') {
      return `${typeLabel} ${value}%`;
    }
    return `${typeLabel} R$ ${value.toFixed(2)}`;
  };

  const formatDetails = (destination: PaymentDestination): string => {
    const parts: string[] = [];
    if (destination.bankName) parts.push(destination.bankName);
    if (destination.lastDigits) parts.push(`Final ${destination.lastDigits}`);
    return parts.length > 0 ? parts.join(' - ') : '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinos de Pagamento</h1>
          <p className="text-gray-600">Configure para onde o dinheiro é direcionado</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Destino
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou banco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Mostrar inativos</span>
          </label>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Detalhes
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Taxa/Desconto
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum destino de pagamento encontrado
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((destination) => (
                  <tr
                    key={destination.id}
                    className={!destination.active ? 'bg-gray-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <span className={`font-medium ${!destination.active ? 'text-gray-400' : 'text-gray-900'}`}>
                            {destination.name}
                          </span>
                          {destination.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {destination.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {getDestinationTypeLabel(destination.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatDetails(destination)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${destination.feeType === 'DISCOUNT' ? 'text-green-600' : destination.feeType === 'FEE' ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatFee(destination)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          destination.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {destination.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {destination.active ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(destination)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(destination)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReactivate(destination)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reativar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                {showCreateModal ? 'Novo Destino de Pagamento' : 'Editar Destino de Pagamento'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedDestination(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Maquininha Ton"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione o tipo</option>
                  {DESTINATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {COMMON_DESTINATION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                {formErrors.type && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Detalhes (opcional)
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nome do Banco</label>
                    <input
                      type="text"
                      value={formData.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Ex: Nubank, Itaú, Santander..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Últimos Dígitos</label>
                    <input
                      type="text"
                      value={formData.lastDigits || ''}
                      onChange={(e) => setFormData({ ...formData, lastDigits: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                        formErrors.lastDigits ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ex: 1234"
                      maxLength={10}
                    />
                    {formErrors.lastDigits && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.lastDigits}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Observações sobre este destino..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Taxa ou Desconto (opcional)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                    <select
                      value={formData.feeType || ''}
                      onChange={(e) => setFormData({ ...formData, feeType: e.target.value as FeeType || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Nenhum</option>
                      {FEE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {FEE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Modo</label>
                    <select
                      value={formData.feeMode || ''}
                      onChange={(e) => setFormData({ ...formData, feeMode: e.target.value as FeeMode || undefined })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                        formErrors.feeMode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={!formData.feeType}
                    >
                      <option value="">Selecione</option>
                      {FEE_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {FEE_MODE_LABELS[mode]}
                        </option>
                      ))}
                    </select>
                    {formErrors.feeMode && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.feeMode}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Valor {formData.feeMode === 'PERCENT' ? '(%)' : '(R$)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      {formData.feeMode === 'PERCENT' ? (
                        <Percent className="w-4 h-4 text-gray-400" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.feeValue || 0}
                      onChange={(e) => setFormData({ ...formData, feeValue: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={!formData.feeType}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de exibição
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedDestination(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedDestination && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Desativar destino de pagamento?
              </h3>
              <p className="text-gray-600 mb-6">
                O destino "{selectedDestination.name}" será desativado e não aparecerá mais nas opções.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDestination(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Desativando...' : 'Desativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
