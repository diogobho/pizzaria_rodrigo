app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             c.name, c.phone, c.address,
             dp.name as delivery_person_name
      FROM orders o
      JOIN customers c ON o."customerId" = c.id
      LEFT JOIN delivery_persons dp ON o."deliveryPersonId" = dp.id
      ORDER BY o."createdAt" DESC
    `);
    
    // Formatar para o frontend
    const formattedOrders = result.rows.map(order => ({
      ...order,
      customer: {
        name: order.name,
        phone: order.phone,
        address: order.address
      }
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.json([]);
  });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

// Configuração PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pizzaria_db',
  password: 'senha',
  port: 5432,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://161.97.127.54:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// PRODUTOS COM REGRAS DE NEGÓCIO
app.get('/api/products', async (req, res) => {
  try {
    // Buscar produtos base (bebidas e massas)
    const productsResult = await pool.query(`
      SELECT id, name, category, price, stock, in_stock, 
             CASE WHEN category = 'massa' THEN 'CONTROLE' ELSE category END as display_category
      FROM products 
      ORDER BY 
        CASE category 
          WHEN 'massa' THEN 1 
          WHEN 'bebida' THEN 2 
          ELSE 3 
        END, 
        name
    `);
    
    // Buscar sabores de pizza
    const pizzaFlavorsResult = await pool.query(`
      SELECT id, name, category, price 
      FROM pizza_flavors 
      WHERE active = true 
      ORDER BY category, name
    `);
    
    // Buscar sabores de esfiha
    const esfihaFlavorsResult = await pool.query(`
      SELECT id, name, category, price 
      FROM esfiha_flavors 
      WHERE active = true 
      ORDER BY category, name
    `);
    
    // Buscar quantidade de massas
    const massaPizza = productsResult.rows.find(p => p.name === 'Massa de Pizza')?.stock || 0;
    const massaEsfiha = productsResult.rows.find(p => p.name === 'Massa de Esfiha')?.stock || 0;
    
    // Montar resposta com regras de negócio
    const response = [];
    
    // Produtos base (bebidas e controle de massa)
    productsResult.rows.forEach(product => {
      response.push({
        id: product.id,
        name: product.name,
        category: product.display_category,
        price: product.price,
        stock: product.stock,
        inStock: product.in_stock,
        type: product.category === 'massa' ? 'massa-control' : 'produto'
      });
    });
    
    // Sabores de pizza (baseados na massa)
    pizzaFlavorsResult.rows.forEach(flavor => {
      response.push({
        id: `pizza-${flavor.id}`,
        name: `Pizza ${flavor.name}`,
        category: `Pizza ${flavor.category.charAt(0).toUpperCase() + flavor.category.slice(1)}`,
        price: flavor.price,
        stock: massaPizza,
        inStock: massaPizza > 0,
        type: 'pizza-flavor',
        baseStock: '* Baseado na massa disponível'
      });
    });
    
    // Sabores de esfiha (baseados na massa)
    esfihaFlavorsResult.rows.forEach(flavor => {
      response.push({
        id: `esfiha-${flavor.id}`,
        name: `Esfiha ${flavor.name}`,
        category: `Esfiha ${flavor.category.charAt(0).toUpperCase() + flavor.category.slice(1)}`,
        price: flavor.price,
        stock: massaEsfiha,
        inStock: massaEsfiha > 0,
        type: 'esfiha-flavor',
        baseStock: '* Baseado na massa disponível'
      });
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    
    // FALLBACK com dados mock seguindo regras de negócio
    const mockData = [
      // Controle de massa
      { id: 'massa-pizza', name: 'Massa de Pizza', category: 'CONTROLE', price: 0, stock: 50, inStock: true, type: 'massa-control' },
      { id: 'massa-esfiha', name: 'Massa de Esfiha', category: 'CONTROLE', price: 0, stock: 0, inStock: false, type: 'massa-control' },
      
      // Bebidas
      { id: 'coca-2l', name: 'Coca-Cola 2L', category: 'Bebidas', price: 8.00, stock: 25, inStock: true, type: 'produto' },
      { id: 'guarana-2l', name: 'Guaraná 2L', category: 'Bebidas', price: 8.00, stock: 20, inStock: true, type: 'produto' },
      { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'Bebidas', price: 3.50, stock: 48, inStock: true, type: 'produto' },
      { id: 'suco', name: 'Suco Natural', category: 'Bebidas', price: 5.00, stock: 15, inStock: true, type: 'produto' },
      
      // Pizzas (baseadas na massa)
      { id: 'pizza-margherita', name: 'Pizza Margherita', category: 'Pizza Tradicional', price: 25.00, stock: 50, inStock: true, type: 'pizza-flavor', baseStock: '* Baseado na massa disponível' },
      { id: 'pizza-calabresa', name: 'Pizza Calabresa', category: 'Pizza Tradicional', price: 28.00, stock: 50, inStock: true, type: 'pizza-flavor', baseStock: '* Baseado na massa disponível' },
      
      // Esfihas (baseadas na massa - fora de estoque)
      { id: 'esfiha-carne', name: 'Esfiha Carne', category: 'Esfiha Tradicional', price: 2.50, stock: 0, inStock: false, type: 'esfiha-flavor', baseStock: '* Baseado na massa disponível' },
      { id: 'esfiha-frango', name: 'Esfiha Frango', category: 'Esfiha Tradicional', price: 2.50, stock: 0, inStock: false, type: 'esfiha-flavor', baseStock: '* Baseado na massa disponível' },
    ];
    
    res.json(mockData);
  }
});

// PEDIDOS com validação de estoque
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer, items, totalPrice, deliveryPersonId, observations } = req.body;
    
    // VALIDAR ESTOQUE ANTES DE CRIAR PEDIDO
    for (const item of items) {
      if (item.type === 'pizza' || item.type === 'esfiha') {
        // Verificar massa disponível
        const massaType = item.type === 'pizza' ? 'Massa de Pizza' : 'Massa de Esfiha';
        const massaResult = await client.query('SELECT stock FROM products WHERE name = $1', [massaType]);
        
        if (massaResult.rows.length === 0 || massaResult.rows[0].stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: `Estoque insuficiente para ${item.productName}. Massa disponível: ${massaResult.rows[0]?.stock || 0}` 
          });
        }
      } else if (item.type === 'bebida' && item.productId) {
        // Verificar estoque de bebida
        const produtoResult = await client.query('SELECT stock FROM products WHERE id = $1', [item.productId]);
        
        if (produtoResult.rows.length === 0 || produtoResult.rows[0].stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: `Estoque insuficiente para ${item.productName}. Disponível: ${produtoResult.rows[0]?.stock || 0}` 
          });
        }
      }
    }
    
    // Inserir/buscar cliente
    let customerResult = await client.query('SELECT id FROM customers WHERE phone = $1', [customer.phone]);
    
    let customerId;
    if (customerResult.rows.length === 0) {
      const newCustomer = await client.query(
        'INSERT INTO customers (name, phone, address, complement) VALUES ($1, $2, $3, $4) RETURNING id',
        [customer.name, customer.phone, customer.address, customer.complement || null]
      );
      customerId = newCustomer.rows[0].id;
    } else {
      customerId = customerResult.rows[0].id;
    }
    
    // Gerar número do pedido
    const orderNumberResult = await client.query('SELECT COALESCE(MAX(order_number), 0) + 1 as next_number FROM orders');
    const orderNumber = orderNumberResult.rows[0].next_number;
    
    // Inserir pedido
    const orderResult = await client.query(
      `INSERT INTO orders ("orderNumber", "customerId", "deliveryPersonId", "totalPrice", status, observations) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, "createdAt"`,
      [orderNumber, customerId, deliveryPersonId, totalPrice, 'nao-iniciado', observations]
    );
    
    const orderId = orderResult.rows[0].id;
    const createdAt = orderResult.rows[0].created_at;
    
    // Inserir itens e REDUZIR ESTOQUE
    for (const item of items) {
      // Inserir item
      await client.query(
        `INSERT INTO order_items ("orderId", "productName", quantity, "unitPrice", "totalPrice", type) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.productName, item.quantity, item.unitPrice, item.totalPrice, item.type || 'bebida']
      );
      
      // Reduzir estoque conforme regra de negócio
      if (item.type === 'pizza') {
        await client.query('UPDATE products SET stock = stock - $1 WHERE name = $2', [item.quantity, 'Massa de Pizza']);
      } else if (item.type === 'esfiha') {
        await client.query('UPDATE products SET stock = stock - $1 WHERE name = $2', [item.quantity, 'Massa de Esfiha']);
      } else if (item.type === 'bebida' && item.productId) {
        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.productId]);
      }
    }
    
    // Atualizar status in_stock
    await client.query('UPDATE products SET in_stock = (stock > 0)');
    
    await client.query('COMMIT');
    
    console.log(`✅ Pedido #${orderNumber} criado - estoque atualizado`);
    
    res.status(201).json({
      id: orderId,
      orderNumber,
      customer,
      items,
      totalPrice,
      status: 'nao-iniciado',
      createdAt,
      updatedAt: createdAt,
      message: `Pedido #${orderNumber} criado com sucesso!`
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Outras rotas existentes...
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as "customerName", c.phone as "customerPhone", c.address as "customerAddress",
             dp.name as delivery_person_name
      FROM orders o
      JOIN customers c ON o."customerId" = c.id
      LEFT JOIN delivery_persons dp ON o."deliveryPersonId" = dp.id
      ORDER BY o."createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.json([]);
  });
  }
});

app.get('/api/delivery-persons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_persons WHERE active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar entregadores:', error);
    const mockDelivery = [
      { id: 1, name: 'João Silva', transport: 'moto', phone: '(11) 91234-5678', active: true },
      { id: 2, name: 'Maria Santos', transport: 'moto', phone: '(11) 92345-6789', active: true },
      { id: 3, name: 'Pedro Oliveira', transport: 'bicicleta', phone: '(11) 93456-7890', active: true },
      { id: 4, name: 'Ana Costa', transport: 'pe', phone: '(11) 94567-8901', active: true },
    ];
    res.json(mockDelivery);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`🍕 Regras de negócio implementadas:`);
  console.log(`   - Pizzas baseadas em massa de pizza`);
  console.log(`   - Esfihas baseadas em massa de esfiha`);
  console.log(`   - Controle de estoque automático`);
});
