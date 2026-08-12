import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-brand-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-500 mb-6 tracking-tight">
          Elite Tickets
        </h1>
        <p className="text-lg md:text-xl text-brand-400 mb-10">
          A sua plataforma premium para descobrir e reservar ingressos para os melhores eventos, shows e festivais.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login"
            className="bg-brand-400 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform transform hover:-translate-y-1"
          >
            Fazer Login
          </Link>
          <Link 
            to="/cadastro"
            className="bg-white hover:bg-brand-200 text-brand-500 border border-brand-300 font-bold py-3 px-8 rounded shadow-lg transition-transform transform hover:-translate-y-1"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
}