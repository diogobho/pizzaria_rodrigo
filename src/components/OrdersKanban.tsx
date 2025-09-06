import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Clock, Play, CheckCircle, Edit, Printer, FileText, Trash2 } from 'lucide-react';
import { Order } from '../types';

const OrdersKanban: React.FC = () => {
  const { state, dispatch } = useApp();

  const moveOrder = (orderId: string, newStatus: Order['status']) => {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
      dispatch({
        type: 'UPDATE_ORDER',
        payload: { ...order, status: newStatus, updatedAt: new Date() },
      });
    }
  };

  const deleteOrder = (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      dispatch({ type: 'DELETE_ORDER', payload: orderId });
    }
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda - Pedido #${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .order-info { margin-bottom: 15px; }
              .items { margin-bottom: 15px; }
              .total { font-weight: bold; font-size: 18px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PIZZARIA RODRIGO DELIVERY</h1>
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
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'nao-iniciado': return Clock;
      case 'em-andamento': return Play;
      case 'finalizado': return CheckCircle;
      default: return Clock;
    }
  };

  const ordersByStatus = {
    'nao-iniciado': state.orders.filter(o => o.status === 'nao-iniciado'),
    'em-andamento': state.orders.filter(o => o.status === 'em-andamento'),
    'finalizado': state.orders.filter(o => o.status === 'finalizado'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Controle de Pedidos</h1>
          <p className="text-gray-600">Arraste os cards para alterar o status dos pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(ordersByStatus).map(([status, orders]) => {
            const StatusIcon = getStatusIcon(status as Order['status']);
            const statusLabels = {
              'nao-iniciado': 'Não Iniciado',
              'em-andamento': 'Em Andamento',
              'finalizado': 'Finalizado',
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
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              #{order.orderNumber} {order.customer.name}
                            </h3>
                            <p className="text-sm text-gray-600">{order.customer.phone}</p>
                            <p className="text-xs text-gray-500">
                              {order.createdAt.toLocaleTimeString()}
                            </p>
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

                          <button
                            onClick={() => printOrder(order)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Imprimir
                          </button>

                          {status === 'finalizado' && (
                            <button
                              onClick={() => printOrder(order)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos Hoje</h3>
            <p className="text-3xl font-bold text-blue-600">{state.orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Em Andamento</h3>
            <p className="text-3xl font-bold text-orange-600">
              {ordersByStatus['em-andamento'].length + ordersByStatus['nao-iniciado'].length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Faturamento</h3>
            <p className="text-3xl font-bold text-green-600">
              R$ {ordersByStatus['finalizado'].reduce((total, order) => total + order.totalPrice, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersKanban;