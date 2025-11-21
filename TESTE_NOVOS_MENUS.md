# 🎯 Como Testar os Novos Cadastros

## 📋 **Passos para Ver os Menus:**

### 1️⃣ **Fazer Logout do Admin**
- Clique no botão de sair no painel de admin

### 2️⃣ **Fazer Login como EMPRESA**
Use uma das contas de empresa disponíveis:
- **Email:** `empresa@teste.com`
- **Senha:** `123456` (provavelmente)

OU

- **Email:** `renato@vale.com.gg`
- **Senha:** (a senha que foi configurada)

### 3️⃣ **Acessar o Painel da Empresa**
Após o login, você será redirecionado para `/dashboard/empresa`

### 4️⃣ **Encontrar os Novos Menus**
Na **sidebar esquerda**, procure pelo menu **"Configurações"**:

```
📊 Dashboard
💼 Minhas Vagas
💳 Meu Plano
💰 Meus Créditos
🏢 Perfil da Empresa
⚙️ Configurações  ← CLIQUE AQUI PARA EXPANDIR
   ├─ 📝 Banco de Perguntas
   ├─ ⏰ Tipos de Trabalho      ← NOVO!
   └─ 📄 Tipos de Contrato       ← NOVO!
```

### 5️⃣ **Testar as Funcionalidades**

#### **Tipos de Trabalho** (`/empresa/tipos-trabalho`)
- Ver lista de tipos de trabalho
- Criar novo tipo (ex: "Tempo Integral", "Meio Período")
- Editar tipos existentes
- Deletar tipos
- Ativar/desativar status

#### **Tipos de Contrato** (`/empresa/tipos-contrato`)
- Ver lista de tipos de contrato
- Criar novo tipo (ex: "CLT", "PJ", "Temporário")
- Editar tipos existentes
- Deletar tipos
- Ativar/desativar status

---

## 🔑 **Informação Importante:**

Cada **EMPRESA** tem seus próprios tipos de trabalho e contrato. Eles são isolados por empresa (companyId).

Quando criar vagas, essas configurações permitirão categorizar as oportunidades de forma padronizada.
