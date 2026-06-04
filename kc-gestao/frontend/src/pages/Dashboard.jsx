import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { api, formatBRL, formatDate, getMesesAno, CATEGORIA_COLORS } from '../utils/api.js';
import { Loading } from '../components/UI.jsx';

const meses = getMesesAno();

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      <div style={{ color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {formatBRL(p.value)}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api.getDashboard({ mes, ano });
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [mes, ano]);

  const nomeMes = meses.find(m => m.v === mes)?.l || '';
  const anos = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  const chartData = data ? [
    { name: 'Receitas', valor: data.totalReceitas, fill: 'var(--green)' },
    { name: 'Despesas', valor: data.totalDespesas, fill: 'var(--red)' },
  ] : [];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Dashboard</h2>
            <p>Visão geral — {nomeMes} {ano}</p>
          </div>
          <div className="flex gap-2">
            <select className="form-select" style={{ width: 130 }} value={mes} onChange={e => setMes(e.target.value)}>
              {meses.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="form-select" style={{ width: 90 }} value={ano} onChange={e => setAno(e.target.value)}>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? <Loading /> : (
          <>
            {/* Stats */}
            <div className="stat-grid">
              <div className="stat-card green">
                <div className="stat-label">Receitas</div>
                <div className="stat-value">{formatBRL(data.totalReceitas)}</div>
                <div className="stat-icon">↑</div>
              </div>
              <div className="stat-card red">
                <div className="stat-label">Despesas</div>
                <div className="stat-value">{formatBRL(data.totalDespesas)}</div>
                <div className="stat-icon">↓</div>
              </div>
              <div className={`stat-card ${data.saldo >= 0 ? 'blue' : 'yellow'}`}>
                <div className="stat-label">Saldo</div>
                <div className="stat-value">{formatBRL(data.saldo)}</div>
                <div className="stat-icon">{data.saldo >= 0 ? '◈' : '!'}</div>
              </div>
            </div>

            {/* Chart + Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Bar chart */}
              <div className="card">
                <div className="card-title">Receitas × Despesas</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg3)' }} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={80} name="Valor">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Por categoria */}
              <div className="card">
                <div className="card-title">Despesas por Categoria</div>
                {data.porCategoria.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 12 }}>
                    Nenhuma despesa neste mês
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.porCategoria.slice(0, 5).map(cat => {
                      const pct = data.totalDespesas > 0
                        ? Math.round((cat.total / data.totalDespesas) * 100)
                        : 0;
                      const cor = CATEGORIA_COLORS[cat.categoria] || '#6b7280';
                      return (
                        <div key={cat.categoria}>
                          <div className="flex justify-between" style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{cat.categoria}</span>
                            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                              {formatBRL(cat.total)}
                            </span>
                          </div>
                          <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="card-title">Últimas Receitas</div>
                {data.ultimasReceitas.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Nenhuma receita</div>
                ) : (
                  data.ultimasReceitas.map(r => (
                    <div key={r.id} className="flex justify-between items-center"
                      style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>{r.descricao}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{formatDate(r.data)}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--green)' }}>
                        +{formatBRL(r.valor)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="card">
                <div className="card-title">Últimas Despesas</div>
                {data.ultimasDespesas.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Nenhuma despesa</div>
                ) : (
                  data.ultimasDespesas.map(d => (
                    <div key={d.id} className="flex justify-between items-center"
                      style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>{d.descricao}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                          {d.categoria} · {formatDate(d.data)}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--red)' }}>
                        -{formatBRL(d.valor)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
