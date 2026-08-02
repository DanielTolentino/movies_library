# Movies Library

Aplicação React para consultar filmes do TMDB, com listagem dos mais bem avaliados, busca e página de detalhes.

## Como funciona

- `/`: mostra os filmes mais bem avaliados.
- `/search?q=...`: pesquisa filmes pelo título.
- `/movie/:id`: exibe os detalhes de um filme.

O navegador consulta somente `/api/movies`. A Function da Vercel consulta o TMDB usando a variável privada `TMDB_API_KEY`, mantendo a chave fora do código enviado ao cliente.

## Desenvolvimento

1. Instale as dependências com `npm install`.
2. Crie um `.env.local` a partir de `.env.example` e informe `TMDB_API_KEY`.
3. Execute `npm run dev:vercel` para iniciar o frontend e a Function da Vercel juntos.

O comando `npm run dev` inicia somente o servidor Vite. Para testar o fluxo completo localmente, use `npm run dev:vercel`.

## Deploy na Vercel

Configure `TMDB_API_KEY` nas variáveis de ambiente do projeto para os ambientes Preview e Production. A chave não deve ser adicionada ao repositório.

A Vercel detecta o Vite, executa `npm run build` e publica o diretório `dist`. As regras de deep link e os headers de segurança ficam em `vercel.json`.
