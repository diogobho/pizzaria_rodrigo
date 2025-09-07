import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({
  log: ['error'],
});
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://161.97.127.54'], credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Routes usando instância global do prisma
app.get('/api/products', async (req, res) => {
  try {
    console.log('🔍 Buscando produtos...');
    const products = await prisma.product.findMany();
    console.log(`✅ Encontrados ${products.length} produtos`);
    res.json(products);
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

app.get('/api/flavors/pizza', async (req, res) => {
  try {
    console.log('🔍 Buscando sabores de pizza...');
    const flavors = await prisma.pizzaFlavor.findMany();
    console.log(`✅ Encontrados ${flavors.length} sabores`);
    res.json(flavors);
  } catch (error: any) {
    console.error('❌ Erro ao buscar sabores de pizza:', error);
    res.status(500).json({ error: 'Erro ao buscar sabores de pizza', details: error.message });
  }
});

app.get('/api/flavors/esfiha', async (req, res) => {
  try {
    console.log('🔍 Buscando sabores de esfiha...');
    const flavors = await prisma.esfihaFlavor.findMany();
    console.log(`✅ Encontrados ${flavors.length} sabores`);
    res.json(flavors);
  } catch (error: any) {
    console.error('❌ Erro ao buscar sabores de esfiha:', error);
    res.status(500).json({ error: 'Erro ao buscar sabores de esfiha', details: error.message });
  }
});

app.get('/api/delivery/persons', async (req, res) => {
  try {
    console.log('🔍 Buscando entregadores...');
    const persons = await prisma.deliveryPerson.findMany();
    console.log(`✅ Encontrados ${persons.length} entregadores`);
    res.json(persons);
  } catch (error: any) {
    console.error('❌ Erro ao buscar entregadores:', error);
    res.status(500).json({ error: 'Erro ao buscar entregadores', details: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🗃️ Database connected`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
