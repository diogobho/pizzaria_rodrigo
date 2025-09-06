import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Order, Product, Customer, PizzaFlavor, EsfihaFlavor } from '../types';

interface AppState {
  user: User | null;
  orders: Order[];
  products: Product[];
  pizzaFlavors: PizzaFlavor[];
  esfihaFlavors: EsfihaFlavor[];
  customers: Customer[];
  orderCounter: number;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_PRODUCT'; payload: Product };

const initialState: AppState = {
  user: null,
  orders: [],
  products: [
    // Bebidas
    { id: 'coca-2l', name: 'Coca-Cola 2L', category: 'bebida', price: 8.00, inStock: true },
    { id: 'guarana-2l', name: 'Guaraná 2L', category: 'bebida', price: 8.00, inStock: true },
    { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'bebida', price: 3.50, inStock: true },
    { id: 'guarana-lata', name: 'Guaraná Lata', category: 'bebida', price: 3.50, inStock: true },
    { id: 'agua', name: 'Água 500ml', category: 'bebida', price: 2.00, inStock: true },
    { id: 'suco', name: 'Suco Natural', category: 'bebida', price: 5.00, inStock: true },
  ],
  pizzaFlavors: [
    // Tradicionais
    { id: 'margherita', name: 'Margherita', category: 'tradicional', price: 25.00 },
    { id: 'calabresa', name: 'Calabresa', category: 'tradicional', price: 25.00 },
    { id: 'portuguesa', name: 'Portuguesa', category: 'tradicional', price: 25.00 },
    { id: 'mussarela', name: 'Mussarela', category: 'tradicional', price: 25.00 },
    { id: 'napolitana', name: 'Napolitana', category: 'tradicional', price: 25.00 },
    // Premium
    { id: 'frango-catupiry', name: 'Frango Catupiry', category: 'premium', price: 27.00 },
    { id: 'bacon', name: 'Bacon', category: 'premium', price: 27.00 },
    { id: 'quatro-queijos', name: 'Quatro Queijos', category: 'premium', price: 27.00 },
    { id: 'pepperoni', name: 'Pepperoni', category: 'premium', price: 27.00 },
    { id: 'toscana', name: 'Toscana', category: 'premium', price: 27.00 },
    // Especiais
    { id: 'camarao', name: 'Camarão', category: 'especial', price: 32.00 },
    { id: 'salmao', name: 'Salmão', category: 'especial', price: 32.00 },
    { id: 'vegetariana-gourmet', name: 'Vegetariana Gourmet', category: 'especial', price: 32.00 },
    { id: 'chocolate', name: 'Chocolate', category: 'especial', price: 32.00 },
    { id: 'banana-nevada', name: 'Banana Nevada', category: 'especial', price: 32.00 },
  ],
  esfihaFlavors: [
    // Tradicionais
    { id: 'esf-carne', name: 'Carne', category: 'tradicional', price: 2.50 },
    { id: 'esf-frango', name: 'Frango', category: 'tradicional', price: 2.50 },
    { id: 'esf-queijo', name: 'Queijo', category: 'tradicional', price: 2.50 },
    // Premium
    { id: 'esf-carne-seca', name: 'Carne Seca', category: 'premium', price: 3.50 },
    { id: 'esf-frango-catupiry', name: 'Frango Catupiry', category: 'premium', price: 3.50 },
    { id: 'esf-palmito', name: 'Palmito', category: 'premium', price: 3.50 },
    // Especiais
    { id: 'esf-camarao', name: 'Camarão', category: 'especial', price: 4.50 },
    { id: 'esf-vegetariana', name: 'Vegetariana', category: 'especial', price: 4.50 },
  ],
  customers: [],
  orderCounter: 1,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [...state.orders, action.payload],
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
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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