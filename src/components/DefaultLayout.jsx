import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-100">
      <Header />
      
      {/* O Outlet é onde as páginas filhas serão renderizadas */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}