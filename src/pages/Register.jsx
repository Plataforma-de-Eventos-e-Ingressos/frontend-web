import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.detail);
      } else {
        setError('Erro ao criar conta. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-500 px-4">
      <div className="bg-brand-100 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-brand-500 text-center mb-6">Criar Conta</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm text-center shadow">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white p-3 rounded mb-4 text-sm text-center shadow">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-brand-400 font-semibold mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded bg-white text-brand-500 border border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-brand-400 font-semibold mb-1">E-mail</label>
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
            <label className="block text-brand-400 font-semibold mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-white text-brand-500 border border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="Crie uma senha forte"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-400 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded shadow-md transition duration-200 ease-in-out transform hover:-translate-y-0.5 mt-4"
          >
            Cadastrar
          </button>
        </form>

        <p className="mt-6 text-center text-brand-400 text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-brand-500 font-bold hover:underline">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}