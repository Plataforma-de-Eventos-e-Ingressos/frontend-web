import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DefaultLayout } from './components/DefaultLayout';
import { EventDetails } from './pages/EventDetails';

function DashboardTemporario() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-500 text-brand-100 p-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-4">
        Você está logado no Painel! 🎉
      </h1>
      <button 
        onClick={() => {
          localStorage.removeItem('@EliteTickets:token');
          window.location.href = '/login';
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-bold shadow-md transition-colors"
      >
        Sair
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas Públicas */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/evento/:id" element={<EventDetails />} />
        </Route>
        
        {/* Rotas Protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardTemporario />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;