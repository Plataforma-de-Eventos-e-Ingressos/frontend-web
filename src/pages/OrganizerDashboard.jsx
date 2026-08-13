import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para o TMDB
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    title: '',
    event_datetime: '',
    location: '',
    price: '',
    total_capacity: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      // Como a rota atual traz todos, depois podemos filtrar só os do organizador logado
      const response = await api.get('/events/'); 
      setEvents(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchTMDB() {
    if (!tmdbQuery) return;
    
    setSearchingTmdb(true);
    try {
      const token = localStorage.getItem('@EliteTickets:token');
      const response = await api.get(`/events/tmdb/search?query=${tmdbQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Assumindo que sua api do TMDB retorna um array de resultados em response.data.results
      setTmdbResults(response.data.results || response.data); 
    } catch (error) {
      console.error("Erro na busca do TMDB", error);
      alert("Erro ao buscar no TMDB. Verifique o console.");
    } finally {
      setSearchingTmdb(false);
    }
  }

  function handleSelectMovie(movie) {
    // Preenche o formulário com os dados do filme
    setFormData({
      ...formData,
      title: movie.title || movie.name,
      // Se você adicionar colunas de imagem e descrição no banco depois, já pode puxar daqui!
    });
    setTmdbResults([]); // Limpa a busca
    setTmdbQuery('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@EliteTickets:token');
      
      // Formata os dados para o padrão que a API espera
      const payload = {
        title: formData.title,
        event_datetime: new Date(formData.event_datetime).toISOString(),
        location: formData.location,
        price: parseFloat(formData.price),
        total_capacity: parseInt(formData.total_capacity)
      };

      await api.post('/events/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Evento criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ title: '', event_datetime: '', location: '', price: '', total_capacity: '' });
      fetchEvents(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      alert('Erro ao criar evento. Verifique os dados.');
    }
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8 w-full">
      <div className="container mx-auto max-w-6xl">
        
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-500 tracking-tight">Painel do Organizador</h1>
            <p className="text-brand-400">Gerencie seus eventos e acompanhe as vendas.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-500 hover:bg-brand-400 text-white font-bold py-2 px-6 rounded shadow"
          >
            + Novo Evento
          </button>
        </div>

        {/* Listagem de Eventos */}
        {loading ? (
          <p className="text-center text-brand-400 mt-10 animate-pulse">Carregando seus eventos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-xl shadow border border-brand-200">
                <h3 className="font-bold text-xl text-brand-500 mb-2 truncate">{event.title}</h3>
                <p className="text-sm text-brand-400 mb-1">📍 {event.location}</p>
                <p className="text-sm text-brand-400 mb-4">
                  📅 {new Date(event.event_datetime).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-brand-100">
                  <span className="font-bold text-brand-500">R$ {event.price.toFixed(2)}</span>
                  <span className="text-xs bg-brand-100 text-brand-500 px-2 py-1 rounded">
                    Capacidade: {event.total_capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Criação de Evento */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-500">Criar Novo Evento</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-brand-300 hover:text-red-500 font-bold text-xl">&times;</button>
              </div>

              {/* Área de Busca TMDB */}
              <div className="mb-6 bg-brand-50 p-4 rounded-lg border border-brand-200">
                <label className="block text-sm font-bold text-brand-500 mb-2">Preencher com TMDB (Opcional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Digite o nome do filme..."
                    className="flex-1 p-2 border rounded"
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTMDB()}
                  />
                  <button 
                    onClick={handleSearchTMDB}
                    type="button"
                    className="bg-brand-400 hover:bg-brand-500 text-white px-4 py-2 rounded"
                  >
                    {searchingTmdb ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {/* Resultados da Busca TMDB */}
                {tmdbResults.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto bg-white border rounded shadow-inner">
                    {tmdbResults.map((movie) => (
                      <li 
                        key={movie.id}
                        onClick={() => handleSelectMovie(movie)}
                        className="p-2 hover:bg-brand-100 cursor-pointer text-sm border-b last:border-b-0 flex justify-between items-center"
                      >
                        <span className="font-medium text-brand-500">{movie.title || movie.name}</span>
                        <span className="text-xs text-brand-300 ml-2">Selecionar</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Formulário Principal */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-brand-500 mb-1">Título do Evento *</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-2 border rounded"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Data e Hora *</label>
                    <input 
                      required
                      type="datetime-local" 
                      className="w-full p-2 border rounded"
                      value={formData.event_datetime}
                      onChange={e => setFormData({...formData, event_datetime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Local *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border rounded"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Preço (R$) *</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      min="0"
                      className="w-full p-2 border rounded"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Capacidade Total *</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      className="w-full p-2 border rounded"
                      value={formData.total_capacity}
                      onChange={e => setFormData({...formData, total_capacity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-brand-400 font-bold hover:bg-brand-50 rounded"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-brand-500 text-white font-bold rounded shadow hover:bg-brand-400"
                  >
                    Salvar Evento
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}