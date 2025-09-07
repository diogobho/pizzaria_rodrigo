import React from 'react';
import { useProducts } from '../hooks/useProducts';

const TestProducts: React.FC = () => {
  const { products, loading } = useProducts();

  if (loading) return <div>Carregando produtos do banco...</div>;

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="font-bold">🎯 TESTE: Produtos do Banco de Dados</h3>
      <p>Total: {products.length} produtos</p>
      <ul className="text-sm">
        {products.slice(0, 3).map((product: any) => (
          <li key={product.id}>• {product.name} - R$ {product.price}</li>
        ))}
      </ul>
      <p className="text-green-600 font-bold mt-2">
        ✅ Dados vindo do PostgreSQL via API!
      </p>
    </div>
  );
};

export default TestProducts;
