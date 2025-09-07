import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://161.97.127.54'] }));
app.use(express.json());

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'Connected' });
});

// ===== PRODUCTS =====
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== STOCK MANAGEMENT =====
app.post('/api/products/:id/reduce-stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stockQuantity: product.stockQuantity - quantity,
        inStock: product.stockQuantity - quantity > 0
      }
    });

    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PIZZA FLAVORS =====
app.get('/api/flavors/pizza', async (req, res) => {
  try {
    const flavors = await prisma.pizzaFlavor.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json(flavors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flavors/pizza', async (req, res) => {
  try {
    const flavor = await prisma.pizzaFlavor.create({ data: req.body });
    res.json(flavor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flavors/pizza/:id', async (req, res) => {
  try {
    const flavor = await prisma.pizzaFlavor.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(flavor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ESFIHA FLAVORS =====
app.get('/api/flavors/esfiha', async (req, res) => {
  try {
    const flavors = await prisma.esfihaFlavor.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json(flavors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flavors/esfiha', async (req, res) => {
  try {
    const flavor = await prisma.esfihaFlavor.create({ data: req.body });
    res.json(flavor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flavors/esfiha/:id', async (req, res) => {
  try {
    const flavor = await prisma.esfihaFlavor.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(flavor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DELIVERY PERSONS =====
app.get('/api/delivery/persons', async (req, res) => {
  try {
    const persons = await prisma.deliveryPerson.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(persons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delivery/persons', async (req, res) => {
  try {
    const person = await prisma.deliveryPerson.create({ data: req.body });
    res.json(person);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/delivery/persons/:id', async (req, res) => {
  try {
    const person = await prisma.deliveryPerson.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(person);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/delivery/persons/:id', async (req, res) => {
  try {
    await prisma.deliveryPerson.update({
      where: { id: req.params.id },
      data: { active: false }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CUSTOMERS =====
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/phone/:phone', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { phone: req.params.phone }
    });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// ===== ORDERS SYSTEM =====
app.get('/api/orders', async (req, res) => {
  try {
    const { date, status } = req.query;
    const where: any = {};
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        deliveryPerson: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, deliveryPersonId, observations, isScheduled, scheduledDateTime } = req.body;

    // Validações de negócio
    if (!customer.name || !customer.phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Dados obrigatórios não preenchidos' });
    }

    if (!deliveryPersonId) {
      return res.status(400).json({ error: 'Entregador é obrigatório' });
    }

    // Validar agendamento
    if (isScheduled) {
      if (!scheduledDateTime) {
        return res.status(400).json({ error: 'Data/hora obrigatória para agendamento' });
      }
      const scheduleDate = new Date(scheduledDateTime);
      if (scheduleDate <= new Date()) {
        return res.status(400).json({ error: 'Data/hora deve ser no futuro' });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar ou criar cliente
      let customerRecord = await tx.customer.findUnique({
        where: { phone: customer.phone }
      });

      if (!customerRecord) {
        customerRecord = await tx.customer.create({ data: customer });
      } else {
        customerRecord = await tx.customer.update({
          where: { id: customerRecord.id },
          data: customer
        });
      }

      // 2. Obter próximo número do pedido
      const lastOrder = await tx.order.findFirst({
        orderBy: { orderNumber: 'desc' }
      });
      const orderNumber = (lastOrder?.orderNumber || 0) + 1;

      // 3. Calcular preço total
      const totalPrice = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

      // 4. Criar pedido
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          deliveryPersonId,
          totalPrice,
          observations,
          isScheduled: isScheduled || false,
          scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
          status: 'nao-iniciado'
        }
      });

      // 5. Criar itens do pedido
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: order.id,
          type: item.type,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          observations: item.observations,
          pizzaDetails: item.pizzaDetails ? JSON.stringify(item.pizzaDetails) : null
        }))
      });

      // 6. Reduzir estoque para bebidas
      for (const item of items) {
        if (item.type === 'bebida' && item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
                inStock: product.stockQuantity - item.quantity > 0
              }
            });
          }
        }
      }

      return order;
    });

    res.json(result);
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = { ...req.body };

    // Se mudando para entregue, adicionar timestamp
    if (updateData.status === 'entregue') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: true,
        deliveryPerson: true,
        items: true
      }
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      // Deletar itens primeiro
      await tx.orderItem.deleteMany({
        where: { orderId: req.params.id }
      });
      
      // Deletar pedido
      await tx.order.delete({
        where: { id: req.params.id }
      });
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== STATISTICS =====
app.get('/api/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, totalRevenue, ordersByStatus] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { totalPrice: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: today, lt: tomorrow } },
        _count: true
      })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as any)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
