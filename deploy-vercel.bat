@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando deploy automático no Vercel...

cd /d "C:\Users\allan\openclaude\mercadoai-nextjs"

:: Verifica se o Vercel CLI está instalado
echo Verificando se o Vercel CLI está instalado...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Vercel CLI não encontrado.
    echo Instale com: npm install -g vercel
    echo Ou baixe em: https://vercel.com/download
    pause
    exit /b 1
)

echo ✅ Vercel CLI encontrado.

:: Verifica se já está logado
echo Verificando autenticação no Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Não autenticado no Vercel.
    echo Execute primeiro: vercel login
    echo Ou use token manualmente (veja instruções abaixo).
    echo.
    echo 🔑 Para usar token manual:
    echo 1. Acesse https://vercel.com/account/tokens
    echo 2. Crie um novo token com permissão "Team Settings"
    echo 3. Defina a variável de ambiente:
    echo    set VERCEL_TOKEN=seu_token_aqui
    echo.
    pause
    exit /b 1
)

echo ✅ Autenticado como: !username!

:: Configura variáveis de ambiente do projeto
:: Essas são as mesmas credenciais que você já tem no .env.local
echo Configurando variáveis de ambiente do projeto...

:: Remove configurações antigas primeiro
vercel env remove NEXT_PUBLIC_SUPABASE_URL production >nul 2>&1
vercel env remove NEXT_PUBLIC_SUPABASE_ANON_KEY production >nul 2>&1
vercel env remove NEXT_PUBLIC_SITE_URL production >nul 2>&1

:: Adiciona as variáveis corretas
vercel env add NEXT_PUBLIC_SUPABASE_URL "https://ucencxnnvtiitpucfnds.supabase.co" production
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar NEXT_PUBLIC_SUPABASE_URL
    pause
    exit /b 1
)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZW5jeG5udnRpaXRwdWNmbmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI5NTIsImV4cCI6MjA5MTcwODk1Mn0.6f8VhkA43XLrYYpy--OVQRN0vYrnDC8emo_j2Clb3ws" production
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar NEXT_PUBLIC_SUPABASE_ANON_KEY
    pause
    exit /b 1
)

vercel env add NEXT_PUBLIC_SITE_URL "https://mercadoai.com" production
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar NEXT_PUBLIC_SITE_URL
    pause
    exit /b 1
)

echo ✅ Variáveis de ambiente configuradas.

:: Faz o deploy
:: Usa --prod para deploy direto em produção (não preview)
echo Iniciando deploy no Vercel...
echo.
vercel --prod --confirm
if %errorlevel% neq 0 (
    echo ❌ Erro no deploy.
    echo Verifique sua conexão e permissões.
    pause
    exit /b 1
)

echo.
echo 🎉 Deploy concluído com sucesso!
echo.
echo 🔗 Seu site está disponível em:
echo    https://mercadoai-nextjs.vercel.app

echo.
echo 💡 Dica: Você pode personalizar o domínio em https://vercel.com/mercadoai-nextjs/settings/domains
pause