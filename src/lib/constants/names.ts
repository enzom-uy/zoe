import type { LetterStyle } from "../types/names";

export const STORAGE_KEYS = {
  NAMES_LIST: "names-list",
  FONT_SIZE: "names-font-size",
  HINT_DISMISSED: "names-hint-dismissed",
  COMMAND_USED: "command-used",
} as const;

export const LETTER_STYLES: LetterStyle[] = [
  { feature: "normal", label: "Normal", emoji: "📝" },
  { feature: "ss01", label: "Corazón final", emoji: "❤️" },
  { feature: "ss02", label: "Línea inicio", emoji: "✨❤️" },
  { feature: "ss03", label: "Línea final", emoji: "🎨" },
];

export const DEFAULT_FONT_SIZE = 12;
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 72;
