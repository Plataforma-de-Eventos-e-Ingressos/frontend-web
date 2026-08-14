import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Importação da câmera

export function Ordinance() {
  const navigate = useNavigate();
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // Controle da câmera
  
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');
  const [ticketData, setTicketData] = useState(null);
  
  const inputRef = useRef(null);

  // Foco no input manual quando a câmera não estiver ativa
  useEffect(() => {
    if (!cameraActive) {
      inputRef.current?.focus();
    }
  }, [status, cameraActive]);

  // Lógica de ativação do Leitor de Câmera
  useEffect(() => {
    if (cameraActive) {
      // Configura o scanner (id da div, configurações de quadro e fps)
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      // Inicia a renderização e define os callbacks de sucesso e erro
      scanner.render(
        (decodedText) => {
          // Sucesso: Leu o QR Code
          setQrToken(decodedText);
          scanner.clear(); // Desliga a câmera
          setCameraActive(false);
          validateTicket(decodedText); // Dispara a validação automaticamente
        },
        (errorMessage) => {
          // Apenas ignoramos os erros de leitura contínua (quadros sem QR code)
        }
      );

      // Limpeza caso o componente seja desmontado ou a câmera desativada
      return () => {
        scanner.clear().catch(error => console.error("Falha ao limpar scanner", error));
      };
    }
  }, [cameraActive]);

  // Função central isolada para poder ser chamada tanto pela câmera quanto pelo botão
  async function validateTicket(tokenToValidate) {
    if (!tokenToValidate.trim()) return;

    setLoading(true);
    setStatus('idle');
    setTicketData(null);

    try {
      const token = localStorage.getItem('@EliteTickets:token');
      const response = await api.post('/tickets/validate', 
        { qr_token: tokenToValidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus('success');
      setMessage(response.data.message);
      setTicketData({
        event_title: response.data.event_title,
        seat: response.data.seat,
        client_id: response.data.client_id
      });
      
    } catch (error) {
      const statusCode = error.response?.status;
      const errorMsg = error.response?.data?.detail || "Erro desconhecido na validação.";

      if (statusCode === 409) {
        setStatus('warning');
        setMessage(errorMsg);
      } else {
        setStatus('error');
        setMessage(errorMsg);
      }
    } finally {
      setLoading(false);
      setQrToken('');
    }
  }

  // Wrapper para o formulário manual
  function handleManualSubmit(e) {
    e.preventDefault();
    validateTicket(qrToken);
  }

  function handleLogout() {
    localStorage.removeItem('@EliteTickets:token');
    navigate('/login');
  }

  const statusStyles = {
    idle: "bg-white border-brand-200 text-brand-400",
    success: "bg-green-100 border-green-500 text-green-800",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
    error: "bg-red-100 border-red-500 text-red-800"
  };

  return (
    <div className="min-h-screen bg-brand-100 flex flex-col items-center py-10 px-4">
      {/* Cabeçalho Simplificado */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-brand-500">
          Elite<span className="text-brand-300">Portaria</span>
        </h1>
        <button 
          onClick={handleLogout}
          className="text-brand-400 hover:text-red-500 font-bold transition"
        >
          Sair
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 sm:p-10">
        <h2 className="text-xl font-bold text-brand-500 mb-6 text-center">
          Validação de Ingressos
        </h2>

        {/* Botão de Alternância da Câmera */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className={`font-bold py-2 px-6 rounded-full shadow transition flex items-center gap-2 ${
              cameraActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-brand-400 hover:bg-brand-500 text-white'
            }`}
          >
            {cameraActive ? '📷 Fechar Câmera' : '📷 Ler QR Code com a Câmera'}
          </button>
        </div>

        {/* Div onde a câmera será renderizada */}
        {cameraActive && (
          <div className="mb-8 flex justify-center">
            <div id="reader" className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-brand-300"></div>
          </div>
        )}

        {/* Formulário de Leitura Manual / Leitor Físico */}
        {!cameraActive && (
          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o código ou use pistola de leitura..."
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              className="flex-1 p-4 border-2 border-brand-200 rounded-lg text-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !qrToken}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-bold py-4 px-8 rounded-lg shadow transition"
            >
              {loading ? 'Validando...' : 'Validar'}
            </button>
          </form>
        )}

        {/* Painel de Feedback Visual */}
        <div className={`w-full border-l-8 rounded-r-lg p-6 transition-all duration-300 min-h-[160px] flex flex-col justify-center items-center text-center shadow-inner ${statusStyles[status]}`}>
          {status === 'idle' && (
            <>
              <span className="text-4xl mb-2">🎫</span>
              <p className="font-semibold text-lg">Aguardando leitura do ingresso.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="text-5xl mb-2">✅</span>
              <h3 className="text-2xl font-black uppercase mb-1">{message}</h3>
              <p className="font-semibold text-green-700 text-lg">{ticketData?.event_title}</p>
              <p className="text-sm font-bold mt-2 bg-green-200 px-3 py-1 rounded inline-block">
                Assento: {ticketData?.seat}
              </p>
            </>
          )}

          {status === 'warning' && (
            <>
              <span className="text-5xl mb-2">⚠️</span>
              <h3 className="text-2xl font-black uppercase">{message}</h3>
              <p className="mt-2 font-medium">Não permita a entrada. Ingresso já bipado.</p>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="text-5xl mb-2">❌</span>
              <h3 className="text-2xl font-black uppercase">{message}</h3>
              <p className="mt-2 font-medium">Ingresso não confere ou não foi pago.</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}