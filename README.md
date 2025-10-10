# Lista de Nombres - Astro + React

Una aplicación simple y rápida para gestionar una lista de nombres, construida con **Astro** y **React**, optimizada para impresión en hoja A4.

## 🚀 Características

- ✅ Agregar nombres a una lista
- ✏️ Editar nombres existentes (click en el nombre para mostrar botones)
- 🗑️ Eliminar nombres
- 💾 Almacenamiento local (localStorage)
- 🖨️ Optimizada para impresión en A4
- 🎨 Soporte para tipografía personalizada
- ⚡ Bundle mínimo con Astro
- ⚛️ Componentes React para mejor UX
- 🎯 Botones ocultos por defecto (solo visibles al hacer click)

## 📁 Estructura del Proyecto

```
/
├── public/
│   └── fonts/              # Coloca aquí tus fuentes personalizadas
├── src/
│   ├── components/
│   │   └── NamesList.tsx   # Componente React principal
│   ├── pages/
│   │   └── index.astro     # Página principal
│   └── styles/
│       └── names-list.css  # Estilos separados
└── package.json
```

## 📝 Instalación de Tipografía Custom

Para usar tu propia tipografía:

1. Coloca tu archivo de fuente en `/public/fonts/`
2. Actualiza la ruta en `/src/styles/names-list.css`:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/tu-fuente.ttf') format('truetype');
  /* O usa múltiples formatos:
  src: url('/fonts/tu-fuente.woff2') format('woff2'),
       url('/fonts/tu-fuente.woff') format('woff'),
       url('/fonts/tu-fuente.ttf') format('truetype');
  */
}
```

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📄 Uso

1. **Agregar nombres**: Escribe un nombre en el input y presiona "Agregar" o Enter
2. **Mostrar botones**: Click en un nombre para ver los botones [Editar] y [Borrar]
3. **Editar**: Click en "Editar", modifica el nombre y guarda
4. **Eliminar**: Click en "Borrar" y confirma
5. **Imprimir**: Usa Ctrl+P o Cmd+P para imprimir la lista en A4

Los nombres se guardan automáticamente en el navegador (localStorage).

## 🎨 Personalización

### Espaciado entre nombres
Edita la variable CSS `--spacing` en `/src/styles/names-list.css`:

```css
:root {
  --spacing: 2rem; /* Cambia este valor */
}
```

### Tamaño de fuente
Modifica `.name-text` en los estilos:

```css
.name-text {
  font-size: 1.5rem; /* Ajusta según necesites */
}
```

### Márgenes de impresión
Ajusta en la regla `@page`:

```css
@page {
  size: A4;
  margin: 2cm; /* Ajusta los márgenes */
}
```

### Colores de botones
Personaliza los colores en la sección `@media screen` del CSS.

## 📦 Stack Tecnológico

- **Astro**: Framework estático ultrarrápido
- **React**: Componentes interactivos con hooks
- **TypeScript**: Tipado estático para mayor seguridad
- **CSS nativo**: Sin dependencias de estilos, todo separado en su archivo

## 🎯 Bundle Size

Gracias a Astro y la arquitectura de islas:
- HTML estático
- JavaScript de React solo donde se necesita
- CSS separado y optimizado
- Carga instantánea

## ✨ Mejoras vs Versión Vanilla

- ✅ Código más mantenible con React
- ✅ Estado reactivo con hooks
- ✅ CSS separado en archivo dedicado
- ✅ Mejor organización con componentes
- ✅ TypeScript para mayor seguridad
- ✅ Misma funcionalidad, mejor arquitectura

---

Hecho con ❤️ usando Astro + React
