import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o input de busca
  const navigate = useNavigate();

  // Verifica roles e redireciona se necessário
  useEffect(() => {
      const token = localStorage.getItem('@EliteTickets:token');
      if (token) {
        try {
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          
          if (decodedPayload.role === 'ORGANIZADOR') {
            navigate('/organizador');
            return; 
          }
          if (decodedPayload.role === 'PORTARIA') {
            navigate('/portaria');
            return;
          }
        } catch (e) {
        }
      }
  }, [navigate]);

  // Efeito de Busca com Debounce (400ms)
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        // Passa o termo de busca como query param para o back-end que acabamos de ajustar
        const response = await api.get('/events', {
          params: { search: searchTerm || undefined }
        });
        
        const now = new Date().getTime();
        
        const validEvents = response.data.filter(event => {
          const eventTime = new Date(event.event_datetime).getTime();
          const expirationTime = eventTime + (30 * 60 * 1000); 
          return expirationTime > now;
        });

        setEvents(validEvents);
        setError('');
      } catch (err) {
        setError('Não foi possível carregar os eventos no momento.');
      } finally {
        setLoading(false);
      }
    }

    // Debounce: Aguarda 400ms após o usuário parar de digitar para disparar a API
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-500 mb-4 tracking-tight">
            Eventos em Destaque
          </h1>
          <p className="text-lg text-brand-400 mb-6">
            Descubra os melhores shows e garanta seu lugar.
          </p>

          {/* Barra de Pesquisa */}
          <div className="max-w-md mx-auto relative">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar eventos por nome..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-brand-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-500 bg-white"
            />
            <span className="absolute left-4 top-3.5 text-gray-400 text-lg">
              🔍
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-brand-400 text-xl font-semibold animate-pulse">
              Carregando o catálogo...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded text-center mb-8 shadow">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-brand-200">
            <p className="text-brand-400 text-lg">Nenhum evento encontrado para "{searchTerm}".</p>
          </div>
        )}

        {/* Grid de Eventos */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-brand-200"
              >
                {/* Imagem do Evento*/}
                <div className="h-64 bg-gray-900 overflow-hidden relative flex items-center justify-center">
                  {event.poster_url ? (
                    <img 
                      src={event.poster_url.startsWith('http') ? event.poster_url : `https://image.tmdb.org/t/p/w500${event.poster_url}`} 
                      alt={event.title} 
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x300?text=Imagem+Indisponível';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-100 font-bold text-xl bg-brand-500">
                      Elite Tickets
                    </div>
                  )}
                  {/* Badge de Preço */}
                  <div className="absolute top-4 right-4 bg-brand-500 text-white font-bold px-3 py-1 rounded shadow">
                    R$ {event.price.toFixed(2)}
                  </div>
                </div>

                {/* Informações do Evento */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-brand-500 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-brand-400 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="mt-auto space-y-2 mb-6 text-sm text-brand-500 font-medium">
                    <p className="flex items-center gap-2">
                      📅 {new Date(event.event_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-center gap-2">
                      📍 {event.location}
                    </p>
                  </div>

                  <Link 
                    to={`/evento/${event.id}`}
                    className="block text-center w-full bg-brand-400 hover:bg-brand-500 text-white font-bold py-3 rounded shadow transition-transform transform hover:-translate-y-0.5 mt-auto"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}