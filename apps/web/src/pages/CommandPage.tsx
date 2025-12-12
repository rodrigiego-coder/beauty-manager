import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Loader2,
  AlertTriangle,
  Wallet,
  Gift,
  Receipt,
  CheckCircle,
  Clock,
  Scissors,
  Package,
  Edit,
  X,
  AlertCircle,
  User,
  UserPlus,
  History,
  Phone,
  Search,
  Sparkles,
  Crown,
  PartyPopper,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { HairProfileModal } from '../components/HairProfileModal';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { ClientLoyaltyCard } from '../components/ClientLoyaltyCard';
import { VoucherInput } from '../components/VoucherInput';
import { HairProfile, HairProfileFormData, ProductRecommendation } from '../types';

interface Command {
  id: string;
  cardNumber: string;
  code: string;
  status: 'OPEN' | 'IN_SERVICE' | 'WAITING_PAYMENT' | 'CLOSED' | 'CANCELED';
  clientId?: string;
  totalGross: string;
  totalDiscounts: string;
  totalNet: string;
  notes?: string;
  openedAt: string;
  openedById: string;
  items: CommandItem[];
  payments: CommandPayment[];
  events: CommandEvent[];
}

interface CommandItem {
  id: string;
  type: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalPrice: string;
  performerId?: string;
  addedAt: string;
  canceledAt?: string;
}

interface CommandPayment {
  id: string;
  method: string;
  amount: string;
  paidAt: string;
}

interface CommandEvent {
  id: string;
  eventType: string;
  actorId: string;
  actorName?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface Client {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  totalVisits: number;
  lastVisitDate: string | null;
  active: boolean;
}

interface ClientHistory {
  commands: {
    id: string;
    code: string | null;
    cardNumber: string;
    status: string;
    totalNet: string | null;
    openedAt: string;
    closedAt: string | null;
  }[];
  totalSpent: number;
  averageTicket: number;
  totalVisits: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Aberta', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_SERVICE: { label: 'Em Atendimento', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  WAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  CLOSED: { label: 'Fechada', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELED: { label: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const eventLabels: Record<string, string> = {
  OPENED: 'abriu a comanda',
  ITEM_ADDED: 'adicionou item',
  ITEM_UPDATED: 'atualizou item',
  ITEM_REMOVED: 'removeu item',
  DISCOUNT_APPLIED: 'aplicou desconto',
  SERVICE_CLOSED: 'encerrou os serviços',
  PAYMENT_ADDED: 'registrou pagamento',
  CASHIER_CLOSED: 'fechou a comanda no caixa',
  STATUS_CHANGED: 'alterou status',
  NOTE_ADDED: 'adicionou observação',
  CLIENT_LINKED: 'vinculou cliente',
  CLIENT_UNLINKED: 'removeu cliente',
};

const paymentMethods = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'TRANSFER', label: 'Transferência' },
];

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
  TRANSFER: 'Transferência',
};

export function CommandPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [command, setCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modais
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form de pagamento
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form de cancelamento
  const [cancelReason, setCancelReason] = useState('');

  // Modal de remover item
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CommandItem | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  // Modal de adicionar item
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemType, setItemType] = useState<'SERVICE' | 'PRODUCT'>('SERVICE');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // Estados do cliente vinculado
  const [linkedClient, setLinkedClient] = useState<Client | null>(null);
  const [showLinkClientModal, setShowLinkClientModal] = useState(false);
  const [showClientHistoryModal, setShowClientHistoryModal] = useState(false);
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [clientHistoryLoading, setClientHistoryLoading] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hair Profile state
  const [showHairProfileModal, setShowHairProfileModal] = useState(false);
  const [clientHairProfile, setClientHairProfile] = useState<HairProfile | null>(null);
  const [, setHairProfileLoading] = useState(false);

  // Loyalty state
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [showPointsEarned, setShowPointsEarned] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (id) {
      loadCommand();
    }
  }, [id]);

  // Buscar serviços e produtos
  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setAvailableServices(response.data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setAvailableProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };
  
  const loadCommand = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/commands/${id}`);
      setCommand(response.data);

      // Carrega dados do cliente vinculado
      if (response.data.clientId) {
        loadLinkedClient(response.data.clientId);
      } else {
        setLinkedClient(null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar comanda:', err);
      setError(err.response?.data?.message || 'Erro ao carregar comanda');
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados do cliente vinculado
  const loadLinkedClient = async (clientId: string) => {
    try {
      const response = await api.get(`/clients/${clientId}`);
      setLinkedClient(response.data);
      // Also load hair profile
      loadHairProfile(clientId);
    } catch (err) {
      console.error('Erro ao carregar cliente:', err);
      setLinkedClient(null);
    }
  };

  // Load hair profile for client
  const loadHairProfile = async (clientId: string) => {
    try {
      setHairProfileLoading(true);
      const response = await api.get(`/hair-profiles/client/${clientId}`);
      setClientHairProfile(response.data);
    } catch (err) {
      console.error('Erro ao carregar perfil capilar:', err);
      setClientHairProfile(null);
    } finally {
      setHairProfileLoading(false);
    }
  };

  // Save hair profile
  const handleSaveHairProfile = async (data: HairProfileFormData) => {
    try {
      await api.post('/hair-profiles', data);
      if (linkedClient) {
        loadHairProfile(linkedClient.id);
      }
    } catch (err) {
      console.error('Erro ao salvar perfil capilar:', err);
      throw err;
    }
  };

  // Handle adding product from recommendation
  const handleAddRecommendedProduct = async (product: ProductRecommendation) => {
    if (!command) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/items`, {
        type: 'PRODUCT',
        description: product.productName,
        quantity: 1,
        unitPrice: parseFloat(product.salePrice),
      });
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar produto');
    } finally {
      setActionLoading(false);
    }
  };

  // Busca clientes com debounce
  const searchClients = async (term: string) => {
    if (term.length < 2) {
      setClientSearchResults([]);
      return;
    }

    setClientSearchLoading(true);
    try {
      const response = await api.get(`/clients/search?term=${encodeURIComponent(term)}`);
      setClientSearchResults(response.data.slice(0, 10)); // Máximo 10 resultados
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setClientSearchResults([]);
    } finally {
      setClientSearchLoading(false);
    }
  };

  // Handle client search com debounce
  const handleClientSearchChange = (term: string) => {
    setClientSearchTerm(term);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      searchClients(term);
    }, 300);
  };

  // Vincular cliente à comanda
  const handleLinkClient = async (client: Client) => {
    if (!command) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/link-client`, {
        clientId: client.id,
      });

      setShowLinkClientModal(false);
      setClientSearchTerm('');
      setClientSearchResults([]);
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao vincular cliente');
    } finally {
      setActionLoading(false);
    }
  };

  // Remover vínculo do cliente
  const handleUnlinkClient = async () => {
    if (!command || !linkedClient) return;

    if (!confirm(`Deseja remover ${linkedClient.name || 'o cliente'} desta comanda?`)) return;

    try {
      setActionLoading(true);
      await api.delete(`/commands/${command.id}/client`);

      setLinkedClient(null);
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover cliente');
    } finally {
      setActionLoading(false);
    }
  };

  // Carregar histórico do cliente
  const loadClientHistory = async (clientId: string) => {
    setClientHistoryLoading(true);
    try {
      const response = await api.get(`/clients/${clientId}/history`);
      setClientHistory(response.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setClientHistory(null);
    } finally {
      setClientHistoryLoading(false);
    }
  };

  // Abrir modal de histórico
  const openClientHistoryModal = () => {
    if (linkedClient) {
      loadClientHistory(linkedClient.id);
      setShowClientHistoryModal(true);
    }
  };

  // Cadastro rápido de cliente
  const handleQuickCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;

    if (!quickClientName.trim() || !quickClientPhone.trim()) {
      alert('Preencha nome e telefone');
      return;
    }

    try {
      setActionLoading(true);
      // Criar cliente
      const createResponse = await api.post('/clients', {
        name: quickClientName.trim(),
        phone: quickClientPhone.trim(),
      });

      // Vincular à comanda
      await api.post(`/commands/${command.id}/link-client`, {
        clientId: createResponse.data.id,
      });

      setShowQuickClientModal(false);
      setShowLinkClientModal(false);
      setQuickClientName('');
      setQuickClientPhone('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  // Formatar telefone
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm", { locale: ptBR });
  };

  // Ação: Encerrar Serviços
  const handleCloseService = async () => {
    if (!command) return;
    
    if (!confirm('Deseja encerrar os serviços desta comanda?')) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/close-service`);
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao encerrar serviços');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Registrar Pagamento
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;

    const amount = parseFloat(paymentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/payments`, {
        method: paymentMethod,
        amount,
        notes: paymentNotes || undefined,
      });
      
      setShowPaymentModal(false);
      setPaymentMethod('PIX');
      setPaymentAmount('');
      setPaymentNotes('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Fechar Comanda no Caixa
  const handleCloseCashier = async () => {
    if (!command) return;

    if (!confirm('Deseja fechar esta comanda no caixa? Esta ação não pode ser desfeita.')) return;

    try {
      setActionLoading(true);

      // Check if we can calculate points before closing
      let estimatedPoints = 0;
      if (linkedClient) {
        try {
          const pointsResponse = await api.get(`/loyalty/calculate/${command.id}`);
          estimatedPoints = pointsResponse.data.points || 0;
        } catch {
          // Ignore if loyalty not configured
        }
      }

      await api.post(`/commands/${command.id}/close-cashier`, {
        voucherId: appliedVoucher?.id,
      });

      // Show points earned message
      if (estimatedPoints > 0 && linkedClient) {
        setPointsEarned(estimatedPoints);
        setShowPointsEarned(true);
        setTimeout(() => setShowPointsEarned(false), 5000);
      }

      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao fechar comanda');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Adicionar Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command || !selectedItem) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/items`, {
        type: itemType,
        description: selectedItem.name,
        quantity: parseInt(itemQuantity),
        unitPrice: parseFloat(itemPrice.replace(',', '.')),
      });

      setShowAddItemModal(false);
      setSelectedItem(null);
      setItemQuantity('1');
      setItemPrice('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar item');
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modal de adicionar item
  const openAddItemModal = () => {
    loadServices();
    loadProducts();
    setShowAddItemModal(true);
  };

  // Selecionar item da lista
  const handleSelectItem = (item: any, type: 'SERVICE' | 'PRODUCT') => {
    setSelectedItem(item);
    setItemType(type);
    setItemPrice(type === 'SERVICE' ? item.basePrice : item.salePrice);
  };

  // Ação: Remover Item
  const handleRemoveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command || !itemToRemove) return;

    try {
      setActionLoading(true);
      await api.delete(`/commands/${command.id}/items/${itemToRemove.id}`, {
        data: { reason: removeReason || undefined }
      });
      
      setShowRemoveItemModal(false);
      setItemToRemove(null);
      setRemoveReason('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover item');
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modal de remover item
  const openRemoveItemModal = (item: CommandItem) => {
    setItemToRemove(item);
    setRemoveReason('');
    setShowRemoveItemModal(true);
  };

  // Ação: Cancelar Comanda
  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;

    if (!cancelReason.trim()) {
      alert('Digite o motivo do cancelamento');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/cancel`, {
        reason: cancelReason,
      });
      
      setShowCancelModal(false);
      setCancelReason('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar comanda');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando comanda...</span>
      </div>
    );
  }

  if (error || !command) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || 'Comanda não encontrada'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const status = statusConfig[command.status] || { label: command.status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  const activeItems = command.items?.filter(item => !item.canceledAt) || [];
  const totalPaid = command.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalNet = parseFloat(command.totalNet) || 0;
  const remaining = totalNet - totalPaid;
  
  const serviceCount = activeItems.filter(i => i.type === 'SERVICE').length;
  const productCount = activeItems.filter(i => i.type === 'PRODUCT').length;

  const isEditable = command.status !== 'CLOSED' && command.status !== 'CANCELED';
  const canCloseService = command.status === 'OPEN' || command.status === 'IN_SERVICE';
  const canCloseCashier = command.status === 'WAITING_PAYMENT' && remaining <= 0;
  const canAddPayment = isEditable && remaining > 0;

  return (
    <div className="space-y-6">
      {/* Header Melhorado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Comanda #{command.cardNumber}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Receipt className="w-4 h-4" />
                  Código: {command.code}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Cartão: {command.cardNumber}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(command.openedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação no Header */}
          {isEditable && (
            <div className="flex gap-2">
              {canCloseService && activeItems.length > 0 && (
                <button 
                  onClick={handleCloseService}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
                >
                  Encerrar Serviços
                </button>
              )}
              {canCloseCashier && (
                <button 
                  onClick={handleCloseCashier}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  Fechar Comanda
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wallet className="w-4 h-4" />
            <p className="text-sm">Total Bruto</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(command.totalGross)}</p>
          {(serviceCount > 0 || productCount > 0) && (
            <p className="text-xs text-gray-400 mt-1">
              {serviceCount > 0 && `${serviceCount} serviço${serviceCount > 1 ? 's' : ''}`}
              {serviceCount > 0 && productCount > 0 && ' • '}
              {productCount > 0 && `${productCount} produto${productCount > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Gift className="w-4 h-4" />
            <p className="text-sm">Descontos</p>
          </div>
          <p className="text-2xl font-bold text-red-600">-{formatCurrency(command.totalDiscounts)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Receipt className="w-4 h-4" />
            <p className="text-sm">Total Líquido</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(command.totalNet)}</p>
        </div>
        
        <div className={`rounded-xl border p-4 ${remaining > 0 ? 'bg-orange-50 border-orange-200' : totalNet > 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <p className="text-sm">Restante</p>
          </div>
          <p className={`text-2xl font-bold ${remaining > 0 ? 'text-orange-600' : totalNet > 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {totalNet > 0 && remaining <= 0 ? '✅ Pago' : formatCurrency(remaining)}
          </p>
          {totalPaid > 0 && remaining > 0 && (
            <p className="text-xs text-gray-500 mt-1">Pagamento parcial registrado</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Itens ({activeItems.length})
              </h2>
              {isEditable && (
                <button 
                  onClick={openAddItemModal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              )}
            </div>

            {activeItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Scissors className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum item ainda.</p>
                <p className="text-sm">Clique em <span className="font-medium text-primary-600">+ Adicionar Item</span> para lançar serviços e produtos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3 pr-4">Descrição</th>
                      <th className="pb-3 pr-4 text-center">Qtd</th>
                      <th className="pb-3 pr-4 text-right">Unitário</th>
                      <th className="pb-3 pr-4 text-right">Total</th>
                      {isEditable && <th className="pb-3 text-center">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${item.type === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.type === 'SERVICE' ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-900">{item.quantity}</td>
                        <td className="py-3 pr-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                        {isEditable && (
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openRemoveItemModal(item)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Remover item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagamentos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pagamentos</h2>
              {canAddPayment && (
                <button 
                  onClick={() => {
                    setPaymentAmount(remaining.toFixed(2).replace('.', ','));
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  Registrar Pagamento
                </button>
              )}
            </div>

            {(!command.payments || command.payments.length === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum pagamento registrado.</p>
                {canAddPayment && (
                  <p className="text-sm">Clique em <span className="font-medium text-green-600">Registrar Pagamento</span> para receber.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-4">Método</th>
                      <th className="pb-3 pr-4">Data/Hora</th>
                      <th className="pb-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {command.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {paymentMethodLabels[payment.method] || payment.method}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-sm">{formatDate(payment.paidAt)}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resumo */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Pago:</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500">Restante:</span>
                <span className={`text-lg font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {remaining <= 0 ? '✅ Pago' : formatCurrency(remaining)}
                </span>
              </div>
            </div>

            {/* Voucher de Fidelidade */}
            {isEditable && linkedClient && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Voucher de Fidelidade</span>
                </div>
                <VoucherInput
                  onVoucherApplied={(voucher) => setAppliedVoucher(voucher)}
                  onVoucherRemoved={() => setAppliedVoucher(null)}
                  disabled={!isEditable}
                />
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Cliente Vinculado */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Cliente</h2>
            </div>

            {linkedClient ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {linkedClient.name || 'Cliente sem nome'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {formatPhone(linkedClient.phone)}
                    </p>
                  </div>
                  {isEditable && (
                    <button
                      onClick={handleUnlinkClient}
                      disabled={actionLoading}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Remover cliente"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary-600">{linkedClient.totalVisits}</p>
                    <p className="text-xs text-gray-500">Visitas</p>
                  </div>
                  {linkedClient.lastVisitDate && (
                    <div>
                      <p className="text-gray-600">Última visita:</p>
                      <p className="text-gray-900">{format(new Date(linkedClient.lastVisitDate), 'dd/MM/yyyy')}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={openClientHistoryModal}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50"
                  >
                    <History className="w-4 h-4" />
                    Histórico
                  </button>
                  <button
                    onClick={() => setShowHairProfileModal(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg ${
                      clientHairProfile
                        ? 'text-purple-600 border border-purple-200 hover:bg-purple-50'
                        : 'text-orange-600 border border-orange-200 hover:bg-orange-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {clientHairProfile ? 'Perfil Capilar' : 'Criar Perfil'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 text-sm mb-3">Nenhum cliente vinculado</p>
                {isEditable && (
                  <button
                    onClick={() => setShowLinkClientModal(true)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Vincular Cliente
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Programa de Fidelidade - só aparece se tem cliente vinculado */}
          {linkedClient && (
            <ClientLoyaltyCard
              clientId={linkedClient.id}
              clientName={linkedClient.name || 'Cliente'}
              compact
            />
          )}

          {/* Recomendações de Produtos - só aparece se tem cliente vinculado */}
          {linkedClient && (
            <ProductRecommendations
              clientId={linkedClient.id}
              clientName={linkedClient.name || 'Cliente'}
              onAddToCommand={isEditable ? handleAddRecommendedProduct : undefined}
              compact
            />
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Atividade</h2>
            </div>

            {(!command.events || command.events.length === 0) ? (
              <p className="text-gray-500 text-sm">Nenhuma atividade registrada.</p>
            ) : (
              <div className="space-y-4">
                {command.events.slice(0, 10).map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      {index < Math.min(command.events.length - 1, 9) && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{event.actorName || 'Usuário'}</span>
                        {' '}
                        {eventLabels[event.eventType] || event.eventType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(event.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Observações</h2>
            {command.notes ? (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{command.notes}</p>
            ) : (
              <p className="text-gray-400 text-sm">Nenhuma observação.</p>
            )}
            {isEditable && (
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Adicionar nota
              </button>
            )}
          </div>

          {/* Ações */}
          {isEditable && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações</h2>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                Cancelar Comanda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Registrar Pagamento</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Restante: {formatCurrency(remaining)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Parcelado em 3x"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Adicionar Item</h2>
              <button onClick={() => setShowAddItemModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs Serviço/Produto */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setItemType('SERVICE'); setSelectedItem(null); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  itemType === 'SERVICE'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Scissors className="w-4 h-4 inline mr-2" />
                Serviços
              </button>
              <button
                onClick={() => { setItemType('PRODUCT'); setSelectedItem(null); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  itemType === 'PRODUCT'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Produtos
              </button>
            </div>

            {/* Lista de itens */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {itemType === 'SERVICE' ? 'Selecione o serviço' : 'Selecione o produto'}
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {itemType === 'SERVICE' ? (
                  availableServices.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center text-sm">Nenhum serviço cadastrado</p>
                  ) : (
                    availableServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleSelectItem(service, 'SERVICE')}
                        className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                          selectedItem?.id === service.id && itemType === 'SERVICE' ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          <span className="text-green-600 font-semibold">
                            R$ {parseFloat(service.basePrice).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                        )}
                      </div>
                    ))
                  )
                ) : (
                  availableProducts.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center text-sm">Nenhum produto cadastrado</p>
                  ) : (
                    availableProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectItem(product, 'PRODUCT')}
                        className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                          selectedItem?.id === product.id && itemType === 'PRODUCT' ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{product.name}</span>
                          <span className="text-green-600 font-semibold">
                            R$ {parseFloat(product.salePrice).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Estoque: {product.currentStock} {product.unit}</p>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Item selecionado */}
            {selectedItem && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">Item selecionado:</p>
                <p className="font-semibold text-gray-900">{selectedItem.name}</p>
              </div>
            )}

            {/* Quantidade e Preço */}
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedItem}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Remover Item */}
      {showRemoveItemModal && itemToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Remover Item</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Item a ser removido:</p>
              <p className="font-semibold text-gray-900">{itemToRemove.description}</p>
              <p className="text-sm text-gray-600">Valor: {formatCurrency(itemToRemove.totalPrice)}</p>
            </div>

            <form onSubmit={handleRemoveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da remoção (opcional)
                </label>
                <input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="Ex: Cliente desistiu do serviço"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Removendo...' : 'Remover Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cancelar Comanda</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento.
            </p>

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do cancelamento *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Cliente desistiu do atendimento"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vincular Cliente */}
      {showLinkClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Vincular Cliente</h2>
              <button
                onClick={() => {
                  setShowLinkClientModal(false);
                  setClientSearchTerm('');
                  setClientSearchResults([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={clientSearchTerm}
                onChange={(e) => handleClientSearchChange(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>

            {/* Resultados */}
            <div className="min-h-[200px]">
              {clientSearchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-500">Buscando...</span>
                </div>
              ) : clientSearchResults.length > 0 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {clientSearchResults.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleLinkClient(client)}
                      className="p-3 hover:bg-primary-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{client.name || 'Sem nome'}</p>
                          <p className="text-sm text-gray-500">{formatPhone(client.phone)}</p>
                        </div>
                        <span className="text-xs text-gray-400">{client.totalVisits} visitas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : clientSearchTerm.length >= 2 ? (
                <div className="text-center py-8">
                  <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 mb-4">Nenhum cliente encontrado</p>
                  <button
                    onClick={() => {
                      setQuickClientName(clientSearchTerm);
                      setShowQuickClientModal(true);
                    }}
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Novo Cliente
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>Digite pelo menos 2 caracteres para buscar</p>
                </div>
              )}
            </div>

            {/* Botão criar novo sempre visível */}
            {clientSearchTerm.length < 2 && (
              <button
                onClick={() => setShowQuickClientModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Novo Cliente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Cadastro Rápido de Cliente */}
      {showQuickClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Novo Cliente</h2>
              <button
                onClick={() => {
                  setShowQuickClientModal(false);
                  setQuickClientName('');
                  setQuickClientPhone('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickClientModal(false);
                    setQuickClientName('');
                    setQuickClientPhone('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Salvando...' : 'Cadastrar e Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico do Cliente */}
      {showClientHistoryModal && linkedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Histórico de {linkedClient.name || 'Cliente'}
                </h2>
                <p className="text-sm text-gray-500">{formatPhone(linkedClient.phone)}</p>
              </div>
              <button
                onClick={() => setShowClientHistoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {clientHistoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-500">Carregando histórico...</span>
              </div>
            ) : clientHistory ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(clientHistory.totalSpent)}
                    </p>
                    <p className="text-xs text-green-700">Total Gasto</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(clientHistory.averageTicket)}
                    </p>
                    <p className="text-xs text-blue-700">Ticket Médio</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {clientHistory.totalVisits}
                    </p>
                    <p className="text-xs text-purple-700">Visitas</p>
                  </div>
                </div>

                {/* Lista de comandas */}
                {clientHistory.commands.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma comanda encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Últimas Visitas</h3>
                    {clientHistory.commands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {cmd.code || `Cartão ${cmd.cardNumber}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(cmd.openedAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(cmd.totalNet || '0')}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              cmd.status === 'CLOSED'
                                ? 'bg-green-100 text-green-700'
                                : cmd.status === 'CANCELED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {statusConfig[cmd.status]?.label || cmd.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>Não foi possível carregar o histórico</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowClientHistoryModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hair Profile Modal */}
      {linkedClient && (
        <HairProfileModal
          isOpen={showHairProfileModal}
          onClose={() => setShowHairProfileModal(false)}
          clientId={linkedClient.id}
          clientName={linkedClient.name || 'Cliente'}
          onSave={handleSaveHairProfile}
          existingProfile={clientHairProfile}
        />
      )}

      {/* Points Earned Toast */}
      {showPointsEarned && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">Parabéns!</p>
              <p className="text-sm opacity-90">
                {linkedClient?.name || 'Cliente'} ganhou <span className="font-bold">{pointsEarned} pontos</span>!
              </p>
            </div>
            <button
              onClick={() => setShowPointsEarned(false)}
              className="ml-2 p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
