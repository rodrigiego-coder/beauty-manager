import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  costPrice: string;
  salePrice: string;
  currentStock: number;
  minStock: number;
  unit: string;
  active: boolean;
}

const mockProducts: Product[] = [
  { id: 1, name: 'Shampoo Profissional 1L', costPrice: '25.00', salePrice: '45.00', currentStock: 5, minStock: 10, unit: 'UN', active: true },
  { id: 2, name: 'Condicionador Profissional 1L', costPrice: '28.00', salePrice: '50.00', currentStock: 8, minStock: 10, unit: 'UN', active: true },
  { id: 3, name: 'Tinta Loiro Claro', costPrice: '35.00', salePrice: '60.00', currentStock: 15, minStock: 5, unit: 'UN', active: true },
  { id: 4, name: 'Tinta Castanho Escuro', costPrice: '35.00', salePrice: '60.00', currentStock: 3, minStock: 5, unit: 'UN', active: true },
  { id: 5, name: 'Oxidante 20 Vol 1L', costPrice: '12.00', salePrice: '25.00', currentStock: 20, minStock: 8, unit: 'UN', active: true },
  { id: 6, name: 'Mascara Hidratacao 500g', costPrice: '45.00', salePrice: '85.00', currentStock: 2, minStock: 5, unit: 'UN', active: true },
  { id: 7, name: 'Oleo de Argan 60ml', costPrice: '30.00', salePrice: '55.00', currentStock: 12, minStock: 6, unit: 'UN', active: true },
  { id: 8, name: 'Descolorante Po 500g', costPrice: '40.00', salePrice: '70.00', currentStock: 1, minStock: 3, unit: 'UN', active: true },
];

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLowStock ? product.currentStock <= product.minStock : true;
    return matchesSearch && matchesFilter;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const isLowStock = (product: Product) => product.currentStock <= product.minStock;

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-500 mt-1">Gerencie os produtos do seu salao</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Alert for low stock */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-800">Atencao: Estoque Baixo</p>
            <p className="text-sm text-red-600">
              {lowStockCount} {lowStockCount === 1 ? 'produto esta' : 'produtos estao'} com estoque abaixo do minimo
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              filterLowStock
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Estoque Baixo
            {filterLowStock && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Preco Custo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Preco Venda
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isLowStock(product) ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isLowStock(product) ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Package className={`w-5 h-5 ${isLowStock(product) ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isLowStock(product) ? 'text-red-900' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatCurrency(product.costPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {formatCurrency(product.salePrice)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isLowStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.currentStock}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500 text-sm">min: {product.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isLowStock(product) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Estoque Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    defaultValue={editingProduct?.name || ''}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Shampoo Profissional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preco de Custo
                    </label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.costPrice || ''}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preco de Venda
                    </label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.salePrice || ''}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.currentStock || 0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque Minimo
                    </label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.minStock || 0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <select
                    defaultValue={editingProduct?.unit || 'UN'}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="ML">Mililitros (ML)</option>
                    <option value="L">Litros (L)</option>
                    <option value="G">Gramas (G)</option>
                    <option value="KG">Quilogramas (KG)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    {editingProduct ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
