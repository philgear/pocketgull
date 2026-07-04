# Pocket-Gull UI/UX Styling and Design System Rules

This file outlines the styling guidelines, color systems, and animation standards for Pocket-Gull. Refer to these rules when building or modifying frontend components.

## 1. Color Palette System

The application uses a Tailwind custom extension matching the Google core brand colors. Always prefer these semantic scales over default Tailwind colors:

- **Primary Actions / Brand Blue**: 
  - Class prefix: `bg-brand-blue-500` (Google Blue: `#4285F4`), hover: `bg-brand-blue-600`
- **Success / Positive States / Brand Green**:
  - Class prefix: `bg-brand-green-500` (Google Green: `#34A853`), hover: `bg-brand-green-600`
- **Warnings / Vitals Alerts / Brand Amber**:
  - Class prefix: `bg-brand-amber-500` (Google Yellow: `#FBBC05`), hover: `bg-brand-amber-600`
- **Destructive / High Alerts / Brand Red**:
  - Class prefix: `bg-brand-red-500` (Google Red: `#EA4335`), hover: `bg-brand-red-600`

### Neutral Grays & Surfaces:
- **Light Mode**: Use clean backgrounds like `bg-gray-50` or `bg-slate-50` with card backgrounds `bg-white`.
- **Dark Mode**: Use sleek dark surfaces like `dark:bg-zinc-950` with card backgrounds `dark:bg-zinc-900` or `dark:bg-zinc-900/50`.

---

## 2. Aesthetics & Themes

To maintain a premium, state-of-the-art UI:
- **Glassmorphism**: Use backdrop filters for floaters, dialogs, and headers:
  - Class example: `bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-white/20 dark:border-zinc-800/30`
- **Shadows**: Keep shadows soft and modern. Prefer `shadow-sm` or `shadow-md` for cards; avoid heavy dark shadows.
- **Borders**: Avoid harsh borders. Use `border-gray-100 dark:border-zinc-800` or `border-slate-100 dark:border-zinc-900`.

---

## 3. Micro-Animations

Every interactive element (buttons, cards, inputs) must feel responsive and alive:
- **Transitions**: Always include `transition-all duration-200 ease-in-out` or `transition-colors`.
- **Hovers**: Combine scale adjustments and subtle shadows:
  - Class example: `hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`
- **Loading & Streaming**: Use custom breathing animations or skeleton loaders (`animate-pulse`) for incoming AI streaming responses.

---

## 4. Typography Hierarchy

- **Title Fonts**: Outfit or Inter (configured globally).
- **Sizing & Weight**:
  - Main headings: `text-2xl font-semibold tracking-tight text-gray-900 dark:text-zinc-100`
  - Sub-captions/metadata: `text-xs font-medium text-gray-400 dark:text-zinc-500`
  - Body text: `text-sm leading-relaxed text-gray-600 dark:text-zinc-300`

---

## 5. Responsive Layouts & Structure

- Always structure templates for a **Mobile-First** paradigm.
- Use CSS grid or flex layouts with clean gap values (e.g., `gap-4`, `gap-6`).
- Include accessible target sizes (buttons and inputs should have minimum heights of `h-10` or `h-12`).
