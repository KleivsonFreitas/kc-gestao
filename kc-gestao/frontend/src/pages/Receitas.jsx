import React, { useEffect, useState, useCallback } from 'react';
import { api, formatBRL, formatDate, todayInput, parseBRL } from '../utils/api.js';
import { Modal, ConfirmDialog, Loading, IconPlus, IconEdit, IconTrash, IconSearch, IconEmpty, MoneyInput } from '../components/UI.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY_FORM = { descricao: '', valor: '', data: todayInput() };

export default function Receitas() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [filters, setFilters] = useState({ descricao: '', data_inicio: '', data_fim: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.descricao) params.descricao = filters.descricao;
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      const data = await api.getReceitas(params);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ descricao: item.descricao, valor: formatValor(item.valor), data: item.data });
    setErrors({});
    setModal(true);
  }

  function formatValor(v) {
    return Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function validate() {
    const e = {};
    if (!form.descricao.trim()) e.descricao = 'Descrição obrigatória';
    if (!form.valor || parseBRL(form.valor) <= 0) e.valor = 'Valor inválido';
    if (!form.data) e.data = 'Data obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { descricao: form.descricao.trim(), valor: parseBRL(form.valor), data: form.data };
      if (editing) {
        await api.updateReceita(editing.id, payload);
        toast('Receita atualizada!');
      } else {
        await api.createReceita(payload);
        toast('Receita adicionada!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await api.deleteReceita(id);
      toast('Receita excluída');
      setConfirm(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const total = items.reduce((s, r) => s + r.valor, 0);

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h2>Receitas</h2>
            <p>{items.length} registro{items.length !== 1 ? 's' : ''} · Total: <span className="text-green" style={{ fontFamily: 'var(--font-mono)' }}>{formatBRL(total)}</span></p>
          </div>
          <button className="btn btn-success" onClick={openNew}>
            <IconPlus /> Nova Receita
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="filters">
          <div className="form-group" style={{ position: 'relative', flex: 2 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
              <IconSearch size={14} />
            </span>
            <input
              className="form-input" style={{ paddingLeft: 32 }}
              placeholder="Buscar por descrição..."
              value={filters.descricao}
              onChange={e => setFilters(f => ({ ...f, descricao: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">De</label>
            <input className="form-input" type="date" value={filters.data_inicio}
              onChange={e => setFilters(f => ({ ...f, data_inicio: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Até</label>
            <input className="form-input" type="date" value={filters.data_fim}
              onChange={e => setFilters(f => ({ ...f, data_fim: e.target.value }))} />
          </div>
          {(filters.descricao || filters.data_inicio || filters.data_fim) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ descricao: '', data_inicio: '', data_fim: '' })}>
              Limpar
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? <Loading /> : items.length === 0 ? (
          <div className="empty-state">
            <IconEmpty />
            <p>Nenhuma receita encontrada. Clique em "Nova Receita" para começar.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th style={{ width: 80 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td>{r.descricao}</td>
                    <td className="mono text-green">+{formatBRL(r.valor)}</td>
                    <td>{formatDate(r.data)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => openEdit(r)} title="Editar">
                          <IconEdit />
                        </button>
                        <button className="btn-icon danger" onClick={() =>
                          setConfirm({ id: r.id, desc: r.descricao })} title="Excluir">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={editing ? 'Editar Receita' : 'Nova Receita'}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Descrição *</label>
            <input className="form-input" placeholder="Ex: Salário, Freela..."
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            {errors.descricao && <div className="form-error">{errors.descricao}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor *</label>
              <MoneyInput value={form.valor}
                onChange={v => setForm(f => ({ ...f, valor: v }))} />
              {errors.valor && <div className="form-error">{errors.valor}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Data *</label>
              <input className="form-input" type="date" value={form.data}
                onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              {errors.data && <div className="form-error">{errors.data}</div>}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm */}
      {confirm && (
        <ConfirmDialog
          msg={`Deseja excluir a receita "${confirm.desc}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => remove(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
