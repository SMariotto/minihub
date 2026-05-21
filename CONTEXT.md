# Contexto Atual do Projeto: MINIhub

[Status]: Fase 1 - Preparação e Alinhamento de Ambiente
[Última Alteração]: Setup de ambiente concluído (Node, VS Code, Git/GitHub) e Diário de Bordo criado.

## Diretrizes Mandatórias (NUNCA QUEBRAR):
1. PROIBIDO adicionar qualquer comentário no código (Ex: // Comentário). O código deve ser limpo e autoexplicativo (Clean Code).
2. Sempre forneça o código 100% ATUALIZADO e COMPLETO. Nunca envie apenas trechos ou peça para o usuário substituir partes manualmente. O usuário precisa ser capaz de dar Ctrl+A e Ctrl+V no arquivo inteiro.
3. Arquitetura Modular e Multiplataforma (Web, Mobile e PC) separada em camadas: Domínio (Lógica), Dados (Supabase) e Apresentação (Interface).
4. Estilo Visual da Web: Cards modernos estilo Netflix/PlayStation.
5. Fluxo do Brawl Stars: Busca por Tag (API) com Sincronização em tempo real + Fallback Manual (digitação manual se a API falhar).

## Estrutura de Pastas Almejada:
- minihub-monorepo/
  - docs/ (Manuais e Schemas)
  - apps/ (web, mobile, desktop)
  - packages/ (business-logic, database-client, ui-components)
  - CONTEXT.md (Este arquivo)

## O que já foi feito:
- [x] Alinhamento do escopo do projeto e regras arquiteturais.
- [x] Instalação e configuração do Node.js, VS Code e Git (via terminal).
- [x] Criação do repositório no GitHub para versionamento.
- [x] Criação da página de Diário de Bordo no Notion.
- [x] Criação do arquivo CONTEXT.md na raiz com regras de entrega total de código.

## Próximo Passo Crítico:
- Inicializar a estrutura do Monorepo localmente e criar a pasta de documentação técnica (docs/).