# Design System — Plataforma de Jogos Arcade

Documento de referência e alinhamento para o frontend. Qualquer nova feature de UI deve consultar e, se necessário, atualizar este documento.

---

## 1. Objetivo e princípios

### Objetivo

Interface amigável e consistente no estilo **plataforma de jogos arcade**: fundo escuro, acentos com sensação de brilho/neon, cards como “tiles” de jogos, navegação clara e feedback visual em interações.

### Princípios

- **Consistência:** Usar sempre os tokens (cores, espaçamento, tipografia) e os componentes base; evitar valores fixos e estilos ad hoc.
- **Acessibilidade:** Contraste adequado (WCAG), foco visível, labels em formulários, mensagens de erro associadas aos campos.
- **Performance:** Evitar dependências pesadas; fontes e estilos mínimos necessários.
- **Manutenção:** Design tokens em CSS e componentes reutilizáveis como única fonte de verdade para aparência e comportamento.

---

## 2. Tokens de design (referência)

Definidos em `src/index.css` na `:root`.

### Cores

| Variável | Uso |
|----------|-----|
| `--bg-page` | Fundo principal da aplicação |
| `--bg-card` | Fundo de cards, listas e painéis |
| `--bg-elevated` | Fundo de elementos elevados (inputs, áreas sobrepostas) |
| `--text-primary` | Texto principal |
| `--text-muted` | Texto secundário, hints |
| `--accent` | Links, destaques, bordas de foco |
| `--accent-hover` | Estado hover de links e itens ativos na navegação |
| `--success` | Ações positivas (ex.: aceitar convite) |
| `--success-hover` | Hover em botões de sucesso |
| `--danger` | Erros, ações destrutivas (ex.: rejeitar) |
| `--danger-hover` | Hover em botões de perigo |
| `--border` | Bordas neutras |
| `--glow` | Efeito de brilho (sombra/neon) em cards ou destaques |

### Tipografia

| Variável | Uso |
|----------|-----|
| `--font-display` | Títulos e marca (ex.: Orbitron) |
| `--font-body` | Corpo de texto |
| `--size-xs` a `--size-2xl` | Tamanhos de fonte |
| `--weight-normal`, `--weight-bold` | Pesos de fonte |

### Espaçamento

| Variável | Valor típico | Uso |
|----------|--------------|-----|
| `--space-1` | 4px | Margens/paddings mínimos |
| `--space-2` | 8px | Entre elementos próximos |
| `--space-3` | 12px | Padding interno de componentes |
| `--space-4` | 16px | Entre blocos pequenos |
| `--space-5` | 24px | Entre seções ou padding de card |
| `--space-6` | 32px | Entre seções maiores |
| `--space-7` | 48px | Espaçamento generoso |

### Raios e sombras

| Variável | Uso |
|----------|-----|
| `--radius-sm` | Bordas levemente arredondadas |
| `--radius-md` | Botões, inputs |
| `--radius-lg` | Elementos maiores |
| `--radius-card` | Cards e painéis |
| `--shadow-card` | Sombra padrão de cards |
| `--shadow-glow` | Brilho opcional (estilo arcade) |
| `--transition-fast` | 150ms — hover, focus |
| `--transition-normal` | 200ms — transições de layout |

---

## 3. Layout e estrutura

### AppLayout

- **Local:** `src/components/layout/AppLayout.tsx`
- **Uso:** Envolve todo o conteúdo das rotas protegidas. Inclui:
  - **Barra de navegação (topo):** logo/nome “Arcade”, links (Início, Perfil, Amigos), nome do usuário e botão Sair.
  - **Área de conteúdo:** `<main>` com `max-width: 960px`, centralizado, padding consistente; o `<Outlet />` do React Router é renderizado aqui.

### Regras de layout

- **Páginas públicas (login, register):** não usam `AppLayout`; tela cheia com conteúdo centralizado (card único).
- **Páginas protegidas:** sempre renderizadas dentro de uma rota que usa `AppLayout`; não repetir navegação nas páginas.

### Mobile (futuro)

- Planejar menu “hamburger” ou navegação colapsável em viewports pequenos; manter os mesmos itens e hierarquia.

---

## 4. Componentes

Todos em `src/components/ui/`. Exportados via `src/components/ui/index.ts`.

### Button

- **Props principais:** `variant`, `size`, `loading`, `disabled`, e todas as props nativas de `<button>`.
- **Variantes:** `primary` (ação principal), `success` (confirmar/aceitar), `danger` (rejeitar/remover), `ghost` (secundário).
- **Tamanhos:** `sm`, `md`.
- **Uso:** Sempre que precisar de uma ação clicável; usar `type="submit"` em formulários quando for o envio.

Exemplo:

```tsx
<Button variant="primary" size="md" loading={loading} type="submit">
  Entrar
</Button>
<Button variant="danger" size="sm" onClick={handleReject}>Rejeitar</Button>
```

### Card

- **Props:** `glow?` (opcional — borda/brilho no accent), `style`, e props de `div`.
- **Uso:** Agrupar conteúdo (perfil, lista de amigos, convites, blocos na Home). Usar `glow` para destaque (ex.: card de login/cadastro).

Exemplo:

```tsx
<Card glow>Conteúdo do card</Card>
<Card style={{ padding: 'var(--space-3)' }}>Item de lista</Card>
```

### Input

- **Props:** `label` (obrigatório), `error?`, mais todas as props nativas de `<input>`.
- **Uso:** Campos de formulário; sempre com `label`; usar `error` e mensagem para validação. Acessibilidade: `aria-invalid` e `aria-describedby` quando houver erro.

Exemplo:

```tsx
<Input
  label="E-mail"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
<Input label="Senha" type="password" error={errors.password} />
```

### PageSection

- **Props:** `title` (título da seção), `style`, e props de `<section>`.
- **Uso:** Agrupar blocos com título (ex.: “Convidar por nome de usuário”, “Convites recebidos”, “Lista de amigos”). Garante margem inferior consistente e título com fonte display.

Exemplo:

```tsx
<PageSection title="Convites recebidos">
  {invites.length === 0 ? <p>Nenhum convite.</p> : <ul>...</ul>}
</PageSection>
```

### NavLink

- **Props:** as do `NavLink` do React Router (`to`, `children`, etc.).
- **Uso:** Links de navegação que precisam de estado ativo (cor e peso diferentes). Pode ser usado no layout ou em menus; no `AppLayout` os links do topo usam estilo equivalente.

Exemplo:

```tsx
<NavLink to="/profile">Perfil</NavLink>
```

---

## 5. Páginas e rotas

| Rota | Página | Layout | Pública |
|------|--------|--------|---------|
| `/login` | Login | Não | Sim |
| `/register` | Register | Não | Sim |
| `/` | Home | Sim | Não |
| `/profile` | Profile | Sim | Não |
| `/friends` | Friends | Sim | Não |

- **Título de página:** um único `h1` por página, com `fontFamily: 'var(--font-display)'` e margem inferior consistente.
- **Seções:** `h2` com fonte display (via `PageSection` ou estilo equivalente).

---

## 6. Estilo visual “arcade”

- **Cores:** Fundo escuro (`--bg-page`), cards em `--bg-card`; acentos em azul/neon (`--accent`, `--glow`); sucesso em verde, perigo em vermelho.
- **Tipografia:** Títulos com `--font-display` (ex.: Orbitron); corpo com `--font-body`.
- **Sombras e brilho:** Cards com `--shadow-card`; opcionalmente `--shadow-glow` ou borda com `--accent` para “tiles” em destaque.
- **Animações:** Transições curtas (`--transition-fast` / `--transition-normal`) em hover e focus; evitar animações longas ou excessivas.

---

## 7. Acessibilidade e boas práticas

- **Contraste:** Manter texto e fundos com contraste adequado (referência WCAG 2.1 AA).
- **Foco:** Sempre foco visível em links e botões (`outline` com `--accent` em `:focus-visible`).
- **Formulários:** Todo campo com `<label>` associado; mensagens de erro com `role="alert"` e associação ao campo (`aria-describedby` / `id`).
- **Botões:** Não desativar sem feedback; usar estado `loading` quando a ação for assíncrona.

---

## 8. Convenções de código

- **Novos componentes:**
  - **UI genérica:** `src/components/ui/` — botões, inputs, cards, etc.
  - **Layout:** `src/components/layout/` — AppLayout e possíveis variações.
  - **Feature:** `src/components/<feature>/` ou dentro da página se for uso único.
- **Estilos:** Preferir variáveis CSS (`var(--...)`) em vez de valores fixos (hex, px soltos). Evitar estilos inline exceto para valores dinâmicos (ex.: width em %). Para novos componentes, usar classes em `index.css` ou CSS Modules se o projeto adoptar.
- **Imports:** Componentes UI via `import { Button, Card, ... } from '../components/ui'`.

---

## 9. Extensões futuras (parametrizações)

- **Temas:** Todas as cores vêm de tokens; um segundo tema (ex.: “light”) pode ser implementado sob outra `:root` ou `[data-theme="light"]` redefinindo as variáveis.
- **i18n:** Manter textos extraíveis (chaves) para tradução; não hardcodar strings longas em componentes sem planejar i18n.
- **Novas páginas:** “Detalhe de jogo”, “Lobby”, “Ranking” — usar sempre `AppLayout` e os componentes do design system; seguir o padrão de um `h1` por página e `PageSection` ou `h2` para seções.
- **Animações:** Definir duração padrão (`--transition-fast` / `--transition-normal`) e usar de forma consistente em hover, loading e transições de página; evitar duração maior sem justificativa.

---

*Última atualização alinhada à refatoração “Plataforma arcade” (layout único, tokens, componentes base e documento de design system).*
