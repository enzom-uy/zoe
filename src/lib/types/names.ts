export interface CharStyle {
  index: number;
  feature: string;
  font?: string; // Para edición avanzada: fuente por carácter
}

export interface NameItem {
  id: string;
  name: string;
  font: string; // Fuente principal del nombre
  charStyles?: CharStyle[];
  fontSize?: number;
}

export type CommandMode = "main" | "edit" | "delete";

export interface LetterStyle {
  feature: string;
  label: string;
  emoji: string;
}
