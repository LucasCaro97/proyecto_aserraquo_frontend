import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Página Principal', href: '/' },
    { name: 'Quiénes Somos', href: '/about' },
    { name: 'Contáctanos', href: '/contact' }
  ];

  return (
    <header className="bg-white black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <img className='h-10' src="src/assets/sistemaquologo.png" alt="" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-blue-500 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <>
                {/* Si está logueado, muestra el enlace al Dashboard */}
                <Link to="/dashboard" className="text-blue-500 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Dashboard
                </Link>
                {/* Y el botón para cerrar sesión */}
                <button
                  key="logout"
                  onClick={logout}
                  className="text-blue-500 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                key="login"
                to="/login"
                className="text-blue-500 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            )}

          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isLoggedIn ? (
              <>
                {/* Si está logueado, muestra el enlace al Dashboard */}
                <Link to="/dashboard" className="hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
                  Dashboard
                </Link>
                {/* Y el botón para cerrar sesión */}
                <button
                  key="logout"
                  onClick={logout}
                  className="hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                key="login"
                to="/login"
                className="hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};