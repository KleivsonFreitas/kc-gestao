import React from 'react';
import { IconDashboard, IconReceita, IconDespesa, IconRelatorio, IconConfig } from './UI.jsx';

const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'receitas', label: 'Receitas', Icon: IconReceita },
  { id: 'despesas', label: 'Despesas', Icon: IconDespesa },
  { id: 'relatorios', label: 'Relatórios', Icon: IconRelatorio },
  { id: 'configuracoes', label: 'Configurações', Icon: IconConfig },
];

export default function Sidebar({ page, setPage, open, onClose, usuario }) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h1>KC <span>Gestão</span></h1>
          <p>Controle Financeiro</p>
        </div>

        <nav className="sidebar-nav">
          {ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item${page === id ? ' active' : ''}`}
              onClick={() => { setPage(id); onClose(); }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--blue-dim)', border: '1px solid var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)'
            }}>
              {(usuario?.nome || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                {usuario?.nome || 'Usuário'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>Real Brasileiro</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
