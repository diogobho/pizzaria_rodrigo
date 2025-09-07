import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://161.97.127.54'], credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Disponibilizar Prisma para routes
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Routes básicas para começar
app.get('/api/products', async (req, res) => {
  try {
    const products = await req.prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/api/flavors/pizza', async (req, res) => {
  try {
    const flavors = await req.prisma.pizzaFlavor.findMany();
    res.json(flavors);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sabores de pizza' });
  }
});

app.get('/api/flavors/esfiha', async (req, res) => {
  try {
    const flavors = await req.prisma.esfihaFlavor.findMany();
    res.json(flavors);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sabores de esfiha' });
  }
});

app.get('/api/delivery/persons', async (req, res) => {
  try {
    const persons = await req.prisma.deliveryPerson.findMany();
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar entregadores' });
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
