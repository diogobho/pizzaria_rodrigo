import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando dados iniciais...');

  // Hash da senha admin123
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Criar usuário admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin'
    }
  });

  // Produtos base
  await prisma.product.createMany({
    data: [
      { name: 'Massa de Pizza', category: 'bebida', price: 0, stockQuantity: 50 },
      { name: 'Massa de Esfiha', category: 'bebida', price: 0, stockQuantity: 100 },
      { name: 'Coca-Cola 2L', category: 'bebida', price: 8.00, stockQuantity: 25 },
      { name: 'Guaraná 2L', category: 'bebida', price: 8.00, stockQuantity: 20 },
      { name: 'Coca-Cola Lata', category: 'bebida', price: 3.50, stockQuantity: 48 },
      { name: 'Guaraná Lata', category: 'bebida', price: 3.50, stockQuantity: 36 },
      { name: 'Água 500ml', category: 'bebida', price: 2.00, stockQuantity: 50 },
      { name: 'Suco Natural', category: 'bebida', price: 5.00, stockQuantity: 15 },
    ],
    skipDuplicates: true
  });

  // Sabores de pizza
  await prisma.pizzaFlavor.createMany({
    data: [
      { name: 'Margherita', category: 'tradicional', price: 25.00 },
      { name: 'Calabresa', category: 'tradicional', price: 25.00 },
      { name: 'Portuguesa', category: 'tradicional', price: 25.00 },
      { name: 'Mussarela', category: 'tradicional', price: 25.00 },
      { name: 'Napolitana', category: 'tradicional', price: 25.00 },
      { name: 'Frango Catupiry', category: 'premium', price: 27.00 },
      { name: 'Bacon', category: 'premium', price: 27.00 },
      { name: 'Quatro Queijos', category: 'premium', price: 27.00 },
      { name: 'Pepperoni', category: 'premium', price: 27.00 },
      { name: 'Toscana', category: 'premium', price: 27.00 },
      { name: 'Camarão', category: 'especial', price: 32.00 },
      { name: 'Salmão', category: 'especial', price: 32.00 },
      { name: 'Vegetariana Gourmet', category: 'especial', price: 32.00 },
      { name: 'Chocolate', category: 'especial', price: 32.00 },
      { name: 'Banana Nevada', category: 'especial', price: 32.00 },
    ],
    skipDuplicates: true
  });

  // Sabores de esfiha
  await prisma.esfihaFlavor.createMany({
    data: [
      { name: 'Carne', category: 'tradicional', price: 2.50 },
      { name: 'Frango', category: 'tradicional', price: 2.50 },
      { name: 'Queijo', category: 'tradicional', price: 2.50 },
      { name: 'Pizza', category: 'tradicional', price: 2.50 },
      { name: 'Carne Seca', category: 'premium', price: 3.50 },
      { name: 'Frango Catupiry', category: 'premium', price: 3.50 },
      { name: 'Camarão', category: 'premium', price: 3.50 },
      { name: 'Chocolate', category: 'especial', price: 3.50 },
      { name: 'Doce de Leite', category: 'especial', price: 3.50 },
    ],
    skipDuplicates: true
  });

  // Entregadores
  await prisma.deliveryPerson.createMany({
    data: [
      { name: 'João Silva', transport: 'moto', phone: '(11) 91234-5678' },
      { name: 'Maria Santos', transport: 'bicicleta', phone: '(11) 92345-6789' },
      { name: 'Pedro Oliveira', transport: 'moto', phone: '(11) 93456-7890' },
      { name: 'Ana Costa', transport: 'pe', phone: '(11) 94567-8901' },
    ],
    skipDuplicates: true
  });

  console.log('✅ Dados iniciais criados com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
