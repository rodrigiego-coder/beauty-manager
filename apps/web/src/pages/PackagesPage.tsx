import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Calendar,
  Scissors,
  DollarSign,
  X,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

interface PackageService {
  id: number;
  serviceId: number;
  serviceName?: string;
  sessionsIncluded: number;
}

interface ServicePackage {
  id: number;
  name: string;
  description?: string;
  price: string;
  totalSessions: number;
  expirationDays: number;
  active: boolean;
  packageServices: PackageService[];
}

interface AvailableService {
  id: number;
  name: string;
  basePrice: string;
  durationMinutes: number;
}

const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function PackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [saving, setSaving] = useState(false);

  // Available services for selection
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formExpirationDays, setFormExpirationDays] = useState('90');
  const [formServices, setFormServices] = useState<{ serviceId: number; sessionsIncluded: number }[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState('1');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/packages');
      setPackages(response.data);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const response = await api.get('/services');
      setAvailableServices(response.data.filter((s: AvailableService) => s.id));
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormExpirationDays('90');
    setFormServices([]);
    setSelectedServiceId(null);
    setSessionCount('1');
    loadServices();
    setShowModal(true);
  };

  const openEditModal = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormDescription(pkg.description || '');
    setFormPrice(pkg.price.replace('.', ','));
    setFormExpirationDays(String(pkg.expirationDays));
    setFormServices(pkg.packageServices.map(ps => ({
      serviceId: ps.serviceId,
      sessionsIncluded: ps.sessionsIncluded,
    })));
    setSelectedServiceId(null);
    setSessionCount('1');
    loadServices();
    setShowModal(true);
  };

  const addServiceToPackage = () => {
    if (!selectedServiceId) return;
    const sessions = parseInt(sessionCount) || 1;

    // Check if service already in list
    const existing = formServices.find(s => s.serviceId === selectedServiceId);
    if (existing) {
      setFormServices(formServices.map(s =>
        s.serviceId === selectedServiceId
          ? { ...s, sessionsIncluded: s.sessionsIncluded + sessions }
          : s
      ));
    } else {
      setFormServices([...formServices, { serviceId: selectedServiceId, sessionsIncluded: sessions }]);
    }

    setSelectedServiceId(null);
    setSessionCount('1');
  };

  const removeServiceFromPackage = (serviceId: number) => {
    setFormServices(formServices.filter(s => s.serviceId !== serviceId));
  };

  const getServiceName = (serviceId: number): string => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.name || `Serviço #${serviceId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formServices.length === 0) {
      alert('Adicione pelo menos um serviço ao pacote');
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        price: formPrice.replace(',', '.'),
        expirationDays: parseInt(formExpirationDays) || 90,
        services: formServices,
      };

      if (editingPackage) {
        await api.patch(`/packages/${editingPackage.id}`, data);
      } else {
        await api.post('/packages', data);
      }

      setShowModal(false);
      loadPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      alert('Erro ao salvar pacote');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/packages/${packageToDelete.id}`);
      setShowDeleteModal(false);
      setPackageToDelete(null);
      loadPackages();
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Erro ao excluir pacote');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSessions = formServices.reduce((sum, s) => sum + s.sessionsIncluded, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacotes de Sessões</h1>
          <p className="text-gray-500">Gerencie pacotes de serviços com múltiplas sessões</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Novo Pacote
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pacotes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pacote encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tente outra busca' : 'Crie seu primeiro pacote de sessões'}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Criar Pacote
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-500">{pkg.totalSessions} sessões</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(pkg.price)}
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {pkg.expirationDays} dias
                  </span>
                  <span className="flex items-center gap-1">
                    <Scissors className="w-4 h-4" />
                    {pkg.packageServices.length} serviço(s)
                  </span>
                </div>

                {/* Services included */}
                <div className="space-y-1 mb-4">
                  {pkg.packageServices.slice(0, 3).map((ps) => (
                    <div key={ps.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{ps.serviceName}</span>
                      <span className="text-gray-900 font-medium">{ps.sessionsIncluded}x</span>
                    </div>
                  ))}
                  {pkg.packageServices.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{pkg.packageServices.length - 3} serviço(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setPackageToDelete(pkg);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center justify-center px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingPackage ? 'Editar Pacote' : 'Novo Pacote'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Pacote *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Cronograma Capilar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descrição do pacote..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade (dias) *
                  </label>
                  <input
                    type="number"
                    value={formExpirationDays}
                    onChange={(e) => setFormExpirationDays(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Add Services Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serviços Incluídos *
                </label>

                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedServiceId || ''}
                    onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loadingServices}
                  >
                    <option value="">Selecione um serviço</option>
                    {availableServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} - {formatCurrency(svc.basePrice)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={sessionCount}
                    onChange={(e) => setSessionCount(e.target.value)}
                    min="1"
                    placeholder="Qtd"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addServiceToPackage}
                    disabled={!selectedServiceId}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected Services List */}
                {formServices.length > 0 ? (
                  <div className="space-y-2">
                    {formServices.map((fs) => (
                      <div
                        key={fs.serviceId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{getServiceName(fs.serviceId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary-600 font-semibold">
                            {fs.sessionsIncluded} sessão(ões)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeServiceFromPackage(fs.serviceId)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2 border-t">
                      <span className="text-sm font-semibold text-gray-700">
                        Total: {totalSessions} sessão(ões)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
                    Nenhum serviço adicionado
                  </div>
                )}
              </div>
            </form>

            <div className="p-4 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formName || !formPrice || formServices.length === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingPackage ? 'Atualizar' : 'Criar Pacote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && packageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Excluir Pacote</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o pacote{' '}
              <strong>{packageToDelete.name}</strong>?
            </p>

            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              Clientes que já adquiriram este pacote manterão suas sessões.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPackageToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackagesPage;
