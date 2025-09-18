#!/bin/bash

echo "🔧 Corrigindo sintaxe JavaScript no server.js..."

# Backup automático
cp server.js server.js.backup-$(date +%Y%m%d_%H%M%S)

# Corrigir sintaxe JavaScript incorreta
sed -i 's/\.rows\[0\]\.\(".*"\)/\.rows[0][\1]/g' server.js
sed -i 's/\.rows\[0\]\.\(createdAt\)/\.rows[0]["createdAt"]/g' server.js
sed -i 's/\.rows\[0\]\.\(customerId\)/\.rows[0]["customerId"]/g' server.js
sed -i 's/\.rows\[0\]\.\(deliveryPersonId\)/\.rows[0]["deliveryPersonId"]/g' server.js

echo "✅ Correções aplicadas!"

# Verificar sintaxe
echo "🧪 Verificando sintaxe..."
if node -c server.js; then
    echo "✅ Sintaxe JavaScript válida!"
else
    echo "❌ Ainda há problemas de sintaxe"
    exit 1
fi

echo "🔄 Reiniciando backend..."
pm2 restart pizzaria-backend

echo "📊 Verificando logs..."
pm2 logs pizzaria-backend --lines 10 --nostream

echo "🧪 Testando API..."
sleep 2
if curl -s http://localhost:3001/api/orders > /dev/null; then
    echo "✅ API está respondendo!"
else
    echo "❌ API ainda não está respondendo"
fi
