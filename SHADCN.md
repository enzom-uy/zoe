# shadcn/ui Implementation

Este proyecto ahora usa **shadcn/ui** con **Tailwind CSS** para los componentes de UI.

## Componentes implementados

### Button

- Ubicación: `src/components/ui/button.tsx`
- Variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Tamaños: `default`, `sm`, `lg`, `icon`
- Uso en: Botones de agregar, subir archivo, eliminar, editar, guardar, cancelar

### Input

- Ubicación: `src/components/ui/input.tsx`
- Uso en: Campo de texto para nombres, campo de tamaño de fuente, input de edición

### Card

- Ubicación: `src/components/ui/card.tsx`
- Uso en: Contenedor de la sección de inputs y controles

## Iconos - Lucide React

El proyecto usa **lucide-react** para los iconos:

- `Plus` - Agregar nombre
- `Upload` - Subir archivo .txt
- `Trash2` - Eliminar nombre/todos
- `Edit2` - Editar nombre
- `Check` - Guardar edición
- `X` - Cancelar edición

## Estilos Globales

Los estilos de shadcn/ui están en `src/styles/globals.css` que incluye:

- Variables CSS para tema claro y oscuro
- Configuración de Tailwind
- Fuente personalizada (CustomFont)

## Configuración

### Tailwind Config (`tailwind.config.mjs`)

- Tema extendido con colores de shadcn/ui
- Animaciones personalizadas
- Plugin `tailwindcss-animate`

### TypeScript Config (`tsconfig.json`)

- Path alias `@/*` apunta a `./src/*`
- Permite imports como `@/lib/utils` y `@/components/ui/*`

### Astro Config (`astro.config.mjs`)

- Integración de React
- Integración de Tailwind con `applyBaseStyles: false`

## Utilidades

### cn() - Class Name Merge

Ubicación: `src/lib/utils.ts`

Función para combinar clases de Tailwind de manera segura:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />;
```

## Personalización

Los colores del tema se pueden modificar en:

1. `src/styles/globals.css` - Variables CSS HSL
2. `tailwind.config.mjs` - Extensiones del tema

## Componentes Personalizados Conservados

Los estilos personalizados se mantienen en `src/styles/names-list.css`:

- Layout de drag & drop
- Estilos de impresión para A4
- Grid de nombres con bordes punteados
- Fuente personalizada (CustomFont)
- Animaciones de drag & drop

## Next Steps

Puedes agregar más componentes de shadcn/ui según necesites:

- Alert Dialog (para confirmaciones)
- Toast (para notificaciones)
- Select (para opciones de tamaño de fuente)
- Badge (para contadores)

Para agregar un nuevo componente de shadcn/ui, copia el código desde [ui.shadcn.com](https://ui.shadcn.com/) a `src/components/ui/`.
