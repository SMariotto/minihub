# Arquitetura do Projeto: MINIhub

Este documento descreve a estrutura de engenharia do MINIhub, projetado para ser escalável, modular e multiplataforma (Web, Mobile e Desktop).

## Padrão de Arquitetura: Monorepo Modular
O projeto utiliza a estratégia de Monorepo, separando a aplicação em aplicações executáveis (apps) e módulos reutilizáveis de lógica e interface (packages).

### Divisão de Pastas:
1. **apps/**: Contém as interfaces finais que os usuários acessam.
   - `web/`: Aplicação web construída para navegadores.
   - `mobile/`: Aplicativo nativo para Android e iOS.
   - `desktop/`: Aplicação para Windows, Mac e Linux.
2. **packages/**: Contém o coração do sistema, totalmente isolado de interface gráfica.
   - `business-logic/`: Regras de negócio puras e cálculos matemáticos (Ex: regras do Brawl Stars).
   - `database-client/`: Conexão direta com o banco de dados e autenticação do Supabase.
   - `ui-components/`: Componentes visuais genéricos e compartilhados.
3. **docs/**: Manuais técnicos e documentação para desenvolvedores.

## Regra de Ouro do Código (Clean Code)
Fica estritamente proibido o uso de comentários explicativos dentro dos arquivos de código. A legibilidade deve ser alcançada através de:
- Funções com responsabilidade única.
- Nomes de variáveis e funções longos e autoexplicativos.
- Código limpo e modularizado nas camadas corretas.