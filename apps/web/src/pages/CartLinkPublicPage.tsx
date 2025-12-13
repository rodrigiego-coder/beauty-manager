import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Tag, MapPin, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

interface CartLinkItem {
  type: string;
  itemId: number;
  name: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  quantity: number;
}

interface CartLink {
  id: string;
  code: string;
  clientName: string | null;
  items: CartLinkItem[];
  message: string | null;
  totalOriginalPrice: string;
  totalDiscount: string;
  totalFinalPrice: string;
  expiresAt: string | null;
  salon?: { id: string; name: string; phone: string | null; address: string | null };
}

export default function CartLinkPublicPage() {
  const { code } = useParams<{ code: string }>();
  const [link, setLink] = useState<CartLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    clientName: '',
    clientPhone: '',
    deliveryType: 'PICKUP',
    deliveryAddress: '',
    paymentMethod: 'PIX',
    notes: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchLink();
  }, [code]);

  const fetchLink = async () => {
    try {
      const response = await fetch(`${API_URL}/cart-links/public/${code}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Link nao encontrado ou expirado');
      }
      const data = await response.json();
      setLink(data);
      setCheckoutData(prev => ({ ...prev, clientName: data.clientName || '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setConverting(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/cart-links/public/${code}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: checkoutData.clientName,
          clientPhone: checkoutData.clientPhone,
          deliveryType: checkoutData.deliveryType,
          deliveryAddress: checkoutData.deliveryType === 'DELIVERY' ? checkoutData.deliveryAddress : undefined,
          paymentMethod: checkoutData.paymentMethod,
          notes: checkoutData.notes || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao processar pedido');
      }
      setConverted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (converted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
          <p className="text-gray-600 mb-4">Seu pedido foi recebido com sucesso. Em breve entraremos em contato para confirmar os detalhes.</p>
          {link?.salon?.phone && (
            <a href={`https://wa.me/55${link.salon.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
              <Phone className="h-5 w-5 mr-2" />Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!link) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{link.salon?.name || 'Carrinho'}</h1>
          {link.salon?.address && <p className="text-sm text-gray-600 flex items-center justify-center mt-1"><MapPin className="h-4 w-4 mr-1" />{link.salon.address}</p>}
        </div>

        {link.message && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <p className="text-gray-700 italic">"{link.message}"</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
          <div className="p-4 bg-purple-600 text-white">
            <div className="flex items-center"><ShoppingCart className="h-6 w-6 mr-2" /><span className="font-semibold">Seu Carrinho</span></div>
          </div>
          <div className="divide-y">
            {link.items.map((item, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.type === 'SERVICE' ? 'Servico' : 'Produto'}{item.quantity > 1 && ` x${item.quantity}`}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">R$ {(item.finalPrice * item.quantity).toFixed(2)}</div>
                  {item.discount > 0 && <div className="text-sm text-gray-400 line-through">R$ {(item.originalPrice * item.quantity).toFixed(2)}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t">
            {parseFloat(link.totalDiscount) > 0 && <div className="flex justify-between text-sm text-green-600 mb-1"><span>Desconto</span><span>- R$ {parseFloat(link.totalDiscount).toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-purple-600">R$ {parseFloat(link.totalFinalPrice).toFixed(2)}</span></div>
          </div>
        </div>

        {link.expiresAt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
            <p className="text-sm text-yellow-800"><Tag className="h-4 w-4 inline mr-1" />Oferta valida ate {new Date(link.expiresAt).toLocaleDateString('pt-BR')}</p>
          </div>
        )}

        {!showCheckout ? (
          <button onClick={() => setShowCheckout(true)} className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg">Finalizar Pedido</button>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Pedido</h2>
            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Seu Nome</label>
                <input type="text" value={checkoutData.clientName} onChange={(e) => setCheckoutData({ ...checkoutData, clientName: e.target.value })} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input type="tel" value={checkoutData.clientPhone} onChange={(e) => setCheckoutData({ ...checkoutData, clientPhone: e.target.value })} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" placeholder="(11) 99999-9999" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Como prefere receber?</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setCheckoutData({ ...checkoutData, deliveryType: 'PICKUP' })} className={`p-3 rounded-lg border-2 text-center transition-colors ${checkoutData.deliveryType === 'PICKUP' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}><span className="block text-xl mb-1">🏪</span>Retirar no Salao</button>
                  <button type="button" onClick={() => setCheckoutData({ ...checkoutData, deliveryType: 'DELIVERY' })} className={`p-3 rounded-lg border-2 text-center transition-colors ${checkoutData.deliveryType === 'DELIVERY' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}><span className="block text-xl mb-1">🚚</span>Entrega</button>
                </div>
              </div>
              {checkoutData.deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereco de Entrega</label>
                  <textarea value={checkoutData.deliveryAddress} onChange={(e) => setCheckoutData({ ...checkoutData, deliveryAddress: e.target.value })} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" rows={2} required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {['PIX', 'CARD', 'CASH'].map(method => (
                    <button key={method} type="button" onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method })} className={`p-2 rounded-lg border-2 text-center text-sm transition-colors ${checkoutData.paymentMethod === method ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                      {method === 'PIX' && '💳 PIX'}{method === 'CARD' && '💳 Cartao'}{method === 'CASH' && '💵 Dinheiro'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observacoes (opcional)</label>
                <textarea value={checkoutData.notes} onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" rows={2} />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
              <button type="submit" disabled={converting} className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg disabled:bg-gray-400">{converting ? 'Processando...' : 'Confirmar Pedido'}</button>
              <button type="button" onClick={() => setShowCheckout(false)} className="w-full py-2 text-gray-600 hover:text-gray-800">Voltar ao carrinho</button>
            </form>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Duvidas? Entre em contato</p>
          {link.salon?.phone && <a href={`tel:${link.salon.phone}`} className="text-purple-600 hover:text-purple-800">{link.salon.phone}</a>}
        </div>
      </div>
    </div>
  );
}
