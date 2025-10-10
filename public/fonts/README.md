# Tipografía Personalizada

Coloca aquí tus archivos de fuente personalizados.

## Archivos necesarios:

- `custom-font.woff2` (recomendado - formato moderno y comprimido)
- `custom-font.woff` (compatibilidad)
- `custom-font.ttf` (fallback)

## Cómo agregar tu fuente:

1. Coloca los archivos de tu fuente en esta carpeta
2. Renómbralos según los nombres arriba, o
3. Edita la regla `@font-face` en `/src/pages/index.astro` para usar tus nombres de archivo

## Ejemplo de conversión:

Si tienes un archivo `.ttf`, puedes convertirlo a `.woff` y `.woff2` usando:

- [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
- [Transfonter](https://transfonter.org/)
- O herramientas de línea de comandos como `fonttools`

## Formato actual:

Por defecto, la aplicación busca:

```
/public/fonts/custom-font.woff2
/public/fonts/custom-font.woff
/public/fonts/custom-font.ttf
```

Si no se encuentran, usará la fuente fallback: Georgia, serif.
