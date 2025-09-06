import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { DeliveryPerson } from '../types';
import { Plus, Edit, Trash2, User, Phone, Truck, Bike, Footprints } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const DeliveryManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DeliveryPerson | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    transport: 'moto' as 'pe' | 'bicicleta' | 'moto',
    phone: '',
    active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      transport: 'moto',
      phone: '',
      active: true,
    });
    setEditingPerson(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (editingPerson) {
      // Editando
      const updatedPerson: DeliveryPerson = {
        ...editingPerson,
        ...formData,
      };
      dispatch({ type: 'UPDATE_DELIVERY_PERSON', payload: updatedPerson });
    } else {
      // Criando novo
      const newPerson: DeliveryPerson = {
        id: uuidv4(),
        ...formData,
        createdAt: new Date(),
      };
      dispatch({ type: 'ADD_DELIVERY_PERSON', payload: newPerson });
    }

    resetForm();
  };

  const handleEdit = (person: DeliveryPerson) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      transport: person.transport,
      phone: person.phone || '',
      active: person.active,
    });
    setShowForm(true);
  };

  const handleDelete = (personId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este entregador?')) {
      dispatch({ type: 'DELETE_DELIVERY_PERSON', payload: personId });
    }
  };

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'pe': return Footprints;
      case 'bicicleta': return Bike;
      case 'moto': return Truck;
      default: return Truck;
    }
  };

  const getTransportLabel = (transport: string) => {
    switch (transport) {
      case 'pe': return 'A pé';
      case 'bicicleta': return 'Bicicleta';
      case 'moto': return 'Moto';
      default: return transport;
    }
  };

  const getTransportColor = (transport: string) => {
    switch (transport) {
      case 'pe': return 'bg-green-100 text-green-800';
      case 'bicicleta': return 'bg-blue-100 text-blue-800';
      case 'moto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <User className="w-8 h-8 mr-3 text-red-600" />
              Gestão de Entregadores
            </h1>
            <p className="text-gray-600 mt-2">Gerencie a equipe de entregadores</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Entregador
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingPerson ? 'Editar' : 'Novo'} Entregador
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transporte *
                  </label>
                  <select
                    value={formData.transport}
                    onChange={(e) => setFormData({ ...formData, transport: e.target.value as 'pe' | 'bicicleta' | 'moto' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="moto">Moto</option>
                    <option value="bicicleta">Bicicleta</option>
                    <option value="pe">A pé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Entregador ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingPerson ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Entregadores */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entregador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.deliveryPersons.map((person) => {
                  const TransportIcon = getTransportIcon(person.transport);
                  
                  return (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransportColor(person.transport)}`}>
                          <TransportIcon className="w-3 h-3 mr-1" />
                          {getTransportLabel(person.transport)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {person.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          person.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {person.active ? '✓ Ativo' : '⚠️ Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(person)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(person.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Entregadores</h3>
            <p className="text-3xl font-bold text-blue-600">{state.deliveryPersons.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ativos</h3>
            <p className="text-3xl font-bold text-green-600">
              {state.deliveryPersons.filter(p => p.active).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Com Moto</h3>
            <p className="text-3xl font-bold text-red-600">
              {state.deliveryPersons.filter(p => p.transport === 'moto' && p.active).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;
