import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Phone, Plus, Pizza, Coffee, Wine, ShoppingCart, X, Edit3 } from 'lucide-react';
import { OrderItem, Customer } from '../types';
import PizzaBuilder from './PizzaBuilder';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentCustomer, setCurrentCustomer] = useState<Customer>({
    name: '',
    phone: '',
    address: '',
    complement: '',
  });
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderObservations, setOrderObservations] = useState('');
  const [showPizzaBuilder, setShowPizzaBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState<'pizza' | 'esfiha' | 'bebida'>('pizza');

  const handlePhoneCall = () => {
    // Reset form for new order
    setCurrentCustomer({
      name: '',
      phone: '',
      address: '',
      complement: '',
    });
    setCurrentOrder([]);
    setOrderObservations('');
  };

  const addEsfihaToOrder = (flavorId: string) => {
    const flavor = state.esfihaFlavors.find(f => f.id === flavorId);
    if (!flavor) return;

    const orderItem: OrderItem = {
      id: uuidv4(),
      type: 'esfiha',
      productId: flavorId,
      productName: `Esfiha ${flavor.name}`,
      quantity: 1,
      unitPrice: flavor.price,
      totalPrice: flavor.price,
    };

    setCurrentOrder([...currentOrder, orderItem]);
  };

  const addBeverageToOrder = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const orderItem: OrderItem = {
      id: uuidv4(),
      type: 'bebida',
      productId,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
    };

    setCurrentOrder([...currentOrder, orderItem]);
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
    } else {
      setCurrentOrder(currentOrder.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return currentOrder.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleFinishOrder = () => {
    if (!currentCustomer.name || !currentCustomer.phone || currentOrder.length === 0) {
      alert('Preencha os dados do cliente e adicione pelo menos um item ao pedido');
      return;
    }

    const order = {
      id: uuidv4(),
      orderNumber: state.orderCounter,
      customer: currentCustomer,
      items: currentOrder,
      totalPrice: getTotalPrice(),
      status: 'nao-iniciado' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      observations: orderObservations || undefined,
    };

    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'ADD_CUSTOMER', payload: currentCustomer });

    // Reset form
    setCurrentCustomer({
      name: '',
      phone: '',
      address: '',
      complement: '',
    });
    setCurrentOrder([]);
    setOrderObservations('');

    alert(`Pedido #${state.orderCounter} criado com sucesso!`);
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setOrderObservations('');
  };

  const printOrder = () => {
    window.print();
  };

  const findCustomerByPhone = (phone: string) => {
    const customer = state.customers.find(c => c.phone === phone);
    if (customer) {
      setCurrentCustomer(customer);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Coluna 1 - Novo Pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Novo Pedido</h2>
            <button
              onClick={handlePhoneCall}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Atender Ligação
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={currentCustomer.name}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Digite o nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={currentCustomer.phone}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                onBlur={(e) => findCustomerByPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={currentCustomer.address}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={currentCustomer.complement}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, complement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Apto, bloco, referência"
              />
            </div>
          </div>
        </div>

        {/* Coluna 2 - Cardápio Rápido */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Cardápio Rápido</h2>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab('pizza')}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                activeTab === 'pizza' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Pizza className="w-4 h-4 mr-2" />
              Pizzas
            </button>
            <button
              onClick={() => setActiveTab('esfiha')}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                activeTab === 'esfiha' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Esfihas
            </button>
            <button
              onClick={() => setActiveTab('bebida')}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                activeTab === 'bebida' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Wine className="w-4 h-4 mr-2" />
              Bebidas
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeTab === 'pizza' && (
              <div>
                <button
                  onClick={() => setShowPizzaBuilder(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Montar Pizza
                </button>
              </div>
            )}

            {activeTab === 'esfiha' && state.esfihaFlavors.map((flavor) => (
              <button
                key={flavor.id}
                onClick={() => addEsfihaToOrder(flavor.id)}
                className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{flavor.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{flavor.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">R$ {flavor.price.toFixed(2)}</p>
                    <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                      + Adicionar
                    </button>
                  </div>
                </div>
              </button>
            ))}

            {activeTab === 'bebida' && state.products.filter(p => p.category === 'bebida').map((product) => (
              <button
                key={product.id}
                onClick={() => addBeverageToOrder(product.id)}
                className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 p-3 rounded-lg text-left transition-colors"
                disabled={!product.inStock}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.inStock ? '✓ Disponível' : '⚠️ Fora de estoque'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">R$ {product.price.toFixed(2)}</p>
                    {product.inStock && (
                      <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                        + Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coluna 3 - Pedido Atual */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Pedido em Andamento
          </h2>

          {currentCustomer.name && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-800">{currentCustomer.name}</h3>
              <p className="text-sm text-gray-600">{currentCustomer.phone}</p>
              <p className="text-sm text-gray-600">{currentCustomer.address}</p>
              {currentCustomer.complement && (
                <p className="text-sm text-gray-600">{currentCustomer.complement}</p>
              )}
            </div>
          )}

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {currentOrder.map((item) => (
              <div key={item.id} className="border border-gray-200 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{item.productName}</h4>
                  <button
                    onClick={() => updateItemQuantity(item.id, 0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {item.pizzaDetails && (
                  <div className="text-sm text-gray-600 mb-2">
                    <p>• {item.pizzaDetails.format === 'inteira' ? 'Inteira' : 'Meia-Meia'}</p>
                    <p>• Sabores: {item.pizzaDetails.flavors.join(' / ')}</p>
                    {item.pizzaDetails.border && (
                      <p>• Borda: {item.pizzaDetails.border}</p>
                    )}
                    {item.pizzaDetails.extras.length > 0 && (
                      <p>• Extras: {item.pizzaDetails.extras.map(e => `${e.name} (${e.location})`).join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-red-600">R$ {item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={orderObservations}
                onChange={(e) => setOrderObservations(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Observações especiais..."
              />
            </div>

            <div className="border-t pt-4">
              <div className="text-2xl font-bold text-center text-red-600 mb-4">
                TOTAL: R$ {getTotalPrice().toFixed(2)}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleFinishOrder}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  disabled={currentOrder.length === 0 || !currentCustomer.name || !currentCustomer.phone}
                >
                  Finalizar Pedido
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={clearOrder}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={printOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Comanda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPizzaBuilder && (
        <PizzaBuilder
          onClose={() => setShowPizzaBuilder(false)}
          onAddToOrder={(pizzaOrder) => {
            const orderItem: OrderItem = {
              id: uuidv4(),
              type: 'pizza',
              productName: `Pizza ${pizzaOrder.size === 'media' ? 'Média' : 'Grande'} ${pizzaOrder.format === 'inteira' ? pizzaOrder.flavors[0] : pizzaOrder.flavors.join(' / ')}`,
              quantity: pizzaOrder.quantity,
              unitPrice: pizzaOrder.totalPrice / pizzaOrder.quantity,
              totalPrice: pizzaOrder.totalPrice,
              pizzaDetails: pizzaOrder,
            };
            setCurrentOrder([...currentOrder, orderItem]);
            setShowPizzaBuilder(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;