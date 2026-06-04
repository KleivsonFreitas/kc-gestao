# KC Gestão 💰

Controle financeiro pessoal — simples, rápido e bonito.

## Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Banco de dados:** SQLite (via better-sqlite3)
- **Deploy:** Render.com

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js >= 18
- npm >= 9

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/kc-gestao.git
cd kc-gestao
```

### 2. Instale as dependências

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Inicie o backend

```bash
cd backend
npm run dev
# Rodando em http://localhost:3001
```

### 4. Inicie o frontend (outro terminal)

```bash
cd frontend
npm run dev
# Rodando em http://localhost:5173
```

Acesse **http://localhost:5173** no navegador.

---

## 🌐 Deploy na Render

### Passo a passo

1. **Suba o projeto para o GitHub**
   ```bash
   git init
   git add .
   git commit -m "KC Gestão - versão inicial"
   git remote add origin https://github.com/seu-usuario/kc-gestao.git
   git push -u origin main
   ```

2. **Acesse o Render**
   - Vá em [render.com](https://render.com) e faça login
   - Clique em **"New +"** → **"Web Service"**

3. **Conecte seu repositório GitHub**
   - Autorize o Render a acessar seu repositório
   - Selecione o repositório `kc-gestao`

4. **Configure o serviço**

   | Campo | Valor |
   |-------|-------|
   | Name | `kc-gestao` |
   | Region | Oregon (US West) |
   | Branch | `main` |
   | Runtime | `Node` |
   | Build Command | `npm run build` |
   | Start Command | `npm start` |

5. **Variáveis de ambiente**

   Clique em **"Advanced"** → **"Add Environment Variable"**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |

6. **Adicione um Disco (para persistir o banco SQLite)**
   - Ainda em "Advanced", procure **"Add Disk"**
   - Name: `kc-gestao-data`
   - Mount Path: `/opt/render/project/src/backend/data`
   - Size: `1 GB`

7. **Clique em "Create Web Service"**
   - O Render vai fazer o build e deploy automaticamente
   - Em alguns minutos seu app estará em `https://kc-gestao.onrender.com`

> ⚠️ **Atenção:** O plano gratuito do Render "dorme" após 15 min de inatividade. O primeiro acesso após o sono pode demorar ~30 segundos.

---

## 📁 Estrutura do projeto

```
kc-gestao/
├── backend/
│   ├── server.js          # API Express + SQLite
│   ├── package.json
│   └── data/              # Banco SQLite (criado automaticamente)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── UI.jsx     # Componentes reutilizáveis
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Receitas.jsx
│   │   │   ├── Despesas.jsx
│   │   │   ├── Relatorios.jsx
│   │   │   └── Configuracoes.jsx
│   │   └── utils/
│   │       └── api.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json           # Scripts raiz
├── render.yaml            # Config do Render
├── .gitignore
└── README.md
```

---

## 🧩 Funcionalidades

- **Dashboard** — saldo, receitas, despesas, gráfico, últimas transações
- **Receitas** — cadastrar, listar, editar, excluir, buscar, filtrar por período
- **Despesas** — com categorias (Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Outros)
- **Relatórios** — totais do mês, gráfico pizza por categoria, % de cada categoria
- **Configurações** — nome do usuário, moeda
- Máscara monetária em R$
- Validação de formulários
- Confirmação antes de excluir
- Responsivo (celular e desktop)
- Interface 100% em português

---

## 📄 Licença

MIT
