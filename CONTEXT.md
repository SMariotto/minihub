# Contexto Atual do Projeto: MINIhub

[Status]: Fase 3 - Desenvolvimento da Camada de Apresentação (Interface)
[Última Alteração]: Criação da interface inicial do Hub com design em Cards (Estilo Netflix/PlayStation) e módulo Brawl Stars selecionável.

## 🚫 Diretrizes Mandatórias (NUNCA QUEBRAR):
1. PROIBIDO adicionar qualquer comentário no código (Ex: // Comentário). O código deve ser limpo e autoexplicativo (Clean Code).
2. Sempre forneça o código 100% ATUALIZADO e COMPLETO. Nunca envie apenas trechos ou peça para o usuário substituir partes manualmente. O usuário precisa ser capaz de dar Ctrl+A e Ctrl+V no arquivo inteiro.
3. Arquitetura Modular e Multiplataforma (Web, Mobile e PC) separada em camadas: Domínio (Lógica), Dados (Supabase) e Apresentação (Interface).
4. Estilo Visual da Web: Cards modernos estilo Netflix/PlayStation.
5. Fluxo do Brawl Stars: Busca por Tag (API) com Sincronização em tempo real + Fallback Manual (digitação manual se a API falhar).

## 📊 Estrutura de Pastas Atualizada:
- minihub-monorepo/
  - docs/
    - architecture.md
  - apps/
    - web/
      - src/
        - App.tsx (Hub Principal com design de Cards)
        - main.tsx
        - index.css
      - package.json
      - tailwind.config.js
  - packages/
    - business-logic/
      - index.js (Funções matemáticas da meta do Brawl Stars)
      - package.json
  - package.json (Configuração mestre)
  - CONTEXT.md (Este arquivo)

## 🎯 O que já foi feito:
- [x] Alinhamento do escopo do projeto, regras arquiteturais e setup de ambiente (Node, VS Code, Git Bash).
- [x] Criação da página de Diário de Bordo no Notion.
- [x] Inicialização do package.json mestre e estrutura do Monorepo.
- [x] Desenvolvimento da lógica pura de metas do Brawl Stars em packages/business-logic/index.js.
- [x] Inicialização do app Web com React, TypeScript, Vite e Tailwind CSS.
- [x] Criação da interface do Hub estilo catálogo (Brawl Stars ativo e jogos adicionais com cadeado de bloqueio).

## 🚀 Próximo Passo Crítico:
- Conectar o pacote @minihub/business-logic dentro do app web e criar a tela interna do gerenciador de metas do Brawl Stars ao clicar no card.