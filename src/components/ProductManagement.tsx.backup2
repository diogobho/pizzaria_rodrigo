import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Package, Plus, Search, Edit, Check, X } from 'lucide-react';
import { Product } from '../types';

const ProductManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'bebida',
    price: 0,
    inStock: true,
  });

  const categories = {
    'all': 'Todos',
    'pizza-tradicional': 'Pizza Tradicional',
    'pizza-premium': 'Pizza Premium',
    'pizza-especial': 'Pizza Especial',
    'esfiha-tradicional': 'Esfiha Tradicional',
    'esfiha-premium': 'Esfiha Premium',
    'esfiha-especial': 'Esfiha Especial',
    'bebida': 'Bebidas',
  };

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const startEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm(product);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingProduct && editForm.name && editForm.price !== undefined) {
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: {
          id: editingProduct,
          name: editForm.name,
          category: editForm.category!,
          price: editForm.price,
          inStock: editForm.inStock!,
          description: editForm.description,
        },
      });
      setEditingProduct(null);
      setEditForm({});
    }
  };

  const addProduct = () => {
    if (newProductForm.name && newProductForm.category && newProductForm.price !== undefined) {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: newProductForm.name,
        category: newProductForm.category as Product['category'],
        price: newProductForm.price,
        inStock: newProductForm.inStock || true,
        description: newProductForm.description,
      };

      dispatch({ type: 'UPDATE_PRODUCT', payload: newProduct });
      setNewProductForm({
        name: '',
        category: 'bebida',
        price: 0,
        inStock: true,
      });
      setShowNewProduct(false);
    }
  };

  // Dados adicionais para pizzas e esfihas (só visualização)
  const pizzaData = state.pizzaFlavors.map(flavor => ({
    id: `pizza-${flavor.id}`,
    name: `Pizza ${flavor.name}`,
    category: `pizza-${flavor.category}` as Product['category'],
    price: flavor.price,
    inStock: true,
  }));

  const esfihaData = state.esfihaFlavors.map(flavor => ({
    id: `esfiha-${flavor.id}`,
    name: `Esfiha ${flavor.name}`,
    category: `esfiha-${flavor.category}` as Product['category'],
    price: flavor.price,
    inStock: true,
  }));

  const allProducts = [
    ...state.products,
    ...pizzaData,
    ...esfihaData,
  ].filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Package className="w-8 h-8 mr-3 text-red-600" />
              Gestão de Produtos
            </h1>
            <p className="text-gray-600">Gerencie o catálogo e controle de estoque</p>
          </div>
          <button
            onClick={() => setShowNewProduct(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add New Product Modal */}
        {showNewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Novo Produto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as Product['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="bebida">Bebida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProductForm.inStock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, inStock: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Em estoque</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowNewProduct(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addProduct}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {categories[product.category as keyof typeof categories] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 font-medium">R$ {product.price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <input
                          type="checkbox"
                          checked={editForm.inStock}
                          onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })}
                        />
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? '✓ Disponível' : '⚠️ Fora de estoque'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingProduct === product.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        product.category === 'bebida' && (
                          <button
                            onClick={() => startEdit(product)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )
                      )}
                      {product.id.startsWith('pizza-') && (
                        <span className="text-xs text-gray-500">Sabor de pizza</span>
                      )}
                      {product.id.startsWith('esfiha-') && (
                        <span className="text-xs text-gray-500">Sabor de esfiha</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Produtos</h3>
            <p className="text-3xl font-bold text-blue-600">{allProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bebidas</h3>
            <p className="text-3xl font-bold text-green-600">
              {allProducts.filter(p => p.category === 'bebida').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pizzas</h3>
            <p className="text-3xl font-bold text-red-600">
              {allProducts.filter(p => p.category.includes('pizza')).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Esfihas</h3>
            <p className="text-3xl font-bold text-orange-600">
              {allProducts.filter(p => p.category.includes('esfiha')).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;