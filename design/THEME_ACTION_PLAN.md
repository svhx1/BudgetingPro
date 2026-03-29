# 🚨 PROTÓCOLO ABSOLUTO: THEME MIGRATION & DESIGN QA 🚨

> **Contexto:** Durante a migração de Temas Dark-Only para Multi-Theme (Liquid Glass Sóbrio), dezenas de propriedades internas de SVG e Canvas (`fill`, `stroke`) foram ignoradas por scripts e Regexes que focavam apenas nas classes do Tailwind (`text-white`, `bg-black`). O resultado foi uma quebra massiva de legibilidade em Gráficos (Recharts) no Light Mode.

Para **NUNCA MAIS** repetir esse esquecimento, a Inteligência Artificial deve seguir estritamente o Checklist abaixo em qualquer alteração visual estrutural:

## 1. O Ponto Cego das Bibliotecas de Gráficos (Recharts, Chart.js)
Componentes gráficos **NÃO HERDAM** classes Tailwind de texto automaticamente se não forem passadas para os atributos de desenho do SVG/Canvas.
*   **O que buscar:** Faça um `grep` imediato no projeto por:
    *   `<XAxis`
    *   `<YAxis`
    *   `<Tooltip`
    *   `<CartesianGrid`
    *   `fill="#fff"` ou `stroke="rgba(255,`
*   **Como consertar:** Propriedades de Charting SVG devem ser ancoradas estritamente em propriedades semânticas extraídas diretamente da raiz de estilos:
    *   ❌ `tick={{ fill: "#fff" }}` ou `tick={{ fill: "rgba(255,255,255,0.5)" }}`
    *   ✅ `tick={{ fill: "var(--color-text-muted)" }}`
    *   ✅ `stroke="var(--color-text-main)" strokeOpacity={0.15}`

## 2. Tooltips e Contextos Flutuantes (Z-Index Extremo)
Alerte-se para fundos transparentes (`/95`, `/80`) que podem não fornecer contraste adequado caso a Box-Shadow ou o Glassmorphism do fundo falhem em Light Modes.
*   Tooltips **devem** usar a cor contrária ou referenciar o `--color-text-main` ou possuir fundos baseados em `var(--color-base-bg)` em vez de pretos fixos como `bg-[#1a1a1a]`.

## 3. Script de Auto-Replace não é "Bala de Prata"
Após desenvolver e rodar scripts de AST/Regex em massa convertendo Tailwind, o próximo passo **imediato** do AI é compilar e examinar se restaram nós cegos renderizados por Engine de Terceiros (ex: SVGs gerados via código JS, como Recharts).

## 4. Cores Hardcoded são Estritamente Proibidas
Qualquer injeção de estilo deve referenciar as chaves do *Theme Engine* injetadas em Runtime.
*   **Permitido:** `text-(--color-text-main)` ou `text-accent`.
*   **Banido:** `text-white`, `text-gray-200`, `text-black`, `bg-white/10` (em contextos de cor adaptável). Cores literais só podem ser usadas SE forem absolutas (ex: Botões de perigo sempre vermelhos `bg-red-500` ignorando o tema).

---
**Status Final:** Assinado e reconhecido pela IA. Qualquer prompt de redesign deve primeiramente validar este documento.
