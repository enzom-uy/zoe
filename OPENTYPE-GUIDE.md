# 📖 Guía de Características OpenType - josephsophia.ttf

## 🎨 Introducción

La fuente **josephsophia.ttf** incluye características OpenType que permiten usar alternativas caligráficas especiales para las letras. Esta guía explica cómo implementar y usar estas alternativas en tu proyecto.

## 🔤 Características OpenType Disponibles

### 1. **ss01** - Letras con corazón al final ❤️

- **Descripción**: Las letras terminan con un corazón caligráfico decorativo
- **Uso recomendado**: Última letra de palabras o nombres
- **CSS**: `font-feature-settings: "ss01";`
- **Ejemplo**: "María" → "Maríả" (con corazón al final)

### 2. **ss02** - Línea caligráfica + corazón ✨❤️

- **Descripción**: Las letras comienzan con una línea caligráfica que se une al corazón final
- **Uso recomendado**: Primera letra de palabras o combinación con ss01
- **CSS**: `font-feature-settings: "ss02";`
- **Ejemplo**: "Ana" → "Ạna" (con línea inicial y corazón)

### 3. **ss03** - Alternativa 3 🎨

- **Descripción**: Variante estilística adicional
- **CSS**: `font-feature-settings: "ss03";`

### 4. **swsh** - Flourishes caligráficos 💫

- **Descripción**: Añade flourishes (adornos) caligráficos elegantes
- **Uso recomendado**: Letras mayúsculas o palabras destacadas
- **CSS**: `font-feature-settings: "swsh";`

### 5. **salt** - Alternativas estilísticas 🎭

- **Descripción**: Variantes alternativas generales de las letras
- **CSS**: `font-feature-settings: "salt";`

### 6. **calt** - Alternativas contextuales 🔄

- **Descripción**: Se aplican automáticamente según el contexto de letras adyacentes
- **CSS**: `font-feature-settings: "calt";`

## 🛠️ Implementación en el Proyecto

### Opción 1: Aplicar a todo el texto

```css
.custom-text {
  font-family: "CustomFont", Georgia, serif;
  font-feature-settings: "ss01"; /* Todas las letras con corazón */
}
```

### Opción 2: Aplicar a letras específicas con CSS

```html
<span style="font-family: CustomFont; font-feature-settings: 'ss02';">A</span>na
<span style="font-family: CustomFont; font-feature-settings: 'ss01';">a</span>
```

### Opción 3: Usar el Editor OpenType (Recomendado)

El proyecto incluye un componente React `OpenTypeEditor` que permite:

- Seleccionar letras individuales
- Aplicar diferentes características OpenType por letra
- Vista previa en tiempo real
- Guardar configuraciones personalizadas

**Uso:**

```tsx
import { OpenTypeEditor } from "@/components/OpenTypeEditor";

<OpenTypeEditor
  text="Ana María"
  fontSize={48}
  onStylesChange={(styles) => console.log(styles)}
/>;
```

## 📄 Páginas de Prueba

### 1. `/font-test` - Análisis Completo

Muestra todas las características OpenType lado a lado para comparación visual.

**Acceso:** http://localhost:4321/font-test

**Contenido:**

- Alfabeto completo con cada característica
- Comparación lado a lado
- Showcase de letras individuales
- Ejemplos de nombres

### 2. `/opentype-editor` - Editor Interactivo

Editor visual para aplicar características OpenType letra por letra.

**Acceso:** http://localhost:4321/opentype-editor

**Funciones:**

- Selección de letras individuales
- Aplicación de estilos por letra
- Aplicar a todas las letras
- Reset completo
- Vista previa de cada estilo

## 💡 Casos de Uso Prácticos

### Caso 1: Nombre con corazón al final

```html
<!-- "María" con corazón en la última letra -->
<span style="font-family: CustomFont;">Marí</span
><span style="font-family: CustomFont; font-feature-settings: 'ss01';">a</span>
```

### Caso 2: Primera y última letra decoradas

```html
<!-- "Ana" con línea inicial y corazón final -->
<span style="font-family: CustomFont; font-feature-settings: 'ss02';">A</span
><span style="font-family: CustomFont;">n</span
><span style="font-family: CustomFont; font-feature-settings: 'ss01';">a</span>
```

### Caso 3: Palabra completa con flourishes

```css
.fancy-name {
  font-family: "CustomFont", Georgia, serif;
  font-feature-settings: "swsh", "calt";
}
```

## 🎯 Integración con NamesList

Para integrar características OpenType en el componente principal de nombres:

```tsx
// En NamesList.tsx
interface NameItem {
  id: string;
  name: string;
  charStyles?: Map<number, string>; // Estilos por carácter
}

// Renderizar con estilos personalizados
{
  name.split("").map((char, index) => {
    const feature = charStyles?.get(index) || "normal";
    return (
      <span
        key={index}
        style={{
          fontFeatureSettings: feature === "normal" ? "normal" : `"${feature}"`,
        }}
      >
        {char}
      </span>
    );
  });
}
```

## 📚 Recursos Adicionales

### Comandos CSS útiles

```css
/* Resetear todas las características */
.reset {
  font-feature-settings: normal;
}

/* Combinar múltiples características */
.combined {
  font-feature-settings: "ss01", "calt", "liga";
}

/* Desactivar una característica */
.no-calt {
  font-feature-settings: "calt" 0;
}
```

### Compatibilidad de navegadores

- ✅ Chrome/Edge 48+
- ✅ Firefox 34+
- ✅ Safari 9.1+
- ✅ Opera 35+

### En impresión

Las características OpenType se mantienen al imprimir:

```css
@media print {
  .name-text {
    font-feature-settings: inherit;
    -webkit-font-feature-settings: inherit;
  }
}
```

## 🚀 Quick Start

1. **Ver todas las variantes:**

   ```bash
   npm run dev
   ```

   Navega a: http://localhost:4321/font-test

2. **Probar el editor:**
   Navega a: http://localhost:4321/opentype-editor

3. **Implementar en tu código:**
   ```tsx
   <span
     style={{
       fontFamily: "CustomFont, Georgia, serif",
       fontFeatureSettings: '"ss01"',
     }}
   >
     María
   </span>
   ```

## 🔧 Troubleshooting

### Las características no se aplican

- ✅ Verifica que la fuente esté cargada correctamente
- ✅ Revisa que el navegador soporte `font-feature-settings`
- ✅ Asegúrate de usar comillas dobles dentro de las simples: `'"ss01"'`

### Las características se ven iguales

- ✅ Algunas características solo afectan ciertas letras
- ✅ Prueba con diferentes palabras y letras
- ✅ Verifica en la página `/font-test` para comparación

### En React no funciona

- ✅ Usa el formato: `fontFeatureSettings: '"ss01"'` (camelCase)
- ✅ O usa el formato de objeto: `{ fontFeatureSettings: '"ss01"' }`

## 📝 Ejemplos de Código

### React Component

```tsx
const FancyName = ({ name }: { name: string }) => (
  <div
    style={{
      fontFamily: "CustomFont, Georgia, serif",
      fontSize: "48px",
      fontFeatureSettings: '"ss01"',
    }}
  >
    {name}
  </div>
);
```

### Con Tailwind CSS

```tsx
<div className="font-custom text-5xl" style={{ fontFeatureSettings: '"ss02"' }}>
  Ana María
</div>
```

### Editor personalizado simple

```tsx
const [feature, setFeature] = useState("normal");

<select onChange={(e) => setFeature(e.target.value)}>
  <option value="normal">Normal</option>
  <option value="ss01">Corazón final</option>
  <option value="ss02">Línea + Corazón</option>
</select>

<div style={{
  fontFamily: "CustomFont",
  fontFeatureSettings: feature === "normal" ? "normal" : `"${feature}"`
}}>
  {text}
</div>
```

## 🎓 Próximos Pasos

1. Experimenta con la página `/font-test` para identificar qué características te gustan más
2. Usa `/opentype-editor` para crear combinaciones personalizadas
3. Implementa el sistema en tu componente de nombres principal
4. Guarda las preferencias de estilo en localStorage para persistencia

---

**¿Preguntas?** Consulta la documentación de OpenType: https://helpx.adobe.com/fonts/using/open-type-syntax.html
