import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DefaultLayout } from './components/DefaultLayout';
import { EventDetails } from './pages/EventDetails';
import { Dashboard } from './pages/Dashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Todas as rotas dentro deste bloco herdam o Header e Footer do DefaultLayout */}
        <Route element={<DefaultLayout />}>
          
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/evento/:id" element={<EventDetails />} />
          
          {/* Rotas Protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/organizador" 
            element={
              <ProtectedRoute>
                <OrganizerDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;