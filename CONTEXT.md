# Contexto Atual do Projeto: MINIhub

[Status]: Fase 1 - Preparação e Alinhamento de Ambiente
[Última Alteração]: Criação da estrutura base e arquivo de contexto inicial.

## 🚫 Diretrizes Mandatórias (NUNCA QUEBRAR):
1. PROIBIDO adicionar qualquer comentário no código (Ex: // Comentário). O código deve ser limpo e autoexplicativo (Clean Code).
2. Arquitetura Modular e Multiplataforma (Web, Mobile e PC) separada em camadas: Domínio (Lógica), Dados (Supabase) e Apresentação (Interface).
3. Estilo Visual da Web: Cards modernos estilo Netflix/PlayStation.
4. Fluxo do Brawl Stars: Busca por Tag (API) com Sincronização em tempo real + Fallback Manual (digitação manual se a API falhar).

## 📊 Estrutura de Pastas Almejada:
- minihub-monorepo/
  - docs/ (Manuais e Schemas)
  - apps/ (web, mobile, desktop)
  - packages/ (business-logic, database-client, ui-components)
  - CONTEXT.md (Este arquivo)

## 🎯 O que já foi feito:
- [x] Alinhamento do escopo do projeto e regras arquiteturais.
- [x] Instalação do Node.js e VS Code no ambiente local.
- [x] Criação do arquivo CONTEXT.md na raiz.

## 🚀 Próximo Passo Crítico:
- Criar a página de Diário de Bordo no Notion e estruturar a pasta inicial de documentação (docs/).