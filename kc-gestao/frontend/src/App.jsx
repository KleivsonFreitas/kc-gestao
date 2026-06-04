import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Receitas from './pages/Receitas.jsx';
import Despesas from './pages/Despesas.jsx';
import Relatorios from './pages/Relatorios.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import { IconMenu } from './components/UI.jsx';
import { api } from './utils/api.js';

function AppInner() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    api.getUsuario().then(setUsuario).catch(() => {});
  }, []);

  const pages = {
    dashboard: <Dashboard />,
    receitas: <Receitas />,
    despesas: <Despesas />,
    relatorios: <Relatorios />,
    configuracoes: <Configuracoes onUpdate={setUsuario} />,
  };

  return (
    <div className="app-layout">
      <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
        <IconMenu />
      </button>

      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        usuario={usuario}
      />

      <main className="main-content">
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
