import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [seat, setSeat] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Evento não encontrado ou indisponível.');
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [id]);

  const handleReserve = async () => {
    // 1. Verifica se está logado
    const token = localStorage.getItem('@EliteTickets:token');
    if (!token) {
      alert("Você precisa estar logado para comprar um ingresso.");
      navigate('/login');
      return;
    }

    setIsReserving(true);
    setReserveError('');

    try {
      // 2. Dispara a requisição para a rota que acabamos de criar
      await api.post(
        '/tickets/reserve',
        {
          event_id: id,
          seat: seat || null // Envia null se o campo estiver vazio
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 3. Sucesso!
      setReserveSuccess(true);
      
      // Aguarda 2 segundos e redireciona para o painel
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      // Pega a mensagem de erro da nossa API (ex: "Assento já reservado")
      const errorMessage = err.response?.data?.detail || 'Erro ao processar a reserva.';
      setReserveError(errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 bg-brand-100">
        <p className="text-brand-400 text-xl font-semibold animate-pulse">Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !event) {
    // ... (Mantenha o bloco de erro que já tínhamos)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-100">
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
          <p className="text-lg font-semibold">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-white text-red-600 px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors">
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* NOVO: Botão de Voltar */}
        <button 
          onClick={() => navigate(-1)} 
          className="text-brand-500 hover:text-brand-400 mb-4 flex items-center gap-2 font-semibold transition-colors w-fit"
        >
          &larr; Voltar para a Vitrine
        </button>
      </div>
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-200">
        
        {/* Imagem de Capa */}
        <div className="w-full h-96 bg-gray-900 overflow-hidden rounded-t-xl flex items-center justify-center relative">
          {event.poster_url ? (
            <img 
              src={event.poster_url.startsWith('http') ? event.poster_url : `https://image.tmdb.org/t/p/w500${event.poster_url}`} 
              alt={event.title} 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/500x300?text=Imagem+Indisponível';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl bg-brand-500">
              {event.title}
            </div>
          )}
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8">
          {/* Informações do Evento */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-brand-500 mb-4">{event.title}</h1>
            <p className="text-brand-400 text-lg mb-6 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
            
            <div className="space-y-3 text-brand-500 font-semibold text-lg">
              <p>📅 {new Date(event.event_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p>📍 {event.location}</p>
              <p>👥 Capacidade: {event.total_capacity}</p>
            </div>
          </div>

          {/* Painel de Checkout */}
          <div className="w-full md:w-80 bg-brand-100 p-6 rounded-xl border border-brand-200 h-fit flex flex-col shadow-inner">
            <span className="text-brand-400 font-semibold mb-2 text-sm uppercase tracking-wider">Valor do Ingresso</span>
            <span className="text-4xl font-bold text-brand-500 mb-6">
              R$ {event.price.toFixed(2)}
            </span>

            {/* Input de Assento (Opcional) */}
            <div className="mb-4">
              <label className="block text-brand-500 text-sm font-bold mb-2">
                Escolher Assento (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Ex: A-15, Pista" 
                className="w-full px-3 py-2 border border-brand-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-400 text-brand-500"
                value={seat}
                onChange={(e) => setSeat(e.target.value)}
                disabled={isReserving || reserveSuccess}
              />
            </div>

            {/* Alertas de Erro ou Sucesso */}
            {reserveError && (
              <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center font-semibold border border-red-200">
                {reserveError}
              </div>
            )}
            
            {reserveSuccess && (
              <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm text-center font-semibold border border-green-200">
                Reserva confirmada! Redirecionando...
              </div>
            )}

            <button 
              onClick={handleReserve}
              disabled={isReserving || reserveSuccess}
              className={`w-full text-white font-bold py-4 rounded shadow-lg transition-transform transform text-lg mb-4 
                ${isReserving || reserveSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-400 hover:bg-brand-500 hover:-translate-y-1'}`}
            >
              {isReserving ? 'Processando...' : 'Confirmar Reserva'}
            </button>
            <p className="text-xs text-center text-brand-400">
              Compra 100% segura e criptografada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}