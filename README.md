# MercadoAI - Next.js 15 App Router

Projeto migrado para Next.js 15 App Router com integração completa ao Supabase.

## 🚀 Como configurar e deploy no GitHub/Vercel

### 1. Criar repositório no GitHub
- Acesse https://github.com/new
- Nomeie o repositório como `mercadoai-nextjs`
- Não inicialize com README, .gitignore ou LICENSE
- Clique em "Create repository"

### 2. Configurar localmente (se tiver Git instalado)
```bash
# Navegue até o diretório do projeto
cd C:\Users\allan\openclaude\mercadoai-nextjs

# Inicialize o repositório git
git init

git add .

git commit -m "feat: initial commit with Next.js 15 App Router structure and Supabase integration"

# Adicione o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/mercadoai-nextjs.git

git branch -M main
git push -u origin main
```

### 3. Se não tiver Git instalado
- Baixe e instale o Git: https://git-scm.com/download/win
- Execute os comandos acima

### 4. Configurar no Vercel
- Acesse https://vercel.com/new
- Conecte seu repositório GitHub
- Configure as variáveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://ucencxnnvtiitpucfnds.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZW5jeG5udnRpaXRwdWNmbmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI5NTIsImV4cCI6MjA5MTcwODk1Mn0.6f8VhkA43XLrYYpy--OVQRN0vYrnDC8emo_j2Clb3ws`
  - `NEXT_PUBLIC_SITE_URL` = `https://mercadoai.com`
- Clique em "Deploy"

## 📁 Estrutura do projeto
- `app/` - Páginas do Next.js App Router
- `lib/supabase/` - Integração com Supabase
- `constants/` - Configurações de categorias e tipos
- `components/` - Componentes reutilizáveis
- `lib/utils.ts` - Funções utilitárias

## 🔑 Credenciais
Suas credenciais do Supabase já estão configuradas no `.env.local` e são seguras para deploy no Vercel.

> **Nota**: Este projeto está configurado para usar seu Supabase real com todos os dados existentes.
