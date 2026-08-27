<!--- 
  README: Task Manager API
  - Projeto: API REST para gerenciamento de tarefas (TypeScript + Express + Prisma)
  - Objetivo: README organizado seguindo boas práticas de design e usabilidade
-->

<div align="center">
  <h1>Task Manager — API</h1>
  <p>API REST para gerenciamento de tarefas construída com <strong>TypeScript</strong>, <strong>Express</strong> e <strong>Prisma (SQLite)</strong>.</p>

  <!-- Badges (opcional: atualizar URLs conforme CI) -->
  <p>
    <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  </p>
</div>

---

## Índice

- [Visão geral](#visão-geral)
- [Principais features](#principais-features)
- [Stack tecnológica](#stack-tecnológica)
- [Quickstart | Rodando localmente](#quickstart--rodando-localmente)
- [Configuração (ENV)](#configuração-env)
- [Prisma & Banco de dados](#prisma--banco-de-dados)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Endpoints principais (resumo)](#endpoints-principais-resumo)
- [Formato de erros e códigos HTTP](#formato-de-erros-e-códigos-http)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Boas práticas e próximos passos sugeridos](#boas-práticas-e-próximos-passos-sugeridos)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão geral

Esta API provê operações CRUD para tarefas com recursos adicionais:

- Soft delete (deletedAt)
- Restauração de tarefas
- Filtros e paginação (status, priority, search, sortBy, sortOrder, page, limit)
- Estatísticas (total, completed, pending, inProgress)
- Documentação OpenAPI (Swagger)

É projetada para ser simples, testável e pronta para extensão (autenticação, autorização, multi-tenant, etc.).

---

## Principais features

- CRUD completo para Tasks
- Soft delete + restore
- Bulk delete
- Filtros e paginação
- Estatísticas agrupadas
- Validação de entrada com Zod
- Documentação automática com Swagger
- Código em TypeScript com separação controller/service/repository

---

## Stack tecnológica

- Node.js (>=18)
- TypeScript
- Express
- Prisma (SQLite por padrão)
- Zod (validação)
- swagger-jsdoc + swagger-ui-express (documentação)

---

## Quickstart | Rodando localmente

1. Clonar o repositório

```bash
git clone <repo-url> task_mananger
cd task_mananger/backend
```

2. Instalar dependências

```bash
npm install
```

3. Criar arquivo `.env` (exemplo abaixo)

4. Gerar cliente Prisma e rodar migração inicial

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Rodar em modo desenvolvimento (watch)

```bash
npm run dev
```

6. Acessar

- Swagger UI: http://localhost:3000/api-docs
- API base: http://localhost:3000/api/tasks

---

## Configuração (ENV)

Exemplo mínimo de `.env` (colocar dentro de `backend/`):

```
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

- DATABASE_URL: string de conexão do Prisma. Ex.: SQLite local `file:./dev.db`.
- PORT: porta do servidor
- FRONTEND_URL: origem permitida para CORS
- NODE_ENV: environment (development/production)

---

## Prisma & Banco de dados

Prisma é usado com SQLite por padrão (arquivo local). Arquivo de modelo:

- [schema.prisma](C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/prisma/schema.prisma)

Comandos úteis:

- Gerar client: `npx prisma generate`
- Criar/rodar migração dev: `npx prisma migrate dev --name init`
- Abrir Prisma Studio: `npx prisma studio`

---

## Documentação da API (Swagger)

A documentação OpenAPI é exposta em runtime via Swagger UI:

- URL: `http://localhost:3000/api-docs`
- Config: [backend/src/config/swagger.ts](C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/config/swagger.ts)
- Rotas anotadas: [backend/src/routes/task.routes.ts](C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/routes/task.routes.ts)

---

## Endpoints principais (resumo)

Principais rotas (ver Swagger para detalhes e schemas):

- GET /api/tasks — listar (filtros e paginação)
- GET /api/tasks/stats — estatísticas
- POST /api/tasks — criar
- GET /api/tasks/:id — buscar por id
- PUT /api/tasks/:id — atualizar
- DELETE /api/tasks/:id — soft delete
- PATCH /api/tasks/:id/restore — restaurar
- DELETE /api/tasks/bulk — remover em lote

Exemplo: criar tarefa

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Exemplo","description":"Detalhe"}'
```

---

## Formato de erros e códigos HTTP

Padrão usado nas respostas:

- Sucesso: resposta com o código HTTP adequado (200, 201, 204)
- Erro de cliente: 400 (Bad Request), 404 (Not Found)
- Erro servidor: 500 (Internal Server Error)

Exemplo de corpo de erro (JSON):

```json
{
  "error": "Mensagem curta explicando o erro",
  "details": { "field": "mensagem" }
}
```

> Recomenda-se centralizar respostas de erro por meio de um middleware para manter consistência.

---

## Estrutura do projeto

Raiz (simplificado):

```
/backend
  src/
    controllers/    # handlers HTTP
    services/       # regras de negócio
    repository/     # acesso ao banco (Prisma)
    routes/         # rotas e documentação OpenAPI
    middlewares/    # validação / erro
    config/         # prisma / swagger / constantes
  prisma/
    schema.prisma
  package.json
```

Arquivos principais (navegar):

- [App principal](/C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/app.ts)
- [Rotas](/C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/routes/task.routes.ts)
- [Controller](/C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/controllers/task.controller.ts)
- [Service](/C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/services/task.service.ts)
- [Repository (Prisma)](/C:/Users/ferna/OneDrive/Desktop/task_mananger/backend/src/repository/task.repository.ts)

---

## Boas práticas & próximos passos sugeridos

Estas são sugestões para deixar o projeto pronto para produção:

- Adicionar middleware global de tratamento de erros e padronizar formato de resposta
- Implementar autenticação/authorization (JWT)
- Criar testes automatizados (unit + integration)
- Scripts de seed para popular o DB em dev
- CI (lint, build, test) e badges no README
- Monitoramento/telemetria para produção

---

## Desenvolvimento & Contribuição

1. Abra uma issue com o que pretende implementar
2. Crie um branch `feature/<descrição>` a partir de `main`
3. Faça commits atômicos e escreva testes quando aplicável
4. Abra um Pull Request descrevendo alterações

---

## Licença

MIT — veja o arquivo LICENSE (ou adicione se desejar)

---

Se quiser, aplico:
- README traduzido para inglês;
- Badges dinâmicos (GitHub Actions);
- Adição de screenshots do Swagger UI;
- Arquivo CONTRIBUTING.md com guidelines detalhadas.
# task_mananger
