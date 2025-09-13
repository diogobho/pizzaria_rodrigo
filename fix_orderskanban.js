const fs = require('fs');
const content = fs.readFileSync('src/components/OrdersKanban.tsx', 'utf8');

// Verificar se já tem useState para orders
if (content.includes('useState<Order[]>')) {
  console.log('OrdersKanban já tem useState - não precisa modificar');
  process.exit(0);
}

// Adicionar useState logo após outras declarações de useState
const afterStateDeclarations = `const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);`;

const newContent = content.replace(
  afterStateDeclarations,
  `${afterStateDeclarations}
  const [orders, setOrders] = useState<Order[]>(state.orders);

  // Carregar pedidos da API em tempo real
  useEffect(() => {
    const loadApiOrders = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/orders");
        if (response.ok) {
          const apiOrders = await response.json();
          setOrders(apiOrders);
          console.log("Pedidos carregados da API:", apiOrders.length);
        } else {
          setOrders(state.orders);
        }
      } catch (error) {
        console.log("API offline, usando dados locais");
        setOrders(state.orders);
      }
    };
    
    loadApiOrders();
  }, [state.orders]);`
);

// Substituir todas as ocorrências de state.orders por orders (variável local)
const finalContent = newContent
  .replace(/state\.orders(?!\.)/g, 'orders')
  .replace(/orders\.map/g, 'orders.map')
  .replace(/orders\.find/g, 'orders.find')
  .replace(/orders\.filter/g, 'orders.filter')
  .replace(/orders\.reduce/g, 'orders.reduce');

fs.writeFileSync('src/components/OrdersKanban.tsx', finalContent);
console.log('OrdersKanban corrigido com integração API!');
