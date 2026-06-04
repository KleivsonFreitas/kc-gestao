const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, 'kc_gestao.db');

// ─── SQLite via sql.js ────────────────────────────────────────────────────────
let db;
let saveTimer;

function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }, 300);
}

async function initDb() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL DEFAULT 'Usuário',
      moeda TEXT NOT NULL DEFAULT 'BRL'
    );
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      data TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS despesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'Outros',
      data TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );
  `);

  const res = db.exec('SELECT COUNT(*) as c FROM usuarios');
  const count = res[0]?.values[0][0] || 0;
  if (count === 0) {
    db.run("INSERT INTO usuarios (nome, moeda) VALUES ('Usuário', 'BRL')");
    saveDb();
  }
}

// Helper: run query and get all rows as objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return db;
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// ─── Usuario ──────────────────────────────────────────────────────────────────
app.get('/api/usuario', (req, res) => {
  const user = queryOne('SELECT * FROM usuarios LIMIT 1');
  res.json(user);
});

app.put('/api/usuario', (req, res) => {
  const { nome, moeda } = req.body;
  if (!nome || nome.trim() === '') return res.status(400).json({ error: 'Nome é obrigatório' });
  run('UPDATE usuarios SET nome = ?, moeda = ? WHERE id = 1', [nome.trim(), moeda || 'BRL']);
  res.json(queryOne('SELECT * FROM usuarios LIMIT 1'));
});

// ─── Receitas ─────────────────────────────────────────────────────────────────
app.get('/api/receitas', (req, res) => {
  const { descricao, data_inicio, data_fim } = req.query;
  let sql = 'SELECT * FROM receitas WHERE 1=1';
  const params = [];
  if (descricao) { sql += ' AND descricao LIKE ?'; params.push(`%${descricao}%`); }
  if (data_inicio) { sql += ' AND data >= ?'; params.push(data_inicio); }
  if (data_fim) { sql += ' AND data <= ?'; params.push(data_fim); }
  sql += ' ORDER BY data DESC, id DESC';
  res.json(queryAll(sql, params));
});

app.post('/api/receitas', (req, res) => {
  const { descricao, valor, data } = req.body;
  if (!descricao?.trim()) return res.status(400).json({ error: 'Descrição é obrigatória' });
  if (!valor || isNaN(valor) || Number(valor) <= 0) return res.status(400).json({ error: 'Valor inválido' });
  if (!data) return res.status(400).json({ error: 'Data é obrigatória' });
  run('INSERT INTO receitas (descricao, valor, data) VALUES (?, ?, ?)',
    [descricao.trim(), Number(valor), data]);
  const id = queryOne('SELECT last_insert_rowid() as id').id;
  res.status(201).json(queryOne('SELECT * FROM receitas WHERE id = ?', [id]));
});

app.put('/api/receitas/:id', (req, res) => {
  const { descricao, valor, data } = req.body;
  const { id } = req.params;
  if (!descricao?.trim()) return res.status(400).json({ error: 'Descrição é obrigatória' });
  if (!valor || isNaN(valor) || Number(valor) <= 0) return res.status(400).json({ error: 'Valor inválido' });
  if (!data) return res.status(400).json({ error: 'Data é obrigatória' });
  run('UPDATE receitas SET descricao = ?, valor = ?, data = ? WHERE id = ?',
    [descricao.trim(), Number(valor), data, id]);
  const r = queryOne('SELECT * FROM receitas WHERE id = ?', [id]);
  if (!r) return res.status(404).json({ error: 'Não encontrado' });
  res.json(r);
});

app.delete('/api/receitas/:id', (req, res) => {
  const before = queryOne('SELECT id FROM receitas WHERE id = ?', [req.params.id]);
  if (!before) return res.status(404).json({ error: 'Não encontrado' });
  run('DELETE FROM receitas WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ─── Despesas ─────────────────────────────────────────────────────────────────
app.get('/api/despesas', (req, res) => {
  const { descricao, categoria, data_inicio, data_fim } = req.query;
  let sql = 'SELECT * FROM despesas WHERE 1=1';
  const params = [];
  if (descricao) { sql += ' AND descricao LIKE ?'; params.push(`%${descricao}%`); }
  if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
  if (data_inicio) { sql += ' AND data >= ?'; params.push(data_inicio); }
  if (data_fim) { sql += ' AND data <= ?'; params.push(data_fim); }
  sql += ' ORDER BY data DESC, id DESC';
  res.json(queryAll(sql, params));
});

app.post('/api/despesas', (req, res) => {
  const { descricao, valor, categoria, data } = req.body;
  if (!descricao?.trim()) return res.status(400).json({ error: 'Descrição é obrigatória' });
  if (!valor || isNaN(valor) || Number(valor) <= 0) return res.status(400).json({ error: 'Valor inválido' });
  if (!data) return res.status(400).json({ error: 'Data é obrigatória' });
  run('INSERT INTO despesas (descricao, valor, categoria, data) VALUES (?, ?, ?, ?)',
    [descricao.trim(), Number(valor), categoria || 'Outros', data]);
  const id = queryOne('SELECT last_insert_rowid() as id').id;
  res.status(201).json(queryOne('SELECT * FROM despesas WHERE id = ?', [id]));
});

app.put('/api/despesas/:id', (req, res) => {
  const { descricao, valor, categoria, data } = req.body;
  const { id } = req.params;
  if (!descricao?.trim()) return res.status(400).json({ error: 'Descrição é obrigatória' });
  if (!valor || isNaN(valor) || Number(valor) <= 0) return res.status(400).json({ error: 'Valor inválido' });
  if (!data) return res.status(400).json({ error: 'Data é obrigatória' });
  run('UPDATE despesas SET descricao = ?, valor = ?, categoria = ?, data = ? WHERE id = ?',
    [descricao.trim(), Number(valor), categoria || 'Outros', data, id]);
  const d = queryOne('SELECT * FROM despesas WHERE id = ?', [id]);
  if (!d) return res.status(404).json({ error: 'Não encontrado' });
  res.json(d);
});

app.delete('/api/despesas/:id', (req, res) => {
  const before = queryOne('SELECT id FROM despesas WHERE id = ?', [req.params.id]);
  if (!before) return res.status(404).json({ error: 'Não encontrado' });
  run('DELETE FROM despesas WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const now = new Date();
  const mes = req.query.mes || String(now.getMonth() + 1).padStart(2, '0');
  const ano = req.query.ano || now.getFullYear();
  const prefixo = `${ano}-${mes}%`;

  const totalReceitas = (queryOne('SELECT COALESCE(SUM(valor),0) as t FROM receitas WHERE data LIKE ?', [prefixo])?.t) || 0;
  const totalDespesas = (queryOne('SELECT COALESCE(SUM(valor),0) as t FROM despesas WHERE data LIKE ?', [prefixo])?.t) || 0;
  const porCategoria = queryAll('SELECT categoria, COALESCE(SUM(valor),0) as total FROM despesas WHERE data LIKE ? GROUP BY categoria ORDER BY total DESC', [prefixo]);
  const ultimasReceitas = queryAll('SELECT * FROM receitas ORDER BY data DESC, id DESC LIMIT 5');
  const ultimasDespesas = queryAll('SELECT * FROM despesas ORDER BY data DESC, id DESC LIMIT 5');

  res.json({
    mes, ano, totalReceitas, totalDespesas,
    saldo: totalReceitas - totalDespesas,
    porCategoria, ultimasReceitas, ultimasDespesas
  });
});

app.get('/api/relatorio', (req, res) => {
  const now = new Date();
  const mes = req.query.mes || String(now.getMonth() + 1).padStart(2, '0');
  const ano = req.query.ano || now.getFullYear();
  const prefixo = `${ano}-${mes}%`;

  const totalReceitas = (queryOne('SELECT COALESCE(SUM(valor),0) as t FROM receitas WHERE data LIKE ?', [prefixo])?.t) || 0;
  const totalDespesas = (queryOne('SELECT COALESCE(SUM(valor),0) as t FROM despesas WHERE data LIKE ?', [prefixo])?.t) || 0;
  const porCategoria = queryAll('SELECT categoria, COALESCE(SUM(valor),0) as total, COUNT(*) as qtd FROM despesas WHERE data LIKE ? GROUP BY categoria ORDER BY total DESC', [prefixo]);

  res.json({ mes, ano, totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas, porCategoria });
});

// SPA fallback
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Start
initDb().then(() => {
  app.listen(PORT, () => console.log(`KC Gestão API rodando na porta ${PORT}`));
}).catch(err => {
  console.error('Erro ao iniciar banco:', err);
  process.exit(1);
});
