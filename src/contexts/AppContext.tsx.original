import { api } from '../services/api';
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
  | { type: 'SET_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REDUCE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'ADD_PIZZA_FLAVOR'; payload: PizzaFlavor }
  | { type: 'UPDATE_PIZZA_FLAVOR'; payload: PizzaFlavor }
  | { type: 'ADD_ESFIHA_FLAVOR'; payload: EsfihaFlavor }
  | { type: 'UPDATE_ESFIHA_FLAVOR'; payload: EsfihaFlavor }
  | { type: 'ADD_DELIVERY_PERSON'; payload: DeliveryPerson }
  | { type: 'UPDATE_DELIVERY_PERSON'; payload: DeliveryPerson }
  | { type: 'DELETE_DELIVERY_PERSON'; payload: string };

const initialState: AppState = {
  user: null,
  orders: [],
  products: [],
  pizzaFlavors: [],
  esfihaFlavors: [],
  customers: [],
  deliveryPersons: [],
  orderCounter: 1,
  loading: false, // Começar com false para não travar
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
      return { ...state, ...action.payload, loading: false };
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
        products: state.products.map(product => {
          // COMPATIBILIDADE: Manter lógica original E adicionar nova lógica
          let targetProductId = action.payload.productId;
          
          // Nova lógica: se productId for 'pizza' ou 'esfiha', usar massa
          if (action.payload.productId === 'pizza') {
            targetProductId = 'massa-pizza';
          } else if (action.payload.productId === 'esfiha') {
            targetProductId = 'massa-esfiha';
          }
          
          if (product.id === targetProductId) {
            return {
              ...product,
              stockQuantity: Math.max(0, product.stockQuantity - action.payload.quantity),
              inStock: product.stockQuantity - action.payload.quantity > 0,
            };
          }
          return product;
        }),
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
    default:
      return state;
  }
}

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Dados locais como fallback (sempre disponível)
  const setupLocalData = () => {
    const localData = {
      products: [
        // CONTROLE DE MASSA
        { id: 'massa-pizza', name: 'Massa de Pizza', category: 'bebida', price: 0, inStock: true, stockQuantity: 50 },
        { id: 'massa-esfiha', name: 'Massa de Esfiha', category: 'bebida', price: 0, inStock: true, stockQuantity: 100 },
        
        // BEBIDAS
        { id: 'coca-2l', name: 'Coca-Cola 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 25 },
        { id: 'guarana-2l', name: 'Guaraná 2L', category: 'bebida', price: 8.00, inStock: true, stockQuantity: 20 },
        { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'bebida', price: 3.50, inStock: true, stockQuantity: 48 },
        { id: 'guarana-lata', name: 'Guaraná Lata', category: 'bebida', price: 3.50, inStock: true, stockQuantity: 36 },
        { id: 'agua', name: 'Água 500ml', category: 'bebida', price: 2.00, inStock: true, stockQuantity: 50 },
        { id: 'suco', name: 'Suco Natural', category: 'bebida', price: 5.00, inStock: true, stockQuantity: 15 },
      ],
      pizzaFlavors: [
        { id: 'margherita', name: 'Margherita', category: 'tradicional', price: 25.00 },
        { id: 'calabresa', name: 'Calabresa', category: 'tradicional', price: 25.00 },
        { id: 'portuguesa', name: 'Portuguesa', category: 'tradicional', price: 25.00 },
        { id: 'mussarela', name: 'Mussarela', category: 'tradicional', price: 25.00 },
        { id: 'napolitana', name: 'Napolitana', category: 'tradicional', price: 25.00 },
        { id: 'frango-catupiry', name: 'Frango Catupiry', category: 'premium', price: 27.00 },
        { id: 'bacon', name: 'Bacon', category: 'premium', price: 27.00 },
        { id: 'quatro-queijos', name: 'Quatro Queijos', category: 'premium', price: 27.00 },
        { id: 'pepperoni', name: 'Pepperoni', category: 'premium', price: 27.00 },
        { id: 'toscana', name: 'Toscana', category: 'premium', price: 27.00 },
        { id: 'camarao', name: 'Camarão', category: 'especial', price: 32.00 },
        { id: 'salmao', name: 'Salmão', category: 'especial', price: 32.00 },
        { id: 'vegetariana-gourmet', name: 'Vegetariana Gourmet', category: 'especial', price: 32.00 },
        { id: 'chocolate', name: 'Chocolate', category: 'especial', price: 32.00 },
        { id: 'banana-nevada', name: 'Banana Nevada', category: 'especial', price: 32.00 },
      ],
      esfihaFlavors: [
        { id: 'carne', name: 'Carne', category: 'tradicional', price: 2.50 },
        { id: 'frango', name: 'Frango', category: 'tradicional', price: 2.50 },
        { id: 'queijo', name: 'Queijo', category: 'tradicional', price: 2.50 },
        { id: 'pizza', name: 'Pizza', category: 'tradicional', price: 2.50 },
        { id: 'carne-seca', name: 'Carne Seca', category: 'premium', price: 3.50 },
        { id: 'frango-catupiry-esfiha', name: 'Frango Catupiry', category: 'premium', price: 3.50 },
        { id: 'camarao-esfirra', name: 'Camarão', category: 'premium', price: 3.50 },
        { id: 'chocolate-esfirra', name: 'Chocolate', category: 'especial', price: 3.50 },
        { id: 'doce-leite', name: 'Doce de Leite', category: 'especial', price: 3.50 },
      ],
      deliveryPersons: [
        { id: '1', name: 'João Silva', transport: 'moto', phone: '(11) 91234-5678', active: true, createdAt: new Date() },
        { id: '2', name: 'Maria Santos', transport: 'moto', phone: '(11) 92345-6789', active: true, createdAt: new Date() },
        { id: '3', name: 'Pedro Oliveira', transport: 'bicicleta', phone: '(11) 93456-7890', active: true, createdAt: new Date() },
        { id: '4', name: 'Ana Costa', transport: 'pe', phone: '(11) 94567-8901', active: true, createdAt: new Date() },
      ],
      orders: [],
      orderCounter: 1
    };
    
    dispatch({ type: 'SET_DATA', payload: localData });
  };

  // Tentar carregar do banco, fallback para local
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primeiro configurar dados locais (sistema funcionando)
        setupLocalData();
        
        // Depois tentar melhorar com dados do banco
        const responses = await Promise.allSettled([
          fetch(`${API_BASE}/products`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/flavors/pizza`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/flavors/esfiha`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/delivery/persons`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/orders`).then(r => r.ok ? r.json() : null),
        ]);

        // Se conseguiu dados do banco, complementar/atualizar
        const [products, pizzaFlavors, esfihaFlavors, deliveryPersons, orders] = responses.map(
          result => result.status === 'fulfilled' && result.value ? result.value : null
        );

        const updateData: any = {};
        
        if (products && products.length > 0) {
          updateData.products = products;
        }
        if (pizzaFlavors && pizzaFlavors.length > 0) {
          updateData.pizzaFlavors = pizzaFlavors;
        }
        if (esfihaFlavors && esfihaFlavors.length > 0) {
          updateData.esfihaFlavors = esfihaFlavors;
        }
        if (deliveryPersons && deliveryPersons.length > 0) {
          updateData.deliveryPersons = deliveryPersons;
        }
        if (orders && orders.length > 0) {
          updateData.orders = orders;
          updateData.orderCounter = Math.max(...orders.map((o: any) => o.orderNumber || 0)) + 1;
        }

        if (Object.keys(updateData).length > 0) {
          dispatch({ type: 'SET_DATA', payload: updateData });
          console.log('Dados atualizados do banco:', Object.keys(updateData));
        }

      } catch (error) {
        console.log('Banco offline, usando dados locais');
        // setupLocalData já foi chamado, sistema continua funcionando
      }
    };

    loadData();
  }, []);

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
