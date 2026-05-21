# Contexto Atual do Projeto: MINIhub

[Status]: Fase 2 - Estruturação do Esqueleto do Monorepo
[Última Alteração]: Criação do pacote @minihub/business-logic dentro de packages/.

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
  - apps/ (Vazio)
  - packages/
    - business-logic/
      - package.json (Configuração do módulo de lógica)
  - package.json (Configuração mestre)
  - CONTEXT.md (Este arquivo)

## 🎯 O que já foi feito:
- [x] Alinhamento do escopo do projeto e regras arquiteturais.
- [x] Instalação e configuração do Node.js, VS Code e Git.
- [x] Criação do repositório no GitHub e ajuste do terminal para Git Bash.
- [x] Criação da página de Diário de Bordo no Notion.
- [x] Criação das pastas principais (apps, docs, packages) no VS Code.
- [x] Criação do manual técnico docs/architecture.md.
- [x] Inicialização do package.json mestre na raiz do projeto.
- [x] Criação do módulo interno packages/business-logic com seu respectivo package.json.
- [x] Criação do arquivo CONTEXT.md na raiz com regras de entrega total de código.

## 🚀 Próximo Passo Crítico:
- Criar a função matemática pura de cálculo de metas diárias do Brawl Stars dentro do pacote business-logic (Sem comentários!).