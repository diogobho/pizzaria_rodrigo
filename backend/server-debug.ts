import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(express.json());

console.log('🔥 Servidor debug iniciando...');

app.get('/api/debug', (req, res) => {
  console.log('🔥 Endpoint /api/debug foi chamado!');
  res.json({ message: 'Debug endpoint funcionando!' });
});

app.get('/api/products', async (req, res) => {
  console.log('🔥 Endpoint /api/products foi chamado!');
  
  try {
    console.log('🔥 Tentando buscar produtos...');
    const products = await prisma.product.findMany();
    console.log('🔥 Produtos encontrados:', products.length);
    res.json(products);
  } catch (error) {
    console.log('🔥 ERRO:', error);
    res.status(500).json({ error: 'Erro', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Servidor debug rodando na porta ${PORT}`);
});
