import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Clock, Play, CheckCircle, Truck, Edit, Printer, FileText, Trash2, Calendar, BarChart3, Users } from 'lucide-react';
import { Order, DeliveryStats } from '../types';

const OrdersKanban: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const moveOrder = (orderId: string, newStatus: Order['status']) => {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
      const updatedOrder = { 
        ...order, 
        status: newStatus, 
        updatedAt: new Date(),
        ...(newStatus === 'entregue' ? { deliveredAt: new Date() } : {})
      };
      dispatch({
        type: 'UPDATE_ORDER',
        payload: updatedOrder,
      });
    }
  };

  const deleteOrder = (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      dispatch({ type: 'DELETE_ORDER', payload: orderId });
    }
  };

  const printOrder = (order: Order) => {
    const deliveryPerson = state.deliveryPersons.find(p => p.id === order.deliveryPersonId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda - Pedido #${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .order-info { margin-bottom: 15px; }
              .items { margin-bottom: 15px; }
              .total { font-weight: bold; font-size: 18px; text-align: right; border-top: 1px solid #333; padding-top: 10px; }
              .delivery-info { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
              .scheduled { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🍕 PIZZARIA RODRIGO DELIVERY</h1>
              <p>Pizza Artesanal com Sabor Único</p>
              <p>Tel: (11) 99999-9999</p>
            </div>
            <div class="order-info">
              <h2>Pedido #${order.orderNumber} - ${order.status.toUpperCase()}</h2>
              <p><strong>Cliente:</strong> ${order.customer.name}</p>
              <p><strong>Telefone:</strong> ${order.customer.phone}</p>
              <p><strong>Endereço:</strong> ${order.customer.address}</p>
              ${order.customer.complement ? `<p><strong>Complemento:</strong> ${order.customer.complement}</p>` : ''}
              <p><strong>Data/Hora:</strong> ${order.createdAt.toLocaleString()}</p>
            </div>
            
            ${deliveryPerson ? `
              <div class="delivery-info">
                <h3>🚚 INFORMAÇÕES DE ENTREGA</h3>
                <p><strong>Entregador:</strong> ${deliveryPerson.name}</p>
                <p><strong>Transporte:</strong> ${deliveryPerson.transport === 'pe' ? 'A pé' : deliveryPerson.transport === 'bicicleta' ? 'Bicicleta' : 'Moto'}</p>
                ${deliveryPerson.phone ? `<p><strong>Contato:</strong> ${deliveryPerson.phone}</p>` : ''}
              </div>
            ` : ''}
            
            ${order.isScheduled && order.scheduledDateTime ? `
              <div class="scheduled">
                <h3>📅 PEDIDO AGENDADO</h3>
                <p><strong>Data/Hora de Entrega:</strong> ${new Date(order.scheduledDateTime).toLocaleString()}</p>
              </div>
            ` : ''}
            
            <div class="items">
              <h3>Itens do Pedido:</h3>
              ${order.items.map(item => `
                <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc;">
                  <p><strong>${item.quantity}x ${item.productName}</strong></p>
                  ${item.pizzaDetails ? `
                    <p style="margin-left: 15px;">
                      • ${item.pizzaDetails.format === 'inteira' ? 'Inteira' : 'Meia-Meia'}<br>
                      • Sabores: ${item.pizzaDetails.flavors.join(' / ')}<br>
                      ${item.pizzaDetails.border ? `• Borda: ${item.pizzaDetails.border}<br>` : ''}
                      ${item.pizzaDetails.extras.length > 0 ? `• Extras: ${item.pizzaDetails.extras.map(e => `${e.name} (${e.location})`).join(', ')}<br>` : ''}
                    </p>
                  ` : ''}
                  <p style="text-align: right;"><strong>R$ ${item.totalPrice.toFixed(2)}</strong></p>
                </div>
              `).join('')}
            </div>
            ${order.observations ? `<div><strong>Observações:</strong> ${order.observations}</div>` : ''}
            <div class="total">
              <h3>TOTAL: R$ ${order.totalPrice.toFixed(2)}</h3>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'nao-iniciado': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'em-andamento': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'finalizado': return 'bg-green-100 border-green-300 text-green-800';
      case 'entregue': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'nao-iniciado': return Clock;
      case 'em-andamento': return Play;
      case 'finalizado': return CheckCircle;
      case 'entregue': return Truck;
      default: return Clock;
    }
  };

  // Filtrar pedidos por data selecionada
  const filteredOrders = state.orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    return orderDate === selectedDate;
  });

  const ordersByStatus = {
    'nao-iniciado': filteredOrders.filter(o => o.status === 'nao-iniciado'),
    'em-andamento': filteredOrders.filter(o => o.status === 'em-andamento'),
    'finalizado': filteredOrders.filter(o => o.status === 'finalizado'),
    'entregue': filteredOrders.filter(o => o.status === 'entregue'),
  };

  // Calcular estatísticas de entregadores
  const getDeliveryStats = (): DeliveryStats[] => {
    const today = new Date().toISOString().split('T')[0];
    const statsMap = new Map<string, DeliveryStats>();

    state.deliveryPersons.forEach(person => {
      if (person.active) {
        const deliveredOrders = state.orders.filter(order => 
          order.deliveryPersonId === person.id && order.status === 'entregue'
        );
        
        const todayOrders = deliveredOrders.filter(order => 
          new Date(order.createdAt).toISOString().split('T')[0] === today
        );

        const totalValue = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        statsMap.set(person.id, {
          deliveryPersonId: person.id,
          deliveryPersonName: person.name,
          transport: person.transport === 'pe' ? 'A pé' : person.transport === 'bicicleta' ? 'Bicicleta' : 'Moto',
          totalDeliveries: deliveredOrders.length,
          todayDeliveries: todayOrders.length,
          totalValue
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.todayDeliveries - a.todayDeliveries);
  };

  const deliveryStats = getDeliveryStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Controle de Pedidos</h1>
              <p className="text-gray-600">Gerencie pedidos e acompanhe entregas</p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  showStats ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </button>
            </div>
          </div>

          {/* Estatísticas de Entregadores */}
          {showStats && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Relatório de Entregadores - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {deliveryStats.map((stat) => (
                  <div key={stat.deliveryPersonId} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                    <h3 className="font-semibold text-lg">{stat.deliveryPersonName}</h3>
                    <p className="text-blue-100 text-sm mb-2">{stat.transport}</p>
                    <div className="space-y-1">
                      <p className="text-sm">Hoje: <span className="font-bold">{stat.todayDeliveries} entregas</span></p>
                      <p className="text-sm">Total: <span className="font-bold">{stat.totalDeliveries} entregas</span></p>
                      <p className="text-sm">Valor: <span className="font-bold">R$ {stat.totalValue.toFixed(2)}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-green-800">Entregas Hoje</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {deliveryStats.reduce((sum, stat) => sum + stat.todayDeliveries, 0)}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-blue-800">Faturamento Hoje</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {ordersByStatus['entregue'].reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-purple-800">Pedidos Agendados</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {filteredOrders.filter(o => o.isScheduled).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Object.entries(ordersByStatus).map(([status, orders]) => {
            const StatusIcon = getStatusIcon(status as Order['status']);
            const statusLabels = {
              'nao-iniciado': 'Não Iniciado',
              'em-andamento': 'Em Andamento',
              'finalizado': 'Finalizado',
              'entregue': 'Entregue',
            };

            return (
              <div key={status} className="bg-white rounded-xl shadow-lg">
                <div className={`p-4 rounded-t-xl ${getStatusColor(status as Order['status'])}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StatusIcon className="w-5 h-5 mr-2" />
                      <h2 className="text-lg font-bold">
                        {statusLabels[status as keyof typeof statusLabels]}
                      </h2>
                    </div>
                    <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                      {orders.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum pedido nesta fase</p>
                  ) : (
                    orders.map((order) => {
                      const deliveryPerson = state.deliveryPersons.find(p => p.id === order.deliveryPersonId);
                      const isScheduled = order.isScheduled && order.scheduledDateTime;
                      const isScheduledNow = isScheduled && new Date(order.scheduledDateTime!) <= new Date();
                      
                      return (
                        <div
                          key={order.id}
                          className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                            isScheduled && !isScheduledNow ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-gray-800">
                                  #{order.orderNumber} {order.customer.name}
                                </h3>
                                {isScheduled && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    isScheduledNow ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {isScheduledNow ? 'AGORA' : 'AGENDADO'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{order.customer.phone}</p>
                              <p className="text-xs text-gray-500">
                                {order.createdAt.toLocaleTimeString()}
                              </p>
                              {isScheduled && (
                                <p className="text-xs text-orange-600 font-medium">
                                  📅 {new Date(order.scheduledDateTime!).toLocaleString()}
                                </p>
                              )}
                              {deliveryPerson && (
                                <p className="text-xs text-blue-600 font-medium">
                                  🚚 {deliveryPerson.name} ({deliveryPerson.transport === 'pe' ? 'A pé' : deliveryPerson.transport})
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mb-3">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-sm text-gray-700">
                                {item.quantity}x {item.productName}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{order.items.length - 3} itens
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-red-600">
                              R$ {order.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {status === 'nao-iniciado' && (
                              <button
                                onClick={() => moveOrder(order.id, 'em-andamento')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Iniciar
                              </button>
                            )}

                            {status === 'em-andamento' && (
                              <button
                                onClick={() => moveOrder(order.id, 'finalizado')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Finalizar
                              </button>
                            )}

                            {status === 'finalizado' && (
                              <button
                                onClick={() => moveOrder(order.id, 'entregue')}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                              >
                                <Truck className="w-3 h-3 mr-1" />
                                Entregar
                              </button>
                            )}

                            <button
                              onClick={() => printOrder(order)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Imprimir
                            </button>

                            {status === 'entregue' && (
                              <button
                                onClick={() => printOrder(order)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Nota Fiscal
                              </button>
                            )}
                          </div>

                          {order.observations && (
                            <div className="mt-2 p-2 bg-yellow-100 rounded text-sm">
                              <strong>Obs:</strong> {order.observations}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos do Dia</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Em Andamento</h3>
            <p className="text-3xl font-bold text-orange-600">
              {ordersByStatus['em-andamento'].length + ordersByStatus['nao-iniciado'].length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Entregues</h3>
            <p className="text-3xl font-bold text-purple-600">
              {ordersByStatus['entregue'].length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Faturamento</h3>
            <p className="text-3xl font-bold text-green-600">
              R$ {ordersByStatus['entregue'].reduce((total, order) => total + order.totalPrice, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersKanban;
