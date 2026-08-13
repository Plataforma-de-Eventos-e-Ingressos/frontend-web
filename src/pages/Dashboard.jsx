import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMyTickets() {
      const token = localStorage.getItem('@EliteTickets:token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/tickets/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTickets(response.data);
      } catch (err) {
        setError('Não foi possível carregar seus ingressos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchMyTickets();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 bg-brand-100">
        <p className="text-brand-400 text-xl font-semibold animate-pulse">Buscando seus ingressos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-5xl">
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-500 mb-2 tracking-tight">
            Meus Ingressos
          </h1>
          <p className="text-brand-400">
            Gerencie suas compras e acesse seus QR Codes para entrada.
          </p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded text-center mb-8 shadow">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-brand-200">
            <p className="text-brand-400 text-lg mb-4">Você ainda não possui ingressos.</p>
            <Link 
              to="/" 
              className="inline-block bg-brand-400 hover:bg-brand-500 text-white font-bold py-2 px-6 rounded shadow transition-transform transform hover:-translate-y-0.5"
            >
              Explorar Eventos
            </Link>
          </div>
        )}

        {/* Grid de Ingressos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row border border-brand-200"
            >
              {/* Lado Esquerdo: Info do Evento */}
              <div className="p-6 flex-1 border-b sm:border-b-0 sm:border-r border-dashed border-brand-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-brand-500 line-clamp-2">
                    {ticket.event.title}
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    {ticket.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-brand-500 font-medium">
                  <p>📅 {new Date(ticket.event.event_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p>📍 {ticket.event.location}</p>
                </div>
              </div>

              {/* Lado Direito: Info do Ingresso e "QR Code" */}
              <div className="p-6 sm:w-48 bg-brand-50 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-brand-400 uppercase font-bold tracking-wider mb-1">
                  Assento
                </span>
                <span className="text-xl font-extrabold text-brand-500 mb-4">
                  {ticket.seat || 'Pista / Único'}
                </span>
                
                {/* Simulação de um código de barras / QR Code resumido */}
                <div className="w-full bg-brand-200 p-2 rounded text-xs text-brand-500 font-mono break-all truncate">
                  {ticket.qr_token.substring(0, 16)}...
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}