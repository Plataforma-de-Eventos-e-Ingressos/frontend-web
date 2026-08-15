import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reserveSuccess, setReserveSuccess] = useState(false);


  const [quantity, setQuantity] = useState(1); 
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);

  useEffect(() => {
    async function fetchEventData() {
      try {
        const eventRes = await api.get(`/events/${id}`);
        const eventData = eventRes.data;
        setEvent(eventData);

        if (eventData.has_assigned_seats) {
          const seatsRes = await api.get(`/events/${id}/seats`);
          setSeats(seatsRes.data);
        }
      } catch (err) {
        setError('Evento não encontrado ou indisponível.');
      } finally {
        setLoading(false);
      }
    }
    fetchEventData();
  }, [id]);

  const handleReserve = async () => {
    const token = localStorage.getItem('@EliteTickets:token');
    if (!token) {
      alert("Você precisa estar logado para comprar um ingresso.");
      navigate('/login');
      return;
    }

    if (event.has_assigned_seats && selectedSeatIds.length === 0) {
      setReserveError('Você precisa selecionar pelo menos um assento no mapa.');
      return;
    }
    if (!event.has_assigned_seats && quantity < 1) {
      setReserveError('A quantidade deve ser pelo menos 1.');
      return;
    }

    setIsReserving(true);
    setReserveError('');

    try {
      const payload = {
        event_id: id,
        ...(event.has_assigned_seats 
              ? { seat_ids: selectedSeatIds } 
              : { quantity: parseInt(quantity) })
      };

      await api.post('/tickets/reserve', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReserveSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao processar a reserva. Pode haver conflito com outros usuários.';
      setReserveError(errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(seatsByRow).sort();

  const toggleSeatSelection = (seat) => {
    if (seat.status !== 'available') return;

    setSelectedSeatIds(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id);
      } else {
        return [...prev, seat.id];
      }
    });
  };

  const selectedCount = event?.has_assigned_seats ? selectedSeatIds.length : quantity;
  const totalPrice = (event?.price * selectedCount) || 0;


  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 bg-brand-100">
        <p className="text-brand-400 text-xl font-semibold animate-pulse">Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-100">
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
          <p className="text-lg font-semibold">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 bg-white text-red-600 px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors">
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-5xl">
        <button 
          onClick={() => navigate(-1)} 
          className="text-brand-500 hover:text-brand-400 mb-4 flex items-center gap-2 font-semibold transition-colors w-fit"
        >
          &larr; Voltar para a Vitrine
        </button>
      </div>

      <div className="container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-200">
        
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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-extrabold text-brand-500">{event.title}</h1>
              {event.has_assigned_seats && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Lugar Marcado
                </span>
              )}
            </div>
            
            <p className="text-brand-400 text-lg mb-6 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
            
            <div className="space-y-3 text-brand-500 font-semibold text-lg">
              <p>📅 {new Date(event.event_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p>📍 {event.location}</p>
              <p>👥 Capacidade Total: {event.total_capacity}</p>
            </div>
          </div>

          <div className="w-full md:w-80 bg-brand-50 p-6 rounded-xl border border-brand-200 h-fit flex flex-col shadow-sm">
            <span className="text-brand-400 font-semibold mb-2 text-sm uppercase tracking-wider">Total a pagar</span>
            <span className="text-4xl font-bold text-brand-500 mb-6 border-b border-brand-100 pb-4">
              R$ {totalPrice.toFixed(2)}
            </span>

            {event.has_assigned_seats ? (
              <div className="mb-6">
                <p className="text-brand-500 text-sm font-bold mb-2">Ingressos Selecionados:</p>
                <div className="flex justify-between items-center bg-white border border-brand-200 p-3 rounded mb-3">
                  <span className="text-brand-400 font-medium">{selectedSeatIds.length} assento(s)</span>
                  <button 
                    onClick={() => setIsSeatMapOpen(true)}
                    className="text-sm bg-brand-100 hover:bg-brand-200 text-brand-600 font-bold py-1 px-3 rounded transition"
                  >
                    Abrir Mapa
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-brand-500 text-sm font-bold mb-2">
                  Quantidade de Ingressos
                </label>
                <div className="flex items-center gap-4 bg-white border border-brand-200 p-2 rounded">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-600 font-bold rounded hover:bg-brand-200">-</button>
                  <span className="flex-1 text-center font-bold text-brand-600 text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-600 font-bold rounded hover:bg-brand-200">+</button>
                </div>
              </div>
            )}

            {reserveError && (
              <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-semibold border border-red-200">
                {reserveError}
              </div>
            )}
            
            {reserveSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center font-semibold border border-green-200">
                Reserva confirmada! Redirecionando...
              </div>
            )}

            <button 
              onClick={handleReserve}
              disabled={isReserving || reserveSuccess || (event.has_assigned_seats && selectedSeatIds.length === 0)}
              className={`w-full text-white font-bold py-4 rounded shadow transition-transform transform text-lg mb-4 
                ${isReserving || reserveSuccess || (event.has_assigned_seats && selectedSeatIds.length === 0)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-brand-400 hover:bg-brand-500 hover:-translate-y-1'}`}
            >
              {isReserving ? 'Processando...' : 'Confirmar Compra'}
            </button>
            <p className="text-xs text-center text-brand-300 font-medium">
              Ambiente 100% seguro. Sujeito à disponibilidade.
            </p>
          </div>
        </div>
      </div>

      {isSeatMapOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-500">Mapa de Assentos</h2>
                <p className="text-sm text-brand-400">Clique nas cadeiras para selecionar</p>
              </div>
              <button onClick={() => setIsSeatMapOpen(false)} className="text-brand-300 hover:text-red-500 font-bold text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center">
              
              <div className="w-3/4 h-8 bg-brand-300 rounded-b-[50%] mb-10 flex items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Palco</span>
              </div>

              <div className="flex flex-col gap-3 items-center pb-8">
                {sortedRows.map(rowLetter => {
                  const rowSeats = seatsByRow[rowLetter].sort((a, b) => a.number - b.number);
                  
                  return (
                    <div key={rowLetter} className="flex items-center gap-4">
                      <span className="w-6 font-bold text-brand-400 text-right">{rowLetter}</span>
                      
                      <div className="flex gap-2">
                        {rowSeats.map(seat => {
                          const isAvailable = seat.status === 'available';
                          const isSelected = selectedSeatIds.includes(seat.id);

                          return (
                            <button
                              key={seat.id}
                              disabled={!isAvailable}
                              onClick={() => toggleSeatSelection(seat)}
                              title={`Assento ${seat.row}${seat.number} - ${isAvailable ? 'Livre' : 'Ocupado'}`}
                              className={`w-10 h-10 rounded-t-lg rounded-b-sm border-b-4 flex items-center justify-center text-xs font-bold transition-all
                                ${isSelected 
                                  ? 'bg-brand-500 border-brand-600 text-white transform scale-110 shadow-md' // Selecionado
                                  : isAvailable 
                                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400' // Livre
                                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60' // Ocupado
                                }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-6 font-bold text-brand-400 text-left">{rowLetter}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-brand-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 text-sm font-medium text-brand-500">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border-b-2 border-green-300 rounded-sm"></div> Livre</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-brand-500 border-b-2 border-brand-600 rounded-sm"></div> Selecionado</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 border-b-2 border-gray-300 rounded-sm"></div> Indisponível</div>
              </div>
              <button 
                onClick={() => setIsSeatMapOpen(false)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-8 rounded shadow transition"
              >
                Confirmar ({selectedSeatIds.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}