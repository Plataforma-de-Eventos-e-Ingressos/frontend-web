function App() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border-2 border-brand-200">
        <div className="bg-brand-500 p-6 text-center">
          <h1 className="text-2xl font-bold text-brand-100 uppercase tracking-widest">
            Elite Tickets
          </h1>
        </div>
        
        <div className="p-6 bg-brand-100">
          <p className="text-brand-400 text-center font-semibold mb-6">
            O Tailwind e sua paleta de cores estão configurados perfeitamente!
          </p>
          
          <div className="space-y-3">
            <button className="w-full py-3 font-bold rounded bg-brand-300 text-white hover:bg-brand-400 transition-colors">
              Botão Brand 300
            </button>
            <button className="w-full py-3 font-bold rounded bg-brand-400 text-brand-100 hover:bg-brand-500 transition-colors">
              Botão Brand 400
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
