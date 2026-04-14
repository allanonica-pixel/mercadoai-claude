@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando configuração do repositório Git...

cd /d "C:\Users\allan\openclaude\mercadoai-nextjs"

:: Verifica se git está instalado
echo Verificando se o Git está instalado...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Git não encontrado. Por favor, instale o Git primeiro.
    echo Baixe em: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git encontrado.

:: Verifica se já é um repositório git
echo Verificando se já é um repositório Git...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Já é um repositório Git. Pulando inicialização.
) else (
    echo Inicializando novo repositório Git...
    git init
    if %errorlevel% neq 0 (
        echo ❌ Erro ao inicializar o repositório Git.
        pause
        exit /b 1
    )
    echo ✅ Repositório Git inicializado com sucesso.
)

:: Adiciona todos os arquivos
echo Adicionando todos os arquivos ao staging...
git add .
if %errorlevel% neq 0 (
    echo ❌ Erro ao adicionar arquivos ao staging.
    pause
    exit /b 1
)
echo ✅ Arquivos adicionados ao staging.

:: Faz o primeiro commit
echo Criando o primeiro commit...
git commit -m "feat: initial commit with Next.js 15 App Router structure and Supabase integration"
if %errorlevel% neq 0 (
    echo ❌ Erro ao criar o commit.
    pause
    exit /b 1
)
echo ✅ Primeiro commit criado com sucesso.

:: Configura branch principal como 'main'
echo Configurando branch principal como 'main'...
git branch -M main
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar branch principal.
    pause
    exit /b 1
)
echo ✅ Branch principal configurado como 'main'.

:: Verifica se o usuário já configurou nome e email
echo Verificando configuração do Git...
git config --global user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Configuração global do Git não encontrada.
    echo Por favor, configure seu nome e email:
    echo   git config --global user.name "allanonica-pixel"
    echo   git config --global user.email "allanonica@gmail.com"
    pause
)

echo 🎉 Configuração do repositório concluída com sucesso!
echo.
echo 🔗 Para conectar ao GitHub:
:: Mostra instruções para adicionar o repositório remoto
echo 1. Crie um novo repositório no GitHub em https://github.com/new
echo 2. Copie a URL do repositório (ex: https://github.com/SEU_USUARIO/mercadoai-nextjs.git)
echo 3. Execute este comando (substitua pela URL real):
echo    git remote add origin https://github.com/allanonica-pixel/mercadoai-nextjs.git
echo 4. Execute:
echo    git push -u origin main
echo.
echo 💡 Dica: Você pode copiar e colar os comandos acima diretamente no terminal.
pause