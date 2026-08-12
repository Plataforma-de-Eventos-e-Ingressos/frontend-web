export function Footer() {
  return (
    <footer className="bg-brand-500 text-brand-200 py-6 text-center shadow-inner mt-auto">
      <div className="container mx-auto max-w-6xl px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Elite Tickets. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}