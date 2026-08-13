import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('@EliteTickets:token', access_token);
      
      const payloadBase64 = access_token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userRole = decodedPayload.role;

      if (userRole === 'ORGANIZADOR') {
        navigate('/organizador');
      } else if (userRole === 'PORTARIA') {
        navigate('/portaria');
      } else {
        navigate('/'); 
      }

    } catch (err) {
      setError('E-mail ou senha incorretos. Tente novamente.');
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-500 px-4">
      <div className="bg-brand-100 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-brand-500 text-center mb-8">Elite Tickets</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm text-center shadow">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-brand-400 font-semibold mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-white text-brand-500 border border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          
          <div>
            <label className="block text-brand-400 font-semibold mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-white text-brand-500 border border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-400 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded shadow-md transition duration-200 ease-in-out transform hover:-translate-y-0.5"
          >
            Entrar
          </button>
          <p className="mt-6 text-center text-brand-400 text-sm">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-brand-500 font-bold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}