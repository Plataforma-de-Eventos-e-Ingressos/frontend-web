import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null); 
  
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);

  // Estado atualizado com os novos campos
  const [formData, setFormData] = useState({
    title: '',
    event_datetime: '',
    location: '',
    price: '',
    total_capacity: '',
    description: '',
    poster_url: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await api.get('/events/'); 
      setEvents(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingEventId(null);
    setFormData({ title: '', event_datetime: '', location: '', price: '', total_capacity: '', description: '', poster_url: '' });
    setIsModalOpen(true);
  }

  function openEditModal(event) {
    setEditingEventId(event.id);
    const formattedDate = new Date(event.event_datetime).toISOString().slice(0, 16);
    
    setFormData({
      title: event.title,
      event_datetime: formattedDate,
      location: event.location,
      price: event.price,
      total_capacity: event.total_capacity,
      description: event.description || '',
      poster_url: event.poster_url || ''
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEventId(null);
    setFormData({ title: '', event_datetime: '', location: '', price: '', total_capacity: '', description: '', poster_url: '' });
  }

  async function handleSearchTMDB() {
    if (!tmdbQuery) return;
    
    setSearchingTmdb(true);
    try {
      const token = localStorage.getItem('@EliteTickets:token');
      const response = await api.get(`/events/tmdb/search?query=${tmdbQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTmdbResults(response.data.results || response.data); 
    } catch (error) {
      console.error("Erro na busca do TMDB", error);
      alert("Erro ao buscar no TMDB. Verifique o console.");
    } finally {
      setSearchingTmdb(false);
    }
  }

  function handleSelectMovie(movie) {
    // Monta a URL oficial do TMDB caso exista um poster_path
    const tmdbBaseUrl = "https://image.tmdb.org/t/p/w500";
    const imageUrl = movie.poster_path ? `${tmdbBaseUrl}${movie.poster_path}` : '';

    setFormData({
      ...formData,
      title: movie.title || movie.name,
      description: movie.overview || '',
      poster_url: imageUrl
    });
    
    setTmdbResults([]); 
    setTmdbQuery('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@EliteTickets:token');
      
      const payload = {
        title: formData.title,
        event_datetime: new Date(formData.event_datetime).toISOString(),
        location: formData.location,
        price: parseFloat(formData.price),
        total_capacity: parseInt(formData.total_capacity),
        description: formData.description,
        poster_url: formData.poster_url
      };

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Evento atualizado com sucesso!');
      } else {
        await api.post('/events/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Evento criado com sucesso!');
      }

      closeModal();
      fetchEvents(); 
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar evento. Verifique os dados.');
    }
  }

  async function handleDelete(eventId) {
    const confirm = window.confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('@EliteTickets:token');
      await api.delete(`/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Evento excluído com sucesso!');
      fetchEvents();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        alert("Não é possível excluir: Já existem ingressos vendidos para este evento.");
      } else {
        alert("Erro ao excluir o evento.");
      }
    }
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8 w-full">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-500 tracking-tight">Painel do Organizador</h1>
            <p className="text-brand-400">Gerencie seus eventos e acompanhe as vendas.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-brand-500 hover:bg-brand-400 text-white font-bold py-2 px-6 rounded shadow"
          >
            + Novo Evento
          </button>
        </div>

        {loading ? (
          <p className="text-center text-brand-400 mt-10 animate-pulse">Carregando seus eventos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow border border-brand-200 flex flex-col overflow-hidden">
                {/* Exibe o cartaz no card se existir */}
                {event.poster_url ? (
                  <img 
                    src={event.poster_url.startsWith('http') ? event.poster_url : `https://image.tmdb.org/t/p/w500${event.poster_url}`} 
                    alt={event.title} 
                    className="w-full h-48 object-cover bg-gray-100"
                    onError={(e) => {
                      e.target.onerror = null; // Previne loop infinito
                      e.target.src = 'https://via.placeholder.com/500x300?text=Imagem+Indisponível';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-brand-50 flex flex-col items-center justify-center border-b border-brand-200">
                    <span className="text-4xl mb-2">🎟️</span>
                    <span className="text-brand-300 font-medium text-sm">Sem cartaz</span>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-brand-500 mb-2 truncate">{event.title}</h3>
                    <p className="text-sm text-brand-400 mb-1">📍 {event.location}</p>
                    <p className="text-sm text-brand-400 mb-4">
                      📅 {new Date(event.event_datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-brand-100 mb-4">
                      <span className="font-bold text-brand-500">R$ {event.price.toFixed(2)}</span>
                      <span className="text-xs bg-brand-100 text-brand-500 px-2 py-1 rounded">
                        Cap. {event.total_capacity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 border-t border-brand-100 pt-4 mt-auto">
                    <button 
                      onClick={() => openEditModal(event)}
                      className="flex-1 bg-brand-100 hover:bg-brand-200 text-brand-500 font-bold py-2 rounded transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-500">
                  {editingEventId ? 'Editar Evento' : 'Criar Novo Evento'}
                </h2>
                <button onClick={closeModal} className="text-brand-300 hover:text-red-500 font-bold text-xl">&times;</button>
              </div>

              {!editingEventId && (
                <div className="mb-6 bg-brand-50 p-4 rounded-lg border border-brand-200 relative">
                  <label className="block text-sm font-bold text-brand-500 mb-2">Pesquisar obra no TMDB (Auto-preenchimento)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Digite o nome do filme..."
                      className="flex-1 p-2 border rounded border-brand-300 focus:ring-brand-500 focus:border-brand-500"
                      value={tmdbQuery}
                      onChange={(e) => setTmdbQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchTMDB()}
                    />
                    <button 
                      onClick={handleSearchTMDB}
                      type="button"
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2 rounded transition"
                    >
                      {searchingTmdb ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>

                  {/* Dropdown Rico Melhorado */}
                  {tmdbResults.length > 0 && (
                    <ul className="absolute z-10 w-full left-0 mt-1 max-h-60 overflow-y-auto bg-white border border-brand-200 rounded-md shadow-xl">
                      {tmdbResults.map((movie) => (
                        <li 
                          key={movie.id}
                          onClick={() => handleSelectMovie(movie)}
                          className="p-3 hover:bg-brand-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3 transition"
                        >
                          {movie.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                              alt="Poster" 
                              className="w-10 h-14 object-cover rounded shadow-sm" 
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">S/Img</div>
                          )}
                          <div className="flex-1">
                            <span className="font-bold text-brand-600 block">{movie.title || movie.name}</span>
                            <span className="text-xs text-brand-400 block">
                              Lançamento: {movie.release_date ? movie.release_date.substring(0, 4) : 'N/D'}
                            </span>
                          </div>
                          <span className="text-xs bg-brand-100 text-brand-600 px-2 py-1 rounded font-semibold">Selecionar</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Linha 1: Título e Poster URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-brand-500 mb-1">Título do Evento *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border rounded border-brand-200"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-brand-500 mb-1">URL do Cartaz</label>
                    <input 
                      type="text"
                      placeholder="https://..." 
                      className="w-full p-2 border rounded border-brand-200 text-sm"
                      value={formData.poster_url}
                      onChange={e => setFormData({...formData, poster_url: e.target.value})}
                    />
                  </div>
                </div>

                {/* Linha 2: Descrição */}
                <div>
                  <label className="block text-sm font-bold text-brand-500 mb-1">Descrição / Sinopse</label>
                  <textarea 
                    rows="3"
                    className="w-full p-2 border rounded border-brand-200 text-sm"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                {/* Linha 3: Dados Numéricos e Locais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Data e Hora *</label>
                    <input 
                      required
                      type="datetime-local" 
                      className="w-full p-2 border rounded border-brand-200"
                      value={formData.event_datetime}
                      onChange={e => setFormData({...formData, event_datetime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-500 mb-1">Local *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border rounded border-brand-200"
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
                      className="w-full p-2 border rounded border-brand-200"
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
                      className="w-full p-2 border rounded border-brand-200"
                      value={formData.total_capacity}
                      onChange={e => setFormData({...formData, total_capacity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-brand-100">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-6 py-2 text-brand-500 font-bold hover:bg-brand-50 rounded border border-transparent transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-brand-500 text-white font-bold rounded shadow hover:bg-brand-600 transition"
                  >
                    {editingEventId ? 'Salvar Alterações' : 'Salvar Evento'}
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