import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // Usamos o location para forçar a re-renderização quando a rota muda
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // 1. Busca o token no localStorage
    const token = localStorage.getItem('@EliteTickets:token');
    
    if (token) {
      setIsLoggedIn(true);
      try {
        // 2. O JWT tem 3 partes separadas por ponto. A parte 1 é o payload (dados).
        // Usamos atob() para decodificar a base64 dessa parte.
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        // 3. Salva a role no estado ('ORGANIZADOR', 'CLIENTE', etc.)
        setUserRole(decodedPayload.role); 
      } catch (error) {
        console.error("Erro ao decodificar o token no Header:", error);
        handleLogout(); // Se o token for inválido/corrompido, desloga por segurança
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [location.pathname]); // Executa novamente sempre que o usuário navega

  function handleLogout() {
    localStorage.removeItem('@EliteTickets:token');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login');
  }

  return (
    <header className="bg-brand-500 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-white hover:text-brand-100 transition">
          Elite<span className="text-brand-200">Tickets</span>
        </Link>

        {/* Navegação Dinâmica */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-white hover:text-brand-200 font-semibold transition">
                Entrar
              </Link>
              <Link to="/cadastro" className="bg-brand-400 hover:bg-brand-300 text-white font-bold py-2 px-5 rounded shadow transition">
                Cadastrar
              </Link>
            </>
          ) : (
            <>
              {/* Opções específicas do ORGANIZADOR */}
              {userRole === 'ORGANIZADOR' && (
                <Link to="/organizador" className="text-white hover:text-brand-200 font-semibold transition">
                  Painel de Gestão
                </Link>
              )}
              
              {/* Opções específicas do CLIENTE */}
              {userRole === 'CLIENTE' && (
                <Link to="/dashboard" className="text-white hover:text-brand-200 font-semibold transition">
                  Meus Ingressos
                </Link>
              )}

              {/* Botão de Sair Global */}
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-400 text-white font-bold py-1.5 px-4 rounded shadow transition"
              >
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}