import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { OrderItem, Customer, PizzaOrder } from '../types';
import { Phone, MapPin, User, Pizza, Coffee, Wine, ShoppingCart, Plus, X, Clock, Truck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PizzaBuilder from './PizzaBuilder';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentCustomer, setCurrentCustomer] = useState<Customer>({
    name: '',
    phone: '',
    address: '',
    complement: '',
  });
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pizza' | 'esfiha' | 'bebida'>('pizza');
  const [showPizzaBuilder, setShowPizzaBuilder] = useState(false);
  const [orderObservations, setOrderObservations] = useState('');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Lista de entregadores
  const deliveryPersons = [
    'João Silva',
    'Maria Santos',
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Souza'
  ];

  // Função para obter quantidade de massa
  const getMassaQuantity = (type: 'pizza' | 'esfiha') => {
    const massa = state.products.find(p => p.id === `massa-${type}`);
    return massa ? massa.stockQuantity : 0;
  };

  const addPizzaToOrder = (pizzaOrder: PizzaOrder) => {
    const newItem: OrderItem = {
      id: uuidv4(),
      type: 'pizza',
      productName: `Pizza ${pizzaOrder.size === 'media' ? 'Média' : 'Grande'}`,
      quantity: pizzaOrder.quantity,
      unitPrice: pizzaOrder.totalPrice / pizzaOrder.quantity,
      totalPrice: pizzaOrder.totalPrice,
      pizzaDetails: pizzaOrder,
    };

    setCurrentOrder([...currentOrder, newItem]);
    setShowPizzaBuilder(false);
    
    dispatch({
      type: 'REDUCE_STOCK',
      payload: { productId: 'massa-pizza', quantity: pizzaOrder.quantity }
    });
  };

  const addEsfihaToOrder = (flavorId: string) => {
    const flavor = state.esfihaFlavors.find(f => f.id === flavorId);
    if (!flavor || getMassaQuantity('esfiha') <= 0) return;

    const existingItem = currentOrder.find(
      item => item.type === 'esfiha' && item.productId === flavorId
    );

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: uuidv4(),
        type: 'esfiha',
        productId: flavorId,
        productName: `Esfiha ${flavor.name}`,
        quantity: 1,
        unitPrice: flavor.price,
        totalPrice: flavor.price,
      };

      setCurrentOrder([...currentOrder, newItem]);
    }
    
    dispatch({
      type: 'REDUCE_STOCK',
      payload: { productId: 'massa-esfiha', quantity: 1 }
    });
  };

  const addBeverageToOrder = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.inStock || product.stockQuantity <= 0) return;

    const existingItem = currentOrder.find(
      item => item.type === 'bebida' && item.productId === productId
    );

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: uuidv4(),
        type: 'bebida',
        productId: productId,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      };

      setCurrentOrder([...currentOrder, newItem]);
    }
    
    dispatch({
      type: 'REDUCE_STOCK',
      payload: { productId: productId, quantity: 1 }
    });
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
    } else {
      setCurrentOrder(currentOrder.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      }));
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

    if (!deliveryPerson) {
      alert('Selecione um entregador para o pedido');
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      alert('Preencha a data e horário para agendamento');
      return;
    }

    let scheduledDateTime: Date | undefined;
    if (isScheduled && scheduledDate && scheduledTime) {
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Verificar se a data agendada é no futuro
      if (scheduledDateTime <= new Date()) {
        alert('A data/hora agendada deve ser no futuro');
        return;
      }
    }

    const newOrder = {
      id: uuidv4(),
      orderNumber: state.orderCounter,
      customer: { ...currentCustomer, id: uuidv4() },
      items: currentOrder,
      totalPrice: getTotalPrice(),
      status: isScheduled ? 'nao-iniciado' : 'nao-iniciado' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      observations: orderObservations,
      deliveryPerson,
      scheduledDateTime,
      isScheduled: isScheduled || false,
    };

    dispatch({ type: 'ADD_ORDER', payload: newOrder });
    dispatch({ type: 'ADD_CUSTOMER', payload: newOrder.customer });

    // Reset form
    setCurrentCustomer({ name: '', phone: '', address: '', complement: '' });
    setCurrentOrder([]);
    setOrderObservations('');
    setDeliveryPerson('');
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');

    const scheduleText = isScheduled ? ` (AGENDADO para ${scheduledDateTime?.toLocaleString()})` : '';
    alert(`Pedido #${newOrder.orderNumber} criado com sucesso!${scheduleText}`);
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  // Função para gerar horários (a cada 30 minutos)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard - Novo Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 - Dados do Cliente */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Dados do Cliente
            </h2>

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

              {/* Entregador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Entregador
                </label>
                <select
                  value={deliveryPerson}
                  onChange={(e) => setDeliveryPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione um entregador</option>
                  {deliveryPersons.map((person) => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
              </div>

              {/* Agendamento */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="scheduled"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="scheduled" className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Agendar pedido
                  </label>
                </div>

                {isScheduled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horário
                      </label>
                      <select
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Selecione o horário</option>
                        {generateTimeOptions().map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
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
                Pizzas ({getMassaQuantity('pizza')})
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
                Esfihas ({getMassaQuantity('esfiha')})
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
                  {getMassaQuantity('pizza') > 0 ? (
                    <button
                      onClick={() => setShowPizzaBuilder(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Montar Pizza ({getMassaQuantity('pizza')} massas)
                    </button>
                  ) : (
                    <div className="w-full bg-gray-200 text-gray-500 p-4 rounded-lg text-center">
                      ⚠️ Sem massas de pizza disponíveis
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'esfiha' && state.esfihaFlavors.map((flavor) => (
                <button
                  key={flavor.id}
                  onClick={() => addEsfihaToOrder(flavor.id)}
                  disabled={getMassaQuantity('esfiha') <= 0}
                  className={`w-full border-2 border-gray-200 p-3 rounded-lg text-left transition-colors ${
                    getMassaQuantity('esfiha') > 0 
                      ? 'bg-gray-50 hover:bg-gray-100' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{flavor.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {flavor.category} • {getMassaQuantity('esfiha')} massas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {flavor.price.toFixed(2)}</p>
                      {getMassaQuantity('esfiha') > 0 && (
                        <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {activeTab === 'bebida' && state.products.filter(p => !p.id.startsWith('massa-')).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addBeverageToOrder(product.id)}
                  className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 p-3 rounded-lg text-left transition-colors"
                  disabled={!product.inStock || product.stockQuantity <= 0}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {product.inStock && product.stockQuantity > 0 
                          ? `✓ ${product.stockQuantity} unidades` 
                          : '⚠️ Fora de estoque'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {product.price.toFixed(2)}</p>
                      {product.inStock && product.stockQuantity > 0 && (
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
                {deliveryPerson && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    <Truck className="w-4 h-4 inline mr-1" />
                    {deliveryPerson}
                  </p>
                )}
                {isScheduled && scheduledDate && scheduledTime && (
                  <p className="text-sm text-orange-600 font-medium">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Agendado: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                  </p>
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
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    disabled={currentOrder.length === 0}
                  >
                    {isScheduled ? 'Agendar Pedido' : 'Finalizar Pedido'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={clearOrder}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Limpar
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Comanda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pizza Builder Modal */}
        {showPizzaBuilder && (
          <PizzaBuilder
            onAddToOrder={addPizzaToOrder}
            onClose={() => setShowPizzaBuilder(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
