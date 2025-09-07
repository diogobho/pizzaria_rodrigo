import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Order, Product, Customer, PizzaFlavor, EsfihaFlavor, DeliveryPerson } from '../types';

interface AppState {
  user: User | null;
  orders: Order[];
  products: Product[];
  pizzaFlavors: PizzaFlavor[];
  esfihaFlavors: EsfihaFlavor[];
  customers: Customer[];
  deliveryPersons: DeliveryPerson[];
  orderCounter: number;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_PIZZA_FLAVORS'; payload: PizzaFlavor[] }
  | { type: 'SET_ESFIHA_FLAVORS'; payload: EsfihaFlavor[] }
  | { type: 'SET_DELIVERY_PERSONS'; payload: DeliveryPerson[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  orders: [],
  products: [],
  pizzaFlavors: [],
  esfihaFlavors: [],
  customers: [],
  deliveryPersons: [],
  orderCounter: 1,
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_PIZZA_FLAVORS':
      return { ...state, pizzaFlavors: action.payload };
    case 'SET_ESFIHA_FLAVORS':
      return { ...state, esfihaFlavors: action.payload };
    case 'SET_DELIVERY_PERSONS':
      return { ...state, deliveryPersons: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
      };
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload),
      };
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
}

const API_BASE = 'http://localhost:3001/api';

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Funções que fazem requisições para API
  loadInitialData: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados iniciais do banco
  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const [products, pizzaFlavors, esfihaFlavors, deliveryPersons, orders] = await Promise.all([
        fetch(`${API_BASE}/products`).then(r => r.json()),
        fetch(`${API_BASE}/flavors/pizza`).then(r => r.json()),
        fetch(`${API_BASE}/flavors/esfiha`).then(r => r.json()),
        fetch(`${API_BASE}/delivery/persons`).then(r => r.json()),
        fetch(`${API_BASE}/orders`).then(r => r.json()),
      ]);

      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_PIZZA_FLAVORS', payload: pizzaFlavors });
      dispatch({ type: 'SET_ESFIHA_FLAVORS', payload: esfihaFlavors });
      dispatch({ type: 'SET_DELIVERY_PERSONS', payload: deliveryPersons });
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Criar pedido no banco
  const createOrder = async (orderData: any) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar pedido');
      }

      const newOrder = await response.json();
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      
      // Recarregar dados para atualizar estoque
      await loadInitialData();
      
      return newOrder;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  };

  // Atualizar status do pedido
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const updatedOrder = await response.json();
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  };

  // Deletar pedido
  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
      });

      dispatch({ type: 'DELETE_ORDER', payload: orderId });
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  };

  // Carregar dados ao inicializar
  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      loadInitialData,
      createOrder,
      updateOrderStatus,
      deleteOrder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
