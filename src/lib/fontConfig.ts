export interface LetterStyle {
  feature: string;
  label: string;
  emoji: string;
}

export interface FontConfig {
  value: string;
  label: string;
  family: string;
  styles: LetterStyle[];
}

export const FONT_CONFIGS: FontConfig[] = [
  {
    value: "CustomFont",
    label: "Josephsophia",
    family: "CustomFont, Georgia, serif",
    styles: [
      { feature: "normal", label: "Normal", emoji: "📝" },
      { feature: "ss01", label: "Corazón final", emoji: "❤️" },
      { feature: "ss02", label: "Línea inicio", emoji: "✨❤️" },
      { feature: "ss03", label: "Línea final", emoji: "🎨" },
    ],
  },
  {
    value: "ChristmasSantona",
    label: "Christmas & Santona",
    family: "ChristmasSantona, cursive",
    styles: [{ feature: "normal", label: "Normal", emoji: "📝" }],
  },
  {
    value: "ChristmasIcons",
    label: "Christmas Icons",
    family: "ChristmasIcons, serif",
    styles: [
      { feature: "normal", label: "Normal", emoji: "📝" },
      // Esta fuente probablemente solo tiene íconos, sin stylistic sets
    ],
  },
  {
    value: "F25Executive",
    label: "F25 Executive",
    family: "F25Executive, sans-serif",
    styles: [{ feature: "normal", label: "Normal", emoji: "📝" }],
  },
];

export const AVAILABLE_FONTS = FONT_CONFIGS.map((config) => ({
  value: config.value,
  label: config.label,
  family: config.family,
}));

export type FontValue = (typeof AVAILABLE_FONTS)[number]["value"];

export function getFontConfig(fontValue: string): FontConfig | undefined {
  return FONT_CONFIGS.find((config) => config.value === fontValue);
}

export function getFontFamily(fontValue: string): string {
  const config = getFontConfig(fontValue);
  return config ? config.family : "CustomFont, Georgia, serif";
}

export function getFontStyles(fontValue: string): LetterStyle[] {
  const config = getFontConfig(fontValue);
  return config ? config.styles : [];
}
