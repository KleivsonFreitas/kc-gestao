const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

export const api = {
  // Usuario
  getUsuario: () => req('/usuario'),
  updateUsuario: (data) => req('/usuario', { method: 'PUT', body: data }),

  // Receitas
  getReceitas: (params = {}) => req('/receitas?' + new URLSearchParams(params)),
  createReceita: (data) => req('/receitas', { method: 'POST', body: data }),
  updateReceita: (id, data) => req(`/receitas/${id}`, { method: 'PUT', body: data }),
  deleteReceita: (id) => req(`/receitas/${id}`, { method: 'DELETE' }),

  // Despesas
  getDespesas: (params = {}) => req('/despesas?' + new URLSearchParams(params)),
  createDespesa: (data) => req('/despesas', { method: 'POST', body: data }),
  updateDespesa: (id, data) => req(`/despesas/${id}`, { method: 'PUT', body: data }),
  deleteDespesa: (id) => req(`/despesas/${id}`, { method: 'DELETE' }),

  // Dashboard / Relatório
  getDashboard: (params = {}) => req('/dashboard?' + new URLSearchParams(params)),
  getRelatorio: (params = {}) => req('/relatorio?' + new URLSearchParams(params)),
};

export const CATEGORIAS = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde',
  'Educação', 'Lazer', 'Outros'
];

export const CATEGORIA_COLORS = {
  'Alimentação': '#4f9cf9',
  'Transporte': '#ffc542',
  'Moradia': '#00d97e',
  'Saúde': '#ff4d6a',
  'Educação': '#a78bfa',
  'Lazer': '#fb923c',
  'Outros': '#6b7280',
};

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function toDateInput(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export function parseBRL(str) {
  if (typeof str === 'number') return str;
  return Number(String(str).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

export function maskBRL(value) {
  let v = String(value).replace(/\D/g, '');
  if (!v) return '';
  v = (parseInt(v) / 100).toFixed(2);
  return v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function getMesesAno() {
  return [
    { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' },
    { v: '03', l: 'Março' }, { v: '04', l: 'Abril' },
    { v: '05', l: 'Maio' }, { v: '06', l: 'Junho' },
    { v: '07', l: 'Julho' }, { v: '08', l: 'Agosto' },
    { v: '09', l: 'Setembro' }, { v: '10', l: 'Outubro' },
    { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' }
  ];
}
