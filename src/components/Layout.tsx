import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Pizza, Home, ShoppingBag, Package, LogOut, Phone } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useApp();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Deseja sair do sistema?')) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
    { name: 'Produtos', href: '/produtos', icon: Package },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-red-600 rounded-lg p-2 mr-4">
                <Pizza className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Pizzaria Rodrigo Delivery</h1>
                <p className="text-sm text-gray-600">Sistema de Gestão de Pedidos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">(11) 99999-9999</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {state.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Sair do sistema"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-4 text-sm font-medium transition-colors border-b-2 ${
                    active
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
      <main>{children}</main>

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