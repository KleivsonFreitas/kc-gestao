import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Loading } from '../components/UI.jsx';

export default function Configuracoes({ onUpdate }) {
  const toast = useToast();
  const [form, setForm] = useState({ nome: '', moeda: 'BRL' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUsuario().then(u => {
      setForm({ nome: u.nome, moeda: u.moeda || 'BRL' });
      setLoading(false);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório'); return; }
    setError('');
    setSaving(true);
    try {
      const updated = await api.updateUsuario(form);
      toast('Configurações salvas!');
      onUpdate(updated);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Configurações</h2>
        <p>Personalize suas preferências</p>
      </div>

      <div className="page-body">
        {loading ? <Loading /> : (
          <div style={{ maxWidth: 480 }}>
            <div className="card">
              <div className="card-title">Perfil</div>
              <form onSubmit={save}>
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input className="form-input" placeholder="Seu nome"
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  {error && <div className="form-error">{error}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Moeda</label>
                  <select className="form-select" value={form.moeda}
                    onChange={e => setForm(f => ({ ...f, moeda: e.target.value }))}>
                    <option value="BRL">Real Brasileiro (R$)</option>
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 6 }}>
                    Suporte a outras moedas em breve.
                  </p>
                </div>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </form>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title">Sobre o sistema</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Sistema', 'KC Gestão'],
                  ['Versão', '1.0.0'],
                  ['Banco de Dados', 'SQLite'],
                  ['Backend', 'Node.js + Express'],
                  ['Frontend', 'React + Vite'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between" style={{
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{k}</span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
