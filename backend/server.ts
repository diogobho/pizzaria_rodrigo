import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://161.97.127.54:5174', 'http://161.97.127.54:5175'] 
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'Connected' });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pizza flavors
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

// Esfiha flavors
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

// Delivery persons
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

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
