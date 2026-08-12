import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-white text-red-600 px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-100 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-200">
        
        {/* Imagem de Capa */}
        <div className="h-64 sm:h-96 bg-brand-300 relative">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-100 font-bold text-3xl">
              Elite Tickets
            </div>
          )}
        </div>

        {/* Informações e Card de Compra */}
        <div className="p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-brand-500 mb-4">{event.title}</h1>
            <p className="text-brand-400 text-lg mb-6 leading-relaxed">
              {event.description}
            </p>
            
            <div className="space-y-3 text-brand-500 font-semibold text-lg">
              <p>📅 {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p>📍 {event.location}</p>
              <p>👥 Capacidade Máxima: {event.total_capacity} pessoas</p>
            </div>
          </div>

          {/* Painel de Ação (Checkout) */}
          <div className="w-full md:w-80 bg-brand-100 p-6 rounded-xl border border-brand-200 h-fit flex flex-col shadow-inner">
            <span className="text-brand-400 font-semibold mb-2 text-sm uppercase tracking-wider">Ingresso Único</span>
            <span className="text-4xl font-bold text-brand-500 mb-6">
              R$ {event.price.toFixed(2)}
            </span>

            <button 
              className="w-full bg-brand-400 hover:bg-brand-500 text-white font-bold py-4 rounded shadow-lg transition-transform transform hover:-translate-y-1 text-lg mb-4"
              onClick={() => alert("O motor de reservas será implementado em breve!")}
            >
              Comprar Ingresso
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