#!/bin/bash

echo "🔧 Aplicando correções específicas..."

# Backup adicional
echo "📋 Criando backup de segurança..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

# CORREÇÃO 1: Dashboard.tsx - Remover botões aninhados
echo "🔧 Corrigindo botões aninhados no Dashboard..."
cd src/components

# Criar versão corrigida do Dashboard
cat > Dashboard_fixed.tsx << 'DASHBOARD_EOF'
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import PizzaBuilder from './PizzaBuilder';

const Dashboard = () => {
  const { orders, products, loadOrders, loadProducts } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('pizza');
  const [showPizzaBuilder, setShowPizzaBuilder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.category === selectedCategory
  );

  // ✅ CORREÇÃO: Função separada para selecionar produto
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product.category === 'pizza') {
      setShowPizzaBuilder(true);
    }
  };

  // ✅ CORREÇÃO: Função separada para adicionar produto
  const handleAddProduct = (product) => {
    console.log('Adicionando produto:', product.name);
    // Implementar lógica de adicionar ao carrinho
  };

  if (showPizzaBuilder) {
    return (
      <PizzaBuilder
        onBack={() => setShowPizzaBuilder(false)}
        selectedMass={selectedProduct}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seção de Produtos - ✅ CORREÇÃO APLICADA */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Produtos</h2>
              
              {/* Categorias */}
              <div className="flex space-x-4 mb-6">
                {['pizza', 'esfiha', 'bebida'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedCategory === category
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Lista de Produtos - ✅ ESTRUTURA CORRIGIDA */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border rounded-lg p-3">
                    {/* ✅ CORREÇÃO: Área clicável separada do botão */}
                    <div 
                      onClick={() => handleSelectProduct(product)}
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                            <p className="text-xs text-orange-600">
                              Estoque baixo: {product.stockQuantity} unidades
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            R$ {product.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* ✅ CORREÇÃO: Botão separado da área clicável */}
                    <div className="mt-3 flex justify-end">
                      {product.inStock && product.stockQuantity > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir conflito com o click do produto
                            handleAddProduct(product);
                          }}
                          className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          + Adicionar
                        </button>
                      ) : (
                        <span className="text-xs bg-gray-400 text-white px-3 py-1 rounded">
                          Sem estoque
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo de Pedidos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="border-l-4 border-red-600 pl-3">
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customer?.name}</p>
                  <p className="text-sm font-semibold text-red-600">
                    R$ {order.totalPrice?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
DASHBOARD_EOF

# Substituir arquivo original
mv Dashboard.tsx Dashboard.tsx.original
mv Dashboard_fixed.tsx Dashboard.tsx

echo "✅ Dashboard.tsx corrigido!"

# CORREÇÃO 2: OrdersKanban.tsx - Controlar múltiplos carregamentos
echo "🔧 Corrigindo múltiplos carregamentos no OrdersKanban..."

# Backup do OrdersKanban original
cp OrdersKanban.tsx OrdersKanban.tsx.original

# Aplicar correção pontual no useEffect
sed -i '/useEffect.*{/a\
  const loadedRef = React.useRef(false);\
  if (loadedRef.current) return;\
  loadedRef.current = true;' OrdersKanban.tsx

# Adicionar import do useRef se não existir
if ! grep -q "useRef" OrdersKanban.tsx; then
  sed -i 's/import React/import React, { useRef }/' OrdersKanban.tsx
fi

echo "✅ OrdersKanban.tsx corrigido!"

# CORREÇÃO 3: AppContext.tsx - Melhorar gerenciamento de estado
echo "🔧 Melhorando gerenciamento de estado no AppContext..."
cd ../contexts

# Backup do contexto original
cp AppContext.tsx AppContext.tsx.original

# Adicionar função addOrder se não existir
if ! grep -q "addOrder" AppContext.tsx; then
  sed -i '/setOrders.*\[\]/a\
\
  const addOrder = (newOrder) => {\
    setOrders(prevOrders => [newOrder, ...prevOrders]);\
    console.log("✅ Novo pedido adicionado ao estado:", newOrder.orderNumber);\
  };' AppContext.tsx

  # Adicionar ao contexto value
  sed -i 's/value={{.*orders.*loadOrders.*}}/value={{ orders, loadOrders, addOrder }}/' AppContext.tsx
fi

echo "✅ AppContext.tsx melhorado!"

# Voltar ao diretório raiz
cd ../../

echo "🔄 Rebuilding aplicação..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build bem-sucedido!"
  
  echo "🔄 Reiniciando frontend..."
  pm2 restart pizzaria-frontend
  
  echo "⏳ Aguardando inicialização..."
  sleep 3
  
  echo "🧪 Testando aplicação..."
  if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Aplicação está funcionando!"
    echo "🌐 Acesse: http://$(curl -s ifconfig.me):5173"
  else
    echo "❌ Aplicação não está respondendo"
  fi
else
  echo "❌ Erro no build. Verificando logs..."
  npm run build
fi

echo "📊 Para monitorar: pm2 logs pizzaria-frontend"
echo "🎯 Teste criando um pedido para verificar se os problemas foram corrigidos!"

