import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Product, PizzaFlavor, EsfihaFlavor } from '../types';
import { Search, Plus, Edit, Check, X, Package, Pizza as PizzaIcon, Coffee } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ProductManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  
  // Formulário com tipo de item
  const [newItemForm, setNewItemForm] = useState({
    type: 'bebida' as 'bebida' | 'pizza' | 'esfiha',
    name: '',
    category: 'tradicional' as 'tradicional' | 'premium' | 'especial',
    price: 0,
    inStock: true,
    stockQuantity: 0,
  });

  const categories = {
    todos: 'Todos',
    massas: 'Controle de Massas',
    bebida: 'Bebidas',
    'pizza-tradicional': 'Pizza Tradicional',
    'pizza-premium': 'Pizza Premium', 
    'pizza-especial': 'Pizza Especial',
    'esfiha-tradicional': 'Esfiha Tradicional',
    'esfiha-premium': 'Esfiha Premium',
    'esfiha-especial': 'Esfiha Especial',
  };

  // Função para obter quantidade de massa
  const getMassaQuantity = (type: 'pizza' | 'esfiha') => {
    const massa = state.products.find(p => p.id === `massa-${type}`);
    return massa ? massa.stockQuantity : 0;
  };

  // Combinar todos os produtos
  const allProducts = [
    // Controle de Massas (destacados)
    ...state.products.filter(p => p.id.startsWith('massa-')),
    
    // Bebidas regulares
    ...state.products.filter(p => !p.id.startsWith('massa-')),
    
    // Sabores de Pizza (exibir quantidade da massa)
    ...state.pizzaFlavors.map(flavor => ({
      id: `pizza-${flavor.id}`,
      name: `Pizza ${flavor.name}`,
      category: `pizza-${flavor.category}` as Product['category'],
      price: flavor.price,
      inStock: getMassaQuantity('pizza') > 0,
      stockQuantity: getMassaQuantity('pizza'),
    })),
    
    // Sabores de Esfiha (exibir quantidade da massa)
    ...state.esfihaFlavors.map(flavor => ({
      id: `esfiha-${flavor.id}`,
      name: `Esfiha ${flavor.name}`,
      category: `esfiha-${flavor.category}` as Product['category'],
      price: flavor.price,
      inStock: getMassaQuantity('esfiha') > 0,
      stockQuantity: getMassaQuantity('esfiha'),
    })),
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = selectedCategory === 'todos';
    
    if (selectedCategory === 'massas') {
      matchesCategory = product.id.startsWith('massa-');
    } else if (selectedCategory !== 'todos') {
      matchesCategory = product.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const startEdit = (product: Product) => {
    // Só permite editar bebidas e massas
    if (product.category === 'bebida' || product.id.startsWith('massa-')) {
      setEditingProduct(product.id);
      setEditForm(product);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editForm.id) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: editForm as Product });
      setEditingProduct(null);
      setEditForm({});
    }
  };

  const handleAddItem = () => {
    if (!newItemForm.name.trim() || newItemForm.price <= 0) {
      alert('Preencha o nome e um preço válido');
      return;
    }

    if (newItemForm.type === 'bebida') {
      // Adicionar como produto (bebida)
      const newProduct: Product = {
        id: `custom-${Date.now()}`,
        name: newItemForm.name,
        category: 'bebida',
        price: newItemForm.price,
        inStock: newItemForm.inStock,
        stockQuantity: newItemForm.stockQuantity,
      };
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      
    } else if (newItemForm.type === 'pizza') {
      // Adicionar como sabor de pizza
      const newFlavor: PizzaFlavor = {
        id: `custom-${Date.now()}`,
        name: newItemForm.name,
        category: newItemForm.category,
        price: newItemForm.price,
      };
      dispatch({ type: 'ADD_PIZZA_FLAVOR', payload: newFlavor });
      
    } else if (newItemForm.type === 'esfiha') {
      // Adicionar como sabor de esfiha
      const newFlavor: EsfihaFlavor = {
        id: `custom-${Date.now()}`,
        name: newItemForm.name,
        category: newItemForm.category,
        price: newItemForm.price,
      };
      dispatch({ type: 'ADD_ESFIHA_FLAVOR', payload: newFlavor });
    }

    // Reset form
    setNewItemForm({
      type: 'bebida',
      name: '',
      category: 'tradicional',
      price: 0,
      inStock: true,
      stockQuantity: 0,
    });
    setShowNewProduct(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Package className="w-8 h-8 mr-3 text-red-600" />
              Gestão de Produtos
            </h1>
            <p className="text-gray-600 mt-2">Controle de massas, bebidas e sabores</p>
          </div>
          <button
            onClick={() => setShowNewProduct(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </button>
        </div>

        {/* Resumo de Massas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Massas de Pizza</h3>
                <p className="text-3xl font-bold">{getMassaQuantity('pizza')} unidades</p>
                <p className="text-red-100 text-sm">Disponível para todos os sabores</p>
              </div>
              <PizzaIcon className="w-12 h-12 text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Massas de Esfiha</h3>
                <p className="text-3xl font-bold">{getMassaQuantity('esfiha')} unidades</p>
                <p className="text-orange-100 text-sm">Disponível para todos os sabores</p>
              </div>
              <Coffee className="w-12 h-12 text-orange-200" />
            </div>
          </div>
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

        {/* Add New Item Modal */}
        {showNewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Novo Item</h3>
              
              <div className="space-y-4">
                {/* Tipo de Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Item *
                  </label>
                  <select
                    value={newItemForm.type}
                    onChange={(e) => setNewItemForm({ 
                      ...newItemForm, 
                      type: e.target.value as 'bebida' | 'pizza' | 'esfiha',
                      category: 'tradicional' // Reset categoria
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="bebida">🥤 Bebida</option>
                    <option value="pizza">🍕 Sabor de Pizza</option>
                    <option value="esfiha">🥟 Sabor de Esfiha</option>
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={
                      newItemForm.type === 'bebida' ? 'Ex: Coca-Cola 350ml' :
                      newItemForm.type === 'pizza' ? 'Ex: Mexicana' :
                      'Ex: Esfiha de Ricota'
                    }
                  />
                </div>

                {/* Categoria (só para pizza/esfiha) */}
                {(newItemForm.type === 'pizza' || newItemForm.type === 'esfiha') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={newItemForm.category}
                      onChange={(e) => setNewItemForm({ 
                        ...newItemForm, 
                        category: e.target.value as 'tradicional' | 'premium' | 'especial' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="tradicional">Tradicional</option>
                      <option value="premium">Premium</option>
                      <option value="especial">Especial</option>
                    </select>
                  </div>
                )}

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({ ...newItemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Quantidade em Estoque (só para bebidas) */}
                {newItemForm.type === 'bebida' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade em Estoque
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItemForm.stockQuantity}
                      onChange={(e) => setNewItemForm({ ...newItemForm, stockQuantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Em estoque (só para bebidas) */}
                {newItemForm.type === 'bebida' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={newItemForm.inStock}
                      onChange={(e) => setNewItemForm({ ...newItemForm, inStock: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="inStock" className="text-sm text-gray-700">
                      Em estoque
                    </label>
                  </div>
                )}

                {/* Info sobre sabores */}
                {(newItemForm.type === 'pizza' || newItemForm.type === 'esfiha') && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ℹ️ {newItemForm.type === 'pizza' ? 'Pizzas' : 'Esfihas'} usam o controle de massa geral. 
                      A disponibilidade depende da quantidade de massa em estoque.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowNewProduct(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddItem}
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
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${
                    product.id.startsWith('massa-') ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                          {product.id.startsWith('massa-') && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              CONTROLE
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {product.id.startsWith('massa-') ? 'Controle de Massa' : 
                         categories[product.category as keyof typeof categories] || product.category}
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
                        <div className="text-sm text-gray-900 font-medium">
                          {product.id.startsWith('massa-') ? '-' : `R$ ${product.price.toFixed(2)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.stockQuantity}
                          onChange={(e) => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value) })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 font-medium">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stockQuantity > 10 ? 'bg-green-100 text-green-800' :
                            product.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stockQuantity} {product.id.startsWith('massa-') ? 'massas' : 'unid'}
                          </span>
                          {(product.id.startsWith('pizza-') || product.id.startsWith('esfiha-')) && (
                            <div className="text-xs text-gray-500 mt-1">
                              * Baseado na massa disponível
                            </div>
                          )}
                        </div>
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
                          product.inStock && product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock && product.stockQuantity > 0 ? '✓ Disponível' : '⚠️ Fora de estoque'}
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
                        <>
                          {(product.category === 'bebida' || product.id.startsWith('massa-')) && (
                            <button
                              onClick={() => startEdit(product)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {product.id.startsWith('pizza-') && (
                            <span className="text-xs text-gray-500">Sabor de pizza</span>
                          )}
                          {product.id.startsWith('esfiha-') && (
                            <span className="text-xs text-gray-500">Sabor de esfiha</span>
                          )}
                        </>
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
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Massas de Pizza</h3>
            <p className="text-3xl font-bold text-red-600">{getMassaQuantity('pizza')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Massas de Esfiha</h3>
            <p className="text-3xl font-bold text-orange-600">{getMassaQuantity('esfiha')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bebidas</h3>
            <p className="text-3xl font-bold text-green-600">
              {state.products.filter(p => !p.id.startsWith('massa-')).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sabores Disponíveis</h3>
            <p className="text-3xl font-bold text-blue-600">
              {state.pizzaFlavors.length + state.esfihaFlavors.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
