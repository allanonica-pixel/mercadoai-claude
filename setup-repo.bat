@echo off
setlocal enabledelayedexpansion

title Setup Git + GitHub Automatizado

echo.
echo ==========================================
echo 🚀 Setup Git + GitHub (Nível Profissional)
echo ==========================================
echo.

:: 📁 CONFIGURAÇÃO
set PROJECT_PATH=C:\Users\allan\openclaude\mercadoai-nextjs
set GITHUB_USER=allanonica-pixel
set REPO_NAME=mercadoai-nextjs
set REMOTE_URL=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

cd /d "%PROJECT_PATH%" || (
    echo ❌ Erro ao acessar pasta do projeto
    pause
    exit /b 1
)

:: 🔍 Verifica Git
git --version >nul 2>&1 || (
    echo ❌ Git não instalado
    pause
    exit /b 1
)

echo ✅ Git OK

:: 🔧 Verifica config Git
for /f "delims=" %%i in ('git config --global user.name') do set GIT_NAME=%%i
for /f "delims=" %%i in ('git config --global user.email') do set GIT_EMAIL=%%i

if "%GIT_NAME%"=="" (
    echo ❌ Configure seu user.name
    pause
    exit /b 1
)

if "%GIT_EMAIL%"=="" (
    echo ❌ Configure seu user.email
    pause
    exit /b 1
)

echo ✅ Git configurado

:: 📦 Inicializa repo
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo 🆕 Inicializando repositório...
    git init
)

:: 🧠 .gitignore Next.js
if not exist ".gitignore" (
    echo Criando .gitignore...

    (
    echo node_modules/
    echo .next/
    echo out/
    echo .env*
    echo .vercel
    echo dist/
    ) > .gitignore
)

:: ➕ Add
git add .

:: 🧾 Commit se necessário
git diff --cached --quiet
if %errorlevel% neq 0 (
    git commit -m "feat: initial Next.js SEO project structure with Supabase and scalable architecture"
    echo ✅ Commit criado
) else (
    echo ⚠️ Nada para commit
)

:: 🌿 Branch main
git branch -M main

:: 🔗 Configura remote automaticamente
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Adicionando remote origin...
    git remote add origin %REMOTE_URL%
    echo ✅ Remote conectado: %REMOTE_URL%
) else (
    echo ⚠️ Remote já existe
)

:: 🚀 Push automático
echo.
echo 🚀 Enviando para o GitHub...

git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ Erro no push (possível autenticação)
    echo 👉 Use GitHub Desktop ou configure token
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 Projeto publicado com sucesso!
echo ==========================================
echo.
echo 🔗 https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.

pause