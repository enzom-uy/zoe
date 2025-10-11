# Arquitectura del Proyecto Zoe

## 🎨 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    NamesListRefactored                       │
│                  (Componente Principal)                      │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │  useNameStorage    │  │   useCommandState          │    │
│  │  useKeyboardShortcuts│  │                            │    │
│  └────────────────────┘  └────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Sección de Input                         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │          AddNameInput                          │  │  │
│  │  │  • Input text                                  │  │  │
│  │  │  • Botón Agregar                              │  │  │
│  │  │  • Botón Subir .txt                           │  │  │
│  │  │  • Command hint badge                         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  • Control de tamaño de fuente global                │  │
│  │  • Botones de eliminar (seleccionados/todos)         │  │
│  │  • Hint de selección múltiple (Ctrl+Click)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Área de Nombres                          │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │          NamesGrid (TODO)                      │  │  │
│  │  │  ┌──────────────────────────────────────────┐ │  │  │
│  │  │  │        NameItem (TODO)                    │ │  │  │
│  │  │  │  • Nombre con estilos aplicados          │ │  │  │
│  │  │  │  • Botones editar/eliminar               │ │  │  │
│  │  │  │  • Selección múltiple (Ctrl+Click)       │ │  │  │
│  │  │  │  ┌────────────────────────────────────┐  │ │  │  │
│  │  │  │  │   NameEditor (TODO)                │  │ │  │  │
│  │  │  │  │   • Editor de texto                │  │ │  │  │
│  │  │  │  │   • Selector de caracteres         │  │ │  │  │
│  │  │  │  │   • Panel de estilos OpenType      │  │ │  │  │
│  │  │  │  │   • Control de tamaño individual   │  │ │  │  │
│  │  │  │  └────────────────────────────────────┘  │ │  │  │
│  │  │  └──────────────────────────────────────────┘ │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          CommandPalette (Ctrl+K)                      │  │
│  │  • Modo "main": Lista de comandos                     │  │
│  │  • Modo "edit": Buscar y editar nombres              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
┌──────────────┐
│ localStorage │
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│ useNameStorage   │ ← Estado centralizado
└─────┬────────────┘
      │
      ↓
┌─────────────────────┐
│ NamesListRefactored │ ← Orquestador principal
└─────┬───────────────┘
      │
      ├─→ AddNameInput       (agregar nombres)
      ├─→ CommandPalette     (buscar/editar)
      └─→ NamesGrid          (mostrar lista)
           └─→ NameItem      (item individual)
                └─→ NameEditor (editar estilos)
```

## 📦 Módulos y Responsabilidades

### Hooks (`src/hooks/`)

```
useNameStorage
├─ Cargar/guardar nombres en localStorage
├─ Gestionar fontSize global
├─ Estado de hints y Command usado
└─ Funciones: dismissHint, markCommandAsUsed

useCommandState
├─ Estado del Command (abierto/cerrado)
├─ Modo actual (main/edit)
├─ Atajo Ctrl+K
└─ Auto-focus del input

useKeyboardShortcuts
└─ Click fuera para deseleccionar
```

### Componentes (`src/components/names/`)

```
AddNameInput
├─ Input para nuevo nombre
├─ Botón agregar
├─ Botón subir archivo
└─ Badge animado del Command

CommandPalette
├─ Dialog modal (Ctrl+K)
├─ Modo main: lista de comandos
└─ Modo edit: buscar nombres con duplicados

NameItem (TODO)
├─ Mostrar nombre con estilos
├─ Botones editar/eliminar
└─ Multi-selección con Ctrl

NameEditor (TODO)
├─ Editor de texto
├─ Selector de caracteres
├─ Panel de estilos OpenType
└─ Control de tamaño individual

NamesGrid (TODO)
└─ Renderizar lista de NameItem
```

### Utilidades (`src/lib/`)

```
types/names.ts
├─ NameItem
├─ CharStyle
├─ CommandMode
└─ LetterStyle

constants/names.ts
├─ STORAGE_KEYS
├─ LETTER_STYLES
└─ Font size constraints

utils/names.ts
├─ processTextFile
├─ getFontFeatureSettings
├─ scrollToElement
└─ focusElement
```

## 🎯 Patrones de Diseño Utilizados

### Custom Hooks Pattern

- Encapsulación de lógica reutilizable
- Separación de concerns (storage, commands, keyboard)

### Container/Presentational Pattern

- `NamesListRefactored`: Container (lógica)
- `AddNameInput`, `CommandPalette`: Presentational (UI)

### Compound Components Pattern

- `CommandPalette` con modos intercambiables
- `NameEditor` con sub-componentes especializados

### Single Responsibility Principle

- Cada hook/componente tiene una única responsabilidad
- Fácil de mantener y testear

## 🚀 Ventajas de esta Arquitectura

1. **Modularidad**: Componentes pequeños y focalizados
2. **Reusabilidad**: Hooks pueden usarse en otros componentes
3. **Testabilidad**: Cada parte puede testearse independientemente
4. **Escalabilidad**: Fácil agregar nuevas features sin romper lo existente
5. **Mantenibilidad**: Código organizado y fácil de encontrar
6. **Type Safety**: TypeScript garantiza consistencia de datos
7. **Performance**: Hooks optimizados con dependencias correctas

## 📊 Métricas de Mejora

| Métrica                 | Antes | Después | Mejora |
| ----------------------- | ----- | ------- | ------ |
| Líneas por archivo      | 955   | ~100    | -89%   |
| Archivos                | 1     | 11      | +1000% |
| Complejidad ciclomática | Alta  | Baja    | +++    |
| Acoplamiento            | Alto  | Bajo    | +++    |
| Cohesión                | Baja  | Alta    | +++    |
