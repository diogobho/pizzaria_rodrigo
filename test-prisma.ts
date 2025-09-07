import { PrismaClient } from '@prisma/client';

async function testPrisma() {
  console.log('🔍 Iniciando teste do Prisma...');
  
  try {
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    console.log('📦 Cliente Prisma criado');

    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');

    // Testar consulta de produtos
    console.log('🔍 Buscando produtos...');
    const products = await prisma.product.findMany();
    console.log(`✅ Encontrados ${products.length} produtos:`, products.map(p => p.name));

    // Testar consulta de pizza flavors
    console.log('🔍 Buscando sabores pizza...');
    const pizzas = await prisma.pizzaFlavor.findMany();
    console.log(`✅ Encontrados ${pizzas.length} sabores:`, pizzas.map(p => p.name));

    // Testar consulta de entregadores
    console.log('🔍 Buscando entregadores...');
    const delivery = await prisma.deliveryPerson.findMany();
    console.log(`✅ Encontrados ${delivery.length} entregadores:`, delivery.map(d => d.name));

    await prisma.$disconnect();
    console.log('�� Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

testPrisma();
