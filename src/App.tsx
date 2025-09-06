import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OrdersKanban from './components/OrdersKanban';
import ProductManagement from './components/ProductManagement';
import DeliveryManagement from './components/DeliveryManagement';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { state } = useApp();

  if (!state.user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pedidos" element={<OrdersKanban />} />
          <Route path="/produtos" element={<ProductManagement />} />
          <Route path="/entregadores" element={<DeliveryManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
