import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const orders = await prisma.orders.findMany({ take: 1 });
    console.log('Orders:', orders);
    console.log('Prisma está funcionando!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
