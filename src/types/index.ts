export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  address: string;
  complement?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'pizza-tradicional' | 'pizza-premium' | 'pizza-especial' | 'esfiha-tradicional' | 'esfiha-premium' | 'esfiha-especial' | 'bebida';
  price: number;
  inStock: boolean;
  description?: string;
  stockQuantity: number;
}

export interface PizzaOrder {
  id: string;
  format: 'inteira' | 'meia-meia';
  flavors: string[];
  border?: 'requeijao' | 'catupiry' | 'cheddar' | 'chocolate';
  extras: PizzaExtra[];
  size: 'media' | 'grande';
  quantity: number;
  totalPrice: number;
}

export interface PizzaExtra {
  name: string;
  price: number;
  location: 'toda' | 'metade1' | 'metade2';
}

export interface OrderItem {
  id: string;
  type: 'pizza' | 'esfiha' | 'bebida';
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pizzaDetails?: PizzaOrder;
  observations?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customer: Customer;
  items: OrderItem[];
  totalPrice: number;
  status: 'nao-iniciado' | 'em-andamento' | 'finalizado' | 'entregue';
  createdAt: Date;
  updatedAt: Date;
  observations?: string;
  deliveryPerson?: string;
  scheduledDateTime?: Date;
  isScheduled: boolean;
  deliveredAt?: Date;
}

export interface PizzaFlavor {
  id: string;
  name: string;
  category: 'tradicional' | 'premium' | 'especial';
  price: number;
}

export interface EsfihaFlavor {
  id: string;
  name: string;
  category: 'tradicional' | 'premium' | 'especial';
  price: number;
}

export interface DeliveryStats {
  deliveryPerson: string;
  totalDeliveries: number;
  todayDeliveries: number;
  totalValue: number;
  avgDeliveryTime?: number;
}
