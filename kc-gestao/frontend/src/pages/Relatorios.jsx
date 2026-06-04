import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { api, formatBRL, getMesesAno, CATEGORIA_COLORS } from '../utils/api.js';
import { Loading } from '../components/UI.jsx';

const meses = getMesesAno();

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.72rem', fontWeight: 700 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export default function Relatorios() {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api.getRelatorio({ mes, ano });
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [mes, ano]);

  const nomeMes = meses.find(m => m.v === mes)?.l || '';
  const anos = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  const pieData = data?.porCategoria?.map(c => ({
    name: c.categoria,
    value: c.total,
    fill: CATEGORIA_COLORS[c.categoria] || '#6b7280'
  })) || [];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Relatórios</h2>
            <p>Análise financeira — {nomeMes} {ano}</p>
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
            {/* Summary */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card green">
                <div className="stat-label">Total Recebido</div>
                <div className="stat-value">{formatBRL(data.totalReceitas)}</div>
              </div>
              <div className="stat-card red">
                <div className="stat-label">Total Gasto</div>
                <div className="stat-value">{formatBRL(data.totalDespesas)}</div>
              </div>
              <div className={`stat-card ${data.saldo >= 0 ? 'blue' : 'yellow'}`}>
                <div className="stat-label">Saldo do Mês</div>
                <div className="stat-value">{formatBRL(data.saldo)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Pie chart */}
              <div className="card">
                <div className="card-title">Distribuição por Categoria</div>
                {pieData.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 12 }}>
                    Nenhuma despesa neste mês
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                        outerRadius={90} labelLine={false} label={CustomLabel}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatBRL(v)}
                        contentStyle={{
                          background: 'var(--bg3)', border: '1px solid var(--border2)',
                          borderRadius: 8, fontSize: '0.82rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Resumo bar */}
              <div className="card">
                <div className="card-title">Receitas × Despesas</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[{ name: nomeMes, Receitas: data.totalReceitas, Despesas: data.totalDespesas }]}
                    margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v) => formatBRL(v)}
                      contentStyle={{
                        background: 'var(--bg3)', border: '1px solid var(--border2)',
                        borderRadius: 8, fontSize: '0.82rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text2)' }} />
                    <Bar dataKey="Receitas" fill="var(--green)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Despesas" fill="var(--red)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="card">
              <div className="card-title">Detalhamento por Categoria</div>
              {data.porCategoria.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 8 }}>
                  Nenhuma despesa registrada neste mês
                </div>
              ) : (
                <table style={{ marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Qtd</th>
                      <th>Total</th>
                      <th>% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.porCategoria.map(cat => {
                      const cor = CATEGORIA_COLORS[cat.categoria] || '#6b7280';
                      const pct = data.totalDespesas > 0
                        ? ((cat.total / data.totalDespesas) * 100).toFixed(1)
                        : '0.0';
                      return (
                        <tr key={cat.categoria}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cor, flexShrink: 0 }} />
                              {cat.categoria}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text2)' }}>{cat.qtd}</td>
                          <td className="mono" style={{ color: 'var(--red)' }}>-{formatBRL(cat.total)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text2)', minWidth: 38 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
