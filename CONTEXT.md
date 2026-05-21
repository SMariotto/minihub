# Contexto Atual do Projeto: MINIhub

[Status]: Fase 3 - Desenvolvimento da Camada de Apresentação e Integração de Lógica
[Última Alteração]: Integração completa do pacote @minihub/business-logic dentro do app Web e criação da tela de gerenciamento do Brawl Stars.

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
        - App.tsx (Hub Principal e Tela do Brawl Stars com cálculo em tempo real)
        - main.tsx
        - index.css
      - package.json
      - vite.config.ts
  - packages/
    - business-logic/
      - src/
        - index.ts (Funções matemáticas em TypeScript da meta)
      - package.json
  - package.json (Configuração mestre)
  - CONTEXT.md (Este arquivo)

## 🎯 O que já foi feito:
- [x] Alinhamento do escopo do projeto, regras arquiteturais e setup de ambiente (Node, VS Code, Git Bash).
- [x] Criação da página de Diário de Bordo no Notion.
- [x] Inicialização do Monorepo e Workspaces do Node.js.
- [x] Estruturação modular da lógica em packages/business-logic/src/index.ts.
- [x] Configuração de atalhos de importação (Aliases) no Vite.
- [x] Interface do Hub com design de catálogo estilo PlayStation.
- [x] Criação da tela interna do Brawl Stars integrada com a lógica matemática, suporte a tags, inputs manuais e prazos dinâmicos por dias ou calendário.

## 🚀 Próximo Passo Crítico:
- Criar a conta no banco de dados do Supabase para começar a salvar as metas criadas pelos usuários na nuvem de verdade ou criar a simulação completa da API do Brawl Stars.