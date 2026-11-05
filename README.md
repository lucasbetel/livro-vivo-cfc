# Livro Vivo · Exame de Suficiência CFC

Livro interativo para estudar para o **Exame de Suficiência do CFC (Bacharel em Ciências Contábeis)**.
O conteúdo segue o Anexo II do edital 2/2026 (FGV). São 24 lições, cada uma com:

pergunta → palpite → teoria em páginas de caderno → experimento interativo (alguns em 3D) →
macetes → questões no estilo da banca com comentário → resumo de bolso.

Também tem simulado de 50 questões com cronômetro de 4 h, caderno de erros automático,
plano de estudo até a data da prova, versão em texto (para imprimir ou gerar PDF), modo leitura e
navegação pelo teclado (← → viram a página, Esc volta ao sumário, L liga o modo leitura).

## Para abrir

Dê dois cliques em **`Livro-Vivo-CFC.html`**. Funciona offline, no computador ou no celular
(é só mandar o arquivo para o aparelho). O progresso fica salvo no próprio navegador.

## Para desenvolver

```bash
npm install
npm run dev                  # http://localhost:5173
node scripts/validar.mjs     # confere a estrutura das lições
npm run build                # gera dist/index.html (arquivo único)
```

As lições ficam em `src/lessons/NN-slug.js`; o padrão está em `LICOES.md`.

> Material de estudo de apoio. Leis e normas mudam: confira o edital vigente e as normas
> atualizadas no site do CFC (vale o que estava vigente até 90 dias antes da prova).
