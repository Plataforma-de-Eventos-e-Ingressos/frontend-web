import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@EliteTickets:token');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('@EliteTickets:token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="bg-brand-500 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        
        {/* Responsividade do Título: "E.T" no mobile, "EliteTickets" no tablet/desktop */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="block sm:hidden">
            E<span className="text-brand-200">.T</span>
          </span>
          <span className="hidden sm:block">
            Elite<span className="text-brand-200">Tickets</span>
          </span>
        </Link>
        
        {/* Ajustamos o gap e o tamanho da fonte para não quebrar no mobile */}
        <nav className="flex items-center gap-3 sm:gap-6 font-semibold text-sm sm:text-base">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-brand-100 hover:text-white transition-colors">
                Painel
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-5 py-2 rounded shadow transition-transform transform hover:-translate-y-0.5"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-brand-100 hover:text-white transition-colors">
                Entrar
              </Link>
              {/* whitespace-nowrap impede que o botão quebre em duas linhas */}
              <Link 
                to="/cadastro" 
                className="bg-brand-400 hover:bg-brand-300 text-brand-200 px-3 sm:px-5 py-2 rounded shadow transition-transform transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                Criar Conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}