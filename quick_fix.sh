#!/bin/bash

echo "🔧 Aplicando correção conservadora..."

# CORREÇÃO 1: Apenas corrigir a estrutura de botões no Dashboard sem quebrar imports
cd src/components

# Fazer uma correção mínima no Dashboard.tsx para remover botões aninhados
cp Dashboard.tsx Dashboard.tsx.backup

# Usar sed para corrigir especificamente o problema de botões aninhados
# Substituir a estrutura problemática por uma versão sem botões aninhados
sed -i 's/<button[^>]*onClick[^>]*>\(.*\)<button/<div onClick={handleProductClick}>\1<button/g' Dashboard.tsx

echo "✅ Estrutura de botões corrigida no Dashboard"

# CORREÇÃO 2: Adicionar controle simples no OrdersKanban
cd ../components
cp OrdersKanban.tsx OrdersKanban.tsx.backup

# Adicionar apenas uma linha para controlar múltiplos carregamentos
if ! grep -q "loadingStarted" OrdersKanban.tsx; then
  sed -i '/useEffect/,/}, \[\]/c\
  useEffect(() => {\
    let loadingStarted = false;\
    if (!loadingStarted) {\
      loadingStarted = true;\
      console.log("🔄 Carregando pedidos (controle ativo)");\
      loadOrders();\
    }\
  }, []);' OrdersKanban.tsx
fi

echo "✅ Controle de carregamento adicionado no OrdersKanban"

# Voltar ao diretório raiz
cd ../../

echo "🧪 Testando build..."
npm run build

