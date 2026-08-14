import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTickets();
  }, [navigate]);

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

  // Função para cancelar o ingresso
  async function handleCancelTicket(ticketId) {
    const confirm = window.confirm("Tem certeza que deseja cancelar este ingresso? Você perderá sua vaga.");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('@EliteTickets:token');
      await api.patch(`/tickets/${ticketId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Ingresso cancelado com sucesso!");
      fetchMyTickets(); // Atualiza a lista na tela
    } catch (error) {
      alert("Erro ao cancelar o ingresso.");
      console.error(error);
    }
  }

  async function handlePayTicket(ticketId) {
    try {
      const token = localStorage.getItem('@EliteTickets:token');
      await api.post(`/tickets/${ticketId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Pagamento realizado com sucesso!");
      fetchMyTickets(); // Atualiza a tela
    } catch (error) {
      alert(error.response?.data?.detail || "Erro ao processar pagamento.");
    }
  }

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
        
        {/* Botão de Voltar para a Home */}
        <div className="mb-6">
          <Link to="/" className="text-brand-500 hover:text-brand-600 font-bold flex items-center gap-2 transition">
            &larr; Voltar para Eventos
          </Link>
        </div>

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
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-brand-200"
            >
              {/* Exibição do Cartaz do Evento (mesma lógica inteligente do organizador) */}
              {ticket.event.poster_url ? (
                <img 
                  src={ticket.event.poster_url.startsWith('http') ? ticket.event.poster_url : `https://image.tmdb.org/t/p/w500${ticket.event.poster_url}`} 
                  alt={ticket.event.title} 
                  className="w-full h-40 object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x300?text=Imagem+Indisponível';
                  }}
                />
              ) : (
                <div className="w-full h-24 bg-brand-50 flex items-center justify-center border-b border-brand-200">
                  <span className="text-brand-300 text-sm font-medium">🎟️ {ticket.event.title}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row flex-1">
                {/* Lado Esquerdo: Info do Evento */}
                <div className="p-6 flex-1 border-b sm:border-b-0 sm:border-r border-dashed border-brand-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-brand-500 line-clamp-2">
                      {ticket.event.title}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-brand-500 font-medium mb-4">
                    <p>📅 {new Date(ticket.event.event_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p>📍 {ticket.event.location}</p>
                  </div>

                  <div className="flex gap-4 items-center">
                    {ticket.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleCancelTicket(ticket.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold underline transition"
                      >
                        Cancelar
                      </button>
                    )}

                    {/* Novo Botão de Pagar */}
                    {ticket.status === 'RESERVED' && (
                      <button 
                        onClick={() => handlePayTicket(ticket.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow transition"
                      >
                        Pagar Agora 💳
                      </button>
                    )}
                  </div>


                </div>

                {/* Lado Direito: Assento e QR Code Visual */}
                <div className={`p-6 sm:w-48 flex flex-col justify-center items-center text-center ${ticket.status === 'CANCELLED' ? 'bg-gray-100 opacity-50' : 'bg-brand-50'}`}>
                  <span className="text-xs text-brand-400 uppercase font-bold tracking-wider mb-2">
                    Assento
                  </span>
                  <span className="text-xl font-extrabold text-brand-500 mb-4">
                    {ticket.seat || 'Pista'}
                  </span>
                  
                  {ticket.status === 'PAID' ? (
                    <div className="flex flex-col items-center">
                      {/* Gerador automático de imagem de QR Code baseado no token */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.qr_token}`} 
                        alt="QR Code do Ingresso"
                        className="w-24 h-24 object-contain rounded bg-white p-1 shadow-sm border border-brand-200 mb-1"
                      />
                      <span className="text-[10px] text-brand-400 font-mono">Apresente na entrada</span>
                    </div>
                  ) : ticket.status === 'RESERVED' ? (
                    <span className="text-xs text-yellow-600 font-bold px-2 py-1 bg-yellow-50 rounded">
                      Pendente Pagamento
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold text-sm">Cancelado</span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}