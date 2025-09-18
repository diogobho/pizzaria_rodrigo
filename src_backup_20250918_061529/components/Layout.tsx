import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Home, ShoppingCart, Package, Users, LogOut, Pizza } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useApp();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/pedidos', name: 'Pedidos', icon: ShoppingCart },
    { path: '/produtos', name: 'Produtos', icon: Package },
    { path: '/entregadores', name: 'Entregadores', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-red-600 rounded-full p-2 mr-3">
                  <Pizza className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Pizzaria Rodrigo Delivery</h1>
                  <p className="text-sm text-gray-600">Sistema de Gestão de Pedidos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                📞 (11) 99999-9999
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Olá, <strong>{state.user?.name}</strong>
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === item.path
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Pizzaria Rodrigo Delivery - Sistema de Gestão de Pedidos</p>
            <p className="mt-1">Pizza Artesanal com Sabor Único • Rua das Pizzas, 123 - Centro</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
