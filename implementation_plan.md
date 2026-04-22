# Plano de Redesign UI/UX Premium & Gamificado

O objetivo é transformar o SAAS NOMMAD em uma interface de elite, com estética "Artist OS" premium, utilizando efeitos de vidro (glassmorphism), brilhos (glow), animações fluidas e um sistema de gamificação visível em todo o sistema.

## User Review Required

> [!IMPORTANT]
> A navegação lateral (Sidebar) será alterada para um estilo flutuante. Isso reduzirá um pouco o espaço horizontal disponível para o conteúdo principal, mas aumentará drasticamente a percepção de design moderno.
> 
> A barra superior (TopBar) será fixa e conterá os dados de Level, XP e Nomad Points. Precisamos definir se esses dados virão do banco de dados agora ou se usaremos dados mockados inicialmente para a UI.

## Proposed Changes

### 🎨 Design System & Global Styles
Atualizar a base visual para suportar o novo look premium.

#### [MODIFY] [globals.css](file:///d:/SAAS%20NOMMAD/apps/web/src/app/globals.css)
- Adicionar variáveis de tema para cores de destaque (accent), brilhos (glow) e sombras premium.
- Implementar o `mesh-bg` aprimorado para o fundo do app.
- Configurar o layout para suportar a `TopBar` fixa e a `Sidebar` flutuante.

#### [MODIFY] [glass.css](file:///d:/SAAS%20NOMMAD/apps/web/src/styles/glass.css)
- Refinar as classes `.glass`, `.glass-card` e `.glass-sidebar`.
- Adicionar variações de glow dinâmicos (`glow-amber`, `glow-blue`, etc).
- Criar a classe `.floating-category` para cards que parecem flutuar.

---

### 🏗️ Layout & Navigation
Implementar a estrutura flutuante e a gamificação no topo.

#### [NEW] [top-bar.tsx](file:///d:/SAAS%20NOMMAD/apps/web/src/components/top-bar.tsx)
- Barra fixa no topo com:
  - Indicador de Nível (Ex: LVL 14)
  - Barra de Progresso de XP linear e elegante.
  - Contador de Pontos (Nomad Points).
  - Avatar do usuário com anel de status.

#### [MODIFY] [sidebar.tsx](file:///d:/SAAS%20NOMMAD/apps/web/src/components/sidebar.tsx)
- Transformar em um elemento flutuante (afastado das bordas).
- Melhorar os estados de hover e active com efeitos de luz.

#### [MODIFY] [layout.tsx](file:///d:/SAAS%20NOMMAD/apps/web/src/app/(app)/layout.tsx)
- Integrar a `TopBar`.
- Ajustar os paddings para acomodar a nova estrutura.

---

### 🎮 Chefões (Boss System)
Transformar a aba de chefões em uma experiência de jogo.

#### [MODIFY] [chefoes/page.tsx](file:///d:/SAAS%20NOMMAD/apps/web/src/app/(app)/chefoes/page.tsx)
- Redesenhar os cards de dossiê (`CaseFile`) para parecerem "Boss Cards".
- Adicionar indicadores de "HP" (Interesse) e "Stamina" (Urgência) mais visuais.
- Implementar efeitos de animação ao abrir novos casos ou enviar provas.

#### [MODIFY] [character-portrait.tsx](file:///d:/SAAS%20NOMMAD/apps/web/src/components/ui/character-portrait.tsx)
- Adicionar molduras (frames) de raridade ou nível para os retratos dos chefões.

---

### ✨ Animations & Polish
#### [MODIFY] [animations.css](file:///d:/SAAS%20NOMMAD/apps/web/src/styles/animations.css)
- Adicionar animações de entrada (fade + slide up).
- Adicionar pulsações sutis em elementos de destaque.

## Verification Plan

### Automated Tests
- Verificar via browser se a barra superior permanece fixa ao dar scroll.
- Verificar se a sidebar flutuante não sobrepõe conteúdo crítico em telas menores.

### Manual Verification
- Validar se o efeito de "glow" está sutil e não prejudica a leitura.
- Testar a responsividade da nova estrutura de layout.
