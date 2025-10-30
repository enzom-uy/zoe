export interface CharStyle {
  index: number;
  feature: string;
  font?: string; // Para edición avanzada: fuente por carácter
  color?: string; // Para edición avanzada: color por carácter
}

export interface NameItem {
  id: string;
  name: string;
  font: string; // Fuente principal del nombre
  color: string; // Color principal del nombre (hex)
  charStyles?: CharStyle[];
  fontSize?: number;
  textAlign?: "left" | "center" | "right"; // Alineación del texto
  lineHeight?: number; // Espaciado entre líneas
}

export type CommandMode = "main" | "edit" | "delete";

export interface LetterStyle {
  feature: string;
  label: string;
  emoji: string;
}
