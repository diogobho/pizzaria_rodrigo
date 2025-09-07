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
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { products: Product[], pizzaFlavors: PizzaFlavor[], esfihaFlavors: EsfihaFlavor[], deliveryPersons: DeliveryPerson[], orders: Order[] } }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REDUCE_STOCK'; payload: { productId: string; quantity: number } };

const initialState: AppState = {
  user: { id: '1', username: 'admin', name: 'Administrador' }, // Auto-login para simplificar
  orders: [],
  products: [],
  pizzaFlavors: [],
  esfihaFlavors: [],
  customers: [],
  deliveryPersons: [],
  orderCounter: 1,
  loading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return {
        ...state,
        products: action.payload.products,
        pizzaFlavors: action.payload.pizzaFlavors,
        esfihaFlavors: action.payload.esfihaFlavors,
        deliveryPersons: action.payload.deliveryPersons,
        orders: action.payload.orders,
        orderCounter: Math.max(1, ...action.payload.orders.map(o => o.orderNumber || 0)) + 1,
        loading: false,
      };
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        orderCounter: state.orderCounter + 1,
      };
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
    case 'ADD_CUSTOMER':
      const existingCustomer = state.customers.find(c => c.phone === action.payload.phone);
      if (existingCustomer) {
        return {
          ...state,
          customers: state.customers.map(c =>
            c.phone === action.payload.phone ? action.payload : c
          ),
        };
      }
      return {
        ...state,
        customers: [...state.customers, action.payload],
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case 'REDUCE_STOCK':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId
            ? {
                ...product,
                stockQuantity: Math.max(0, product.stockQuantity - action.payload.quantity),
                inStock: product.stockQuantity - action.payload.quantity > 0,
              }
            : product
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  createOrder: (orderData: any) => Promise<void>;
} | null>(null);

const API_BASE = 'http://localhost:3001/api';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do banco
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Carregando dados do banco...');
        
        const [productsRes, pizzaRes, esfihaRes, deliveryRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/flavors/pizza`),
          fetch(`${API_BASE}/flavors/esfiha`),
          fetch(`${API_BASE}/delivery/persons`),
          fetch(`${API_BASE}/orders`),
        ]);

        const [products, pizzaFlavors, esfihaFlavors, deliveryPersons, orders] = await Promise.all([
          productsRes.json(),
          pizzaRes.json(),
          esfihaRes.json(),
          deliveryRes.json(),
          ordersRes.json(),
        ]);

        console.log('Dados carregados:', { products: products.length, pizzaFlavors: pizzaFlavors.length, deliveryPersons: deliveryPersons.length });

        dispatch({
          type: 'SET_DATA',
          payload: { products, pizzaFlavors, esfihaFlavors, deliveryPersons, orders }
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Em caso de erro, usar dados fallback locais
        const fallbackData = {
          products: [
            { id: 'coca-2l', name: 'Coca-Cola 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 25 },
            { id: 'guarana-2l', name: 'Guaraná 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 25 },
          ],
          pizzaFlavors: [
            { id: 'margherita', name: 'Margherita', category: 'tradicional', price: 25.00 },
            { id: 'calabresa', name: 'Calabresa', category: 'tradicional', price: 25.00 },
          ],
          esfihaFlavors: [
            { id: 'carne', name: 'Carne', category: 'tradicional', price: 2.50 },
            { id: 'frango', name: 'Frango', category: 'tradicional', price: 2.50 },
          ],
          deliveryPersons: [
            { id: '1', name: 'João Silva', transport: 'moto', phone: '(11) 91234-5678', active: true, createdAt: new Date() },
          ],
          orders: []
        };
        
        dispatch({ type: 'SET_DATA', payload: fallbackData });
      }
    };

    loadData();
  }, []);

  // Criar pedido no banco
  const createOrder = async (orderData: any) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const newOrder = await response.json();
        dispatch({ type: 'ADD_ORDER', payload: newOrder });
        console.log('Pedido salvo no banco:', newOrder.orderNumber);
      } else {
        throw new Error('Erro ao salvar pedido');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      // Fallback: salvar localmente se banco falhar
      dispatch({ type: 'ADD_ORDER', payload: orderData });
      alert('Pedido salvo localmente (banco offline)');
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, createOrder }}>
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
