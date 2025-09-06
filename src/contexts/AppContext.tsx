import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'ADD_PIZZA_FLAVOR'; payload: PizzaFlavor }
  | { type: 'UPDATE_PIZZA_FLAVOR'; payload: PizzaFlavor }
  | { type: 'ADD_ESFIHA_FLAVOR'; payload: EsfihaFlavor }
  | { type: 'UPDATE_ESFIHA_FLAVOR'; payload: EsfihaFlavor }
  | { type: 'ADD_DELIVERY_PERSON'; payload: DeliveryPerson }
  | { type: 'UPDATE_DELIVERY_PERSON'; payload: DeliveryPerson }
  | { type: 'DELETE_DELIVERY_PERSON'; payload: string }
  | { type: 'REDUCE_STOCK'; payload: { productId: string; quantity: number } };

const initialState: AppState = {
  user: null,
  orders: [],
  products: [
    // Controle de Massas
    { id: 'massa-pizza', name: 'Massa de Pizza', category: 'bebida', price: 0, inStock: true, stockQuantity: 50 },
    { id: 'massa-esfiha', name: 'Massa de Esfiha', category: 'bebida', price: 0, inStock: true, stockQuantity: 100 },
    
    // Bebidas
    { id: 'coca-2l', name: 'Coca-Cola 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 25 },
    { id: 'guarana-2l', name: 'Guaraná 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 20 },
    { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'bebida', price: 3.50, inStock: true, stockQuantity: 48 },
    { id: 'guarana-lata', name: 'Guaraná Lata', category: 'bebida', price: 3.50, inStock: true, stockQuantity: 36 },
    { id: 'agua', name: 'Água 500ml', category: 'bebida', price: 2.00, inStock: true, stockQuantity: 50 },
    { id: 'suco', name: 'Suco Natural', category: 'bebida', price: 5.00, inStock: true, stockQuantity: 15 },
  ],
  deliveryPersons: [
    { id: '1', name: 'João Silva', transport: 'moto', phone: '(11) 91234-5678', active: true, createdAt: new Date() },
    { id: '2', name: 'Maria Santos', transport: 'bicicleta', phone: '(11) 92345-6789', active: true, createdAt: new Date() },
    { id: '3', name: 'Pedro Oliveira', transport: 'moto', phone: '(11) 93456-7890', active: true, createdAt: new Date() },
    { id: '4', name: 'Ana Costa', transport: 'pe', phone: '(11) 94567-8901', active: true, createdAt: new Date() },
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
    { id: 'carne', name: 'Carne', category: 'tradicional', price: 2.50 },
    { id: 'frango', name: 'Frango', category: 'tradicional', price: 2.50 },
    { id: 'queijo', name: 'Queijo', category: 'tradicional', price: 2.50 },
    { id: 'pizza', name: 'Pizza', category: 'tradicional', price: 2.50 },
    // Premium
    { id: 'carne-seca', name: 'Carne Seca', category: 'premium', price: 3.50 },
    { id: 'frango-catupiry-esfiha', name: 'Frango Catupiry', category: 'premium', price: 3.50 },
    { id: 'camarao-esfirra', name: 'Camarão', category: 'premium', price: 3.50 },
    // Especiais
    { id: 'chocolate-esfirra', name: 'Chocolate', category: 'especial', price: 3.50 },
    { id: 'doce-leite', name: 'Doce de Leite', category: 'especial', price: 3.50 },
  ],
  customers: [],
  orderCounter: 1,
};

function appReducer(state: AppState, action: AppAction): AppState {
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

    case 'ADD_PIZZA_FLAVOR':
      return {
        ...state,
        pizzaFlavors: [...state.pizzaFlavors, action.payload],
      };

    case 'UPDATE_PIZZA_FLAVOR':
      return {
        ...state,
        pizzaFlavors: state.pizzaFlavors.map(flavor =>
          flavor.id === action.payload.id ? action.payload : flavor
        ),
      };

    case 'ADD_ESFIHA_FLAVOR':
      return {
        ...state,
        esfihaFlavors: [...state.esfihaFlavors, action.payload],
      };

    case 'UPDATE_ESFIHA_FLAVOR':
      return {
        ...state,
        esfihaFlavors: state.esfihaFlavors.map(flavor =>
          flavor.id === action.payload.id ? action.payload : flavor
        ),
      };

    case 'ADD_DELIVERY_PERSON':
      return {
        ...state,
        deliveryPersons: [...state.deliveryPersons, action.payload],
      };

    case 'UPDATE_DELIVERY_PERSON':
      return {
        ...state,
        deliveryPersons: state.deliveryPersons.map(person =>
          person.id === action.payload.id ? action.payload : person
        ),
      };

    case 'DELETE_DELIVERY_PERSON':
      return {
        ...state,
        deliveryPersons: state.deliveryPersons.filter(person => person.id !== action.payload),
      };
    
    case 'REDUCE_STOCK':
      return {
        ...state,
        products: state.products.map(product => {
          if (product.id === action.payload.productId) {
            const newQuantity = Math.max(0, product.stockQuantity - action.payload.quantity);
            return {
              ...product,
              stockQuantity: newQuantity,
              inStock: newQuantity > 0
            };
          }
          return product;
        }),
      };
    
    default:
      return state;
  }
}

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
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};
